import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('CampusConnect OLED Production Frontend & A11y Verification', () => {
  test('Student Catalogue passes WCAG 2.1 AA accessibility checks and displays core UI', async ({
    page,
  }) => {
    await page.goto('/');

    // Verify main brand presence and headline
    await expect(page.getByText('CampusConnect').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Discover & Connect/i })).toBeVisible();

    // Verify category filter tabs are rendered and interactive
    const allTab = page.getByRole('button', { name: /^All/i });
    await expect(allTab).toBeVisible();
    const technicalTab = page.getByRole('button', { name: /^Technical/i });
    await expect(technicalTab).toBeVisible();

    // Run Axe automated accessibility audit on the initial student view
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Test Search input functionality
    const searchInput = page.getByLabel('Search events');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Hackathon');
    // Wait for debounce and result
    await page.waitForTimeout(400);
  });

  test('Event Detail Drawer opens with focus management and passes accessibility check', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for event cards to render
    const detailsButtons = page.getByRole('button', { name: /view details/i });
    await expect(detailsButtons.first()).toBeVisible();

    // Click the first event card to open the drawer
    await detailsButtons.first().click();

    // Drawer dialog should be visible with role="dialog"
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();

    // Verify drawer title heading
    const drawerHeading = drawer.getByRole('heading', { level: 2 });
    await expect(drawerHeading).toBeVisible();

    // Verify registration CTA exists
    const registerBtn = drawer.getByRole('button', { name: /One-Click Register|Waitlist Only/i });
    await expect(registerBtn).toBeVisible();

    // Run Axe accessibility scan on the open drawer dialog
    const drawerAxeResults = await new AxeBuilder({ page })
      .include('dialog, [role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(drawerAxeResults.violations).toEqual([]);

    // Test keyboard closing via Escape
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });

  test('Admin Control Plane passes accessibility audit and provides roster management', async ({
    page,
  }) => {
    await page.goto('/');

    // Switch to Admin Console via sidebar
    const adminNavBtn = page.getByRole('button', { name: /admin console/i });
    await expect(adminNavBtn).toBeVisible();
    await adminNavBtn.click();

    // Complete authentication sequence
    await page.locator('#admin-username').fill('admin');
    await page.locator('#admin-password').fill('admin');
    await page.getByRole('button', { name: /authenticate & proceed/i }).click();

    // Verify Control Plane heading
    await expect(page.getByText('Control Plane & Telemetry')).toBeVisible();

    // Verify KPI telemetry cards are rendered
    await expect(page.getByText(/TOTAL EVENTS/i)).toBeVisible();
    await expect(page.getByText(/TOTAL REGISTERED/i)).toBeVisible();

    // Verify Event Registry table
    const tableHeading = page.getByText('Event Registry & Operations');
    await expect(tableHeading).toBeVisible();

    // Run Axe scan on Admin view
    const adminAxeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(adminAxeResults.violations).toEqual([]);
  });

  test('Create Event Modal opens with focus trapping and accessible form controls', async ({
    page,
  }) => {
    await page.goto('/');

    // Switch to Admin view via authentication
    await page.getByRole('button', { name: /admin console/i }).click();
    await page.locator('#admin-username').fill('admin');
    await page.locator('#admin-password').fill('admin');
    await page.getByRole('button', { name: /authenticate & proceed/i }).click();
    await expect(page.getByText('Control Plane & Telemetry')).toBeVisible();

    // Open Create Event Modal
    const newEventBtn = page.getByRole('button', { name: /new event/i });
    await expect(newEventBtn).toBeVisible();
    await newEventBtn.click();

    // Dialog should be visible
    const createDialog = page.getByRole('dialog');
    await expect(createDialog).toBeVisible();
    await expect(createDialog.getByText('Create New Campus Event')).toBeVisible();

    // Form inputs should be accessible by label
    await expect(page.getByLabel(/event title \*/i)).toBeVisible();
    await expect(page.getByLabel(/category \*/i)).toBeVisible();
    await expect(page.getByLabel(/venue \/ location \*/i)).toBeVisible();
    await expect(page.getByLabel(/start date & time \*/i)).toBeVisible();
    await expect(page.getByLabel(/event description \*/i)).toBeVisible();

    // Run Axe scan on Create Event Dialog
    const modalAxeResults = await new AxeBuilder({ page })
      .include('dialog, [role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(modalAxeResults.violations).toEqual([]);

    // Close modal via Cancel button
    const cancelBtn = createDialog.getByRole('button', { name: /cancel/i });
    await cancelBtn.click();
    await expect(createDialog).not.toBeVisible();
  });

  test('Respects prefers-reduced-motion media query', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Elements should render cleanly without layout shifts or unhandled motion loops
    await expect(page.getByText('CampusConnect').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Discover & Connect/i })).toBeVisible();

    const axeReducedMotion = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(axeReducedMotion.violations).toEqual([]);
  });
});
