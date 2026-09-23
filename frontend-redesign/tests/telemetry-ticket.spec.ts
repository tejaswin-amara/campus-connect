import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Real-Time Event Telemetry & Ticket Pass Pass Verification', () => {
  test('Student can register for an event, receive a verified SVG QR ticket pass, and pass WCAG 2.1 AA checks', async ({
    page,
  }) => {
    await page.goto('/');

    // Ensure catalogue is loaded
    const detailsButtons = page.getByRole('button', { name: /view details/i });
    await expect(detailsButtons.first()).toBeVisible();

    // Open first event drawer
    await detailsButtons.first().click();

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();

    // Verify Register button is visible and click it
    const registerBtn = page.getByRole('button', { name: /one-click register/i });
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();

    // TicketPassModal should pop up
    const ticketModalTitle = page.getByText(/official admission pass/i);
    await expect(ticketModalTitle).toBeVisible();

    // Verify SVG QR Code is rendered with accessible img role
    const qrCode = page.getByRole('img', { name: /qr code for ticket/i });
    await expect(qrCode).toBeVisible();

    // Verify Ticket Passcode is visible
    await expect(page.getByText(/ticket passcode/i)).toBeVisible();

    // Verify Action buttons (Print Pass, Save JSON, Done)
    await expect(page.getByRole('button', { name: /print pass/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save json/i })).toBeVisible();
    const doneBtn = page.getByRole('button', { name: /done/i });
    await expect(doneBtn).toBeVisible();

    // Run Axe automated accessibility audit on the ticket pass modal
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Close ticket pass modal
    await doneBtn.click();
    await expect(ticketModalTitle).not.toBeVisible();
  });

  test('Organizer Workspace Live Attendance Ticker renders and meets accessibility standards', async ({
    page,
  }) => {
    // Authenticate as club organizer
    await page.goto('/');

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

    // Navigate to Club Studio
    const clubStudioPill = page.getByRole('banner').getByRole('button', { name: /club studio/i });
    await clubStudioPill.click();

    // Switch to Live Check-in Engine tab
    const scannerTab = page.getByRole('tab', { name: /live check-in engine/i });
    await expect(scannerTab).toBeVisible();
    await scannerTab.click();

    // Verify Live Attendance Broadcast ticker component is rendered
    await expect(page.getByText(/live attendance broadcast/i)).toBeVisible();
    await expect(page.getByText(/live stream scans/i)).toBeVisible();

    // Run Axe automated accessibility audit on the organizer scanner & live broadcast view
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
