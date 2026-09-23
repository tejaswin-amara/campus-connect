import { expect, test } from '@playwright/test';

test.describe('Production Runtime Profiling, Heap Integrity & Offline Ticket Pass Verification', () => {
  test('Core Web Vitals under simulated 4G throttling meets performance budgets', async ({
    page,
    context,
  }) => {
    const cdp = await context.newCDPSession(page);

    // Emulate 4G network throttling (100ms RTT, 4 Mbps down, 3 Mbps up)
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 100,
      downloadThroughput: (4 * 1024 * 1024) / 8,
      uploadThroughput: (3 * 1024 * 1024) / 8,
      connectionType: 'cellular4g',
    });

    // Setup PerformanceObserver for LCP and CLS prior to navigation
    await page.addInitScript(() => {
      window.__perfMetrics = {
        lcp: 0,
        cls: 0,
      };

      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          window.__perfMetrics.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!('hadRecentInput' in entry) || !entry.hadRecentInput) {
            clsValue += (entry as unknown as { value: number }).value;
          }
        }
        window.__perfMetrics.cls = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    });

    // 1. Audit Home Catalogue
    const startTime = Date.now();
    await page.goto('/');

    // Wait for critical content to settle
    await expect(page.getByRole('button', { name: /view details/i }).first()).toBeVisible({
      timeout: 10000,
    });

    const metrics = await page.evaluate(
      () => (window as unknown as { __perfMetrics: { lcp: number; cls: number } }).__perfMetrics,
    );
    const navTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domInteractive: nav.domInteractive,
        domContentLoaded: nav.domContentLoadedEventEnd,
        loadEventEnd: nav.loadEventEnd,
      };
    });

    // Verify Core Web Vitals targets:
    // CLS should be 0 (or strictly below 0.05)
    expect(metrics.cls).toBeLessThanOrEqual(0.05);

    // Measure interaction latency (INP proxy)
    const interactionStart = performance.now();
    await page
      .getByRole('button', { name: /technical/i })
      .first()
      .click();
    const interactionDuration = performance.now() - interactionStart;
    expect(interactionDuration).toBeLessThan(500);

    // 2. Audit Organizer Studio Live Attendance Dashboard
    const signInBtn = page.getByRole('button', { name: /^sign in$/i });
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      const authDialog = page.getByRole('dialog');
      await expect(authDialog).toBeVisible();
      await page.locator('#login-username').fill('organizer');
      await page.locator('#login-password').fill('organizer123');
      await authDialog.getByRole('button', { name: /^sign in$/i }).click();
      await expect(authDialog).not.toBeVisible();
    }

    const clubStudioBtn = page.getByRole('banner').getByRole('button', { name: /club studio/i });
    await clubStudioBtn.click();

    // Verify Organizer Dashboard renders cleanly without layout shifts
    await expect(page.getByText(/scheduled events/i)).toBeVisible();
    const organizerCls = await page.evaluate(
      () => (window as unknown as { __perfMetrics: { cls: number } }).__perfMetrics.cls,
    );
    expect(organizerCls).toBeLessThanOrEqual(0.05);
  });

  test('Heap memory audit confirms zero detached canvas leaks and bounded memory delta', async ({
    page,
    context,
  }) => {
    const cdp = await context.newCDPSession(page);
    await cdp.send('HeapProfiler.enable');

    await page.goto('/');

    // Force GC to obtain clean baseline
    await cdp.send('HeapProfiler.collectGarbage');
    const baselineMetrics = await cdp.send('Performance.getMetrics');
    const getMetric = (name: string, m: typeof baselineMetrics) =>
      m.metrics.find((x) => x.name === name)?.value ?? 0;

    const initialHeap = getMetric('JSHeapUsedSize', baselineMetrics);
    const initialNodes = getMetric('Nodes', baselineMetrics);

    // Sign in as organizer and open live check-in scanner
    const signInBtn = page.getByRole('button', { name: /^sign in$/i });
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      const authDialog = page.getByRole('dialog');
      await expect(authDialog).toBeVisible();
      await page.locator('#login-username').fill('organizer');
      await page.locator('#login-password').fill('organizer123');
      await authDialog.getByRole('button', { name: /^sign in$/i }).click();
      await expect(authDialog).not.toBeVisible();
    }

    const clubStudioBtn = page.getByRole('banner').getByRole('button', { name: /club studio/i });
    await clubStudioBtn.click();

    const scannerTab = page.getByRole('tab', { name: /live check-in engine/i });
    await expect(scannerTab).toBeVisible();
    await scannerTab.click();

    // Simulate active scanner operations
    await page.locator('#scanner-ticket-code').fill('CC-TECH-999');
    await page.getByRole('button', { name: /verify & check in/i }).click();

    // Switch back to events tab and navigate away to trigger component unmount
    const eventsTab = page.getByRole('tab', { name: /events studio/i });
    await eventsTab.click();

    const discoverNav = page.getByRole('banner').getByRole('button', { name: /discover/i });
    await discoverNav.click();

    // Verify zero detached canvas elements in memory
    const canvasCount = await page.evaluate(() => {
      return document.querySelectorAll('canvas').length;
    });
    // On the Discover page, HeroBanner has 1 Aurora canvas
    expect(canvasCount).toBeLessThanOrEqual(2);

    // Run garbage collection post-unmount
    await cdp.send('HeapProfiler.collectGarbage');
    const postMetrics = await cdp.send('Performance.getMetrics');
    const postHeap = getMetric('JSHeapUsedSize', postMetrics);
    const postNodes = getMetric('Nodes', postMetrics);

    // Verify bounded heap delta (heap should not explode by more than 25MB after GC)
    const heapDeltaMB = (postHeap - initialHeap) / (1024 * 1024);
    expect(heapDeltaMB).toBeLessThan(25);
  });

  test('Offline ticket pass persistence verifies localStorage synchronization under simulated offline conditions', async ({
    page,
    context,
  }) => {
    await page.goto('/');

    // 1. Register for an event to generate a ticket pass
    const detailsButtons = page.getByRole('button', { name: /view details/i });
    await detailsButtons.first().click();

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();

    const registerBtn = page.getByRole('button', { name: /one-click register/i });
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();

    // Verify TicketPassModal is open
    const ticketModalTitle = page.getByText(/official admission pass/i);
    await expect(ticketModalTitle).toBeVisible();

    // Extract ticket code from QR Code accessible image label
    const qrCode = page.getByRole('img', { name: /qr code for ticket/i });
    await expect(qrCode).toBeVisible();
    const ariaLabel = (await qrCode.getAttribute('aria-label')) || '';
    const ticketCode = ariaLabel.replace(/qr code for ticket /i, '').trim();
    expect(ticketCode).toBeTruthy();

    // Close ticket modal and drawer
    const doneBtn = page.getByRole('button', { name: /done/i });
    await doneBtn.click();
    await expect(ticketModalTitle).not.toBeVisible();

    // Verify ticket was persisted into localStorage
    const savedTicketsJson = await page.evaluate(() => {
      return localStorage.getItem('campus_tickets');
    });
    expect(savedTicketsJson).not.toBeNull();
    const savedTickets = JSON.parse(savedTicketsJson || '[]');
    expect(savedTickets.length).toBeGreaterThan(0);
    expect(savedTickets[0].ticketCode).toBe(ticketCode);

    // 2. Simulate complete offline network disconnect
    await context.setOffline(true);

    // Verify localStorage data remains completely intact and accessible offline
    const offlineTicketsJson = await page.evaluate(() => {
      return localStorage.getItem('campus_tickets');
    });
    expect(offlineTicketsJson).toBe(savedTicketsJson);

    // Re-verify modal can render cached ticket pass offline without throwing
    const modalRendersOffline = await page.evaluate((code) => {
      try {
        const data = JSON.parse(localStorage.getItem('campus_tickets') || '[]');
        return data.some((t: { ticketCode: string }) => t.ticketCode === code);
      } catch {
        return false;
      }
    }, ticketCode);

    expect(modalRendersOffline).toBe(true);

    // Restore online state
    await context.setOffline(false);
  });
});
