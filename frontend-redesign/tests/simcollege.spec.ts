import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('SimCollege Accessible 2:1 Dimetric Campus Map E2E Verification', () => {
  test('SimCollege loads, renders canvas and toolbar, and passes WCAG 2.2 AA accessibility audit', async ({
    page,
  }) => {
    await page.goto('/');

    // Navigate to SimCollege Map via Sidebar
    const simCollegeNavBtn = page.getByRole('button', { name: /SimCollege Map/i });
    await expect(simCollegeNavBtn).toBeVisible();
    await simCollegeNavBtn.click();

    // Verify SimCollege heading and subtitle
    await expect(
      page.getByRole('heading', { name: /SimCollege: Campus Spatial Map/i })
    ).toBeVisible();

    // Verify SVG interactive canvas container
    const canvasContainer = page.getByTestId('simcollege-canvas-container');
    await expect(canvasContainer).toBeVisible();

    // Verify Map Toolbar controls
    const toolbar = page.getByRole('toolbar', { name: /Map Controls/i });
    await expect(toolbar).toBeVisible();
    await expect(page.getByTestId('toolbar-zoom-in')).toBeVisible();
    await expect(page.getByTestId('toolbar-zoom-out')).toBeVisible();
    await expect(page.getByTestId('toolbar-recenter')).toBeVisible();

    // Run Axe automated accessibility audit on the SimCollege map view
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(axeResults.violations).toEqual([]);
  });

  test('SimCollege allows pin selection, displays accessible event popup, and confirms attendance', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /SimCollege Map/i }).click();

    // Find first event pin
    const pin = page.getByTestId('event-pin-101');
    await expect(pin).toBeVisible();
    await pin.click();

    // Verify event details popup dialog
    const popup = page.getByTestId('event-detail-popup');
    await expect(popup).toBeVisible();
    await expect(popup.getByRole('heading', { name: /Spring Hackathon 2026/i })).toBeVisible();

    // Click "Confirm Attendance"
    const confirmBtn = popup.getByRole('button', { name: /Confirm Attendance/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Popup should dismiss
    await expect(popup).not.toBeVisible();
  });

  test('SimCollege synchronizes dual-modality list and map view with spatial announcements', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /SimCollege Map/i }).click();

    // Locate button in the synchronized list
    const locateBtn = page
      .getByRole('button', { name: /Locate on Map: Spring Hackathon 2026/i })
      .first();
    await expect(locateBtn).toBeVisible();
    await locateBtn.click();

    // Spatial announcer output reflects location
    const announcer = page.getByTestId('spatial-announcer');
    await expect(announcer).toContainText(/Centered map/i);
  });

  test('SimCollege switches between Split, Map-only, and List-only modalities', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /SimCollege Map/i }).click();

    // Switch to Map only
    await page.getByTestId('modality-map').click();
    await expect(page.getByTestId('simcollege-canvas-container')).toBeVisible();
    await expect(
      page.getByRole('region', { name: /Campus Event Schedule & Locations/i })
    ).not.toBeVisible();

    // Switch to List only
    await page.getByTestId('modality-list').click();
    await expect(page.getByTestId('simcollege-canvas-container')).not.toBeVisible();
    await expect(
      page.getByRole('region', { name: /Campus Event Schedule & Locations/i })
    ).toBeVisible();

    // Restore Split view
    await page.getByTestId('modality-split').click();
    await expect(page.getByTestId('simcollege-canvas-container')).toBeVisible();
    await expect(
      page.getByRole('region', { name: /Campus Event Schedule & Locations/i })
    ).toBeVisible();
  });
});
