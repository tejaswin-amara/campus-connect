import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('CampusConnect Multi-Role Auth & Club Lead Workspace RBAC', () => {
  test('Student Registration and Onboarding Flow', async ({ page }) => {
    await page.goto('/');

    // Open Auth Modal via header Sign In
    const signInBtn = page.getByRole('button', { name: /^sign in$/i });
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();

    // Verify modal is visible
    const authDialog = page.getByRole('dialog');
    await expect(authDialog).toBeVisible();

    // Switch to Create Account tab
    const onboardingTab = authDialog.getByRole('tab', { name: /create account/i });
    await expect(onboardingTab).toBeVisible();
    await onboardingTab.click();

    // Fill student registration form
    await page.locator('#reg-username').fill('klh_student_01');
    await page.locator('#reg-email').fill('2100030110@klh.edu.in');
    await page.locator('#reg-password').fill('StudentPass2026!');
    await page.locator('#reg-roll').fill('2100030110');
    await page.locator('#reg-dept').fill('Computer Science');

    // Submit registration
    const registerSubmitBtn = authDialog.getByRole('button', { name: /complete onboarding/i });
    await registerSubmitBtn.click();

    // Wait for modal to close
    await expect(authDialog).not.toBeVisible();

    // Verify user profile badge in header shows STUDENT role
    await expect(page.getByRole('banner').getByText('klh_student_01')).toBeVisible();
    await expect(page.getByRole('banner').getByText('STUDENT', { exact: true })).toBeVisible();
  });

  test('Club Studio Access Control & RoleGuard Enforcement', async ({ page }) => {
    await page.goto('/');

    // Attempt to access Club Studio without login
    const clubStudioPill = page.getByRole('banner').getByRole('button', { name: /club studio/i });
    await clubStudioPill.click();

    // Unauthenticated user triggers sign in modal
    const authDialog = page.getByRole('dialog');
    await expect(authDialog).toBeVisible();
    await expect(authDialog.getByText('Campus Portal Sign In')).toBeVisible();

    // Sign in as student
    await page.locator('#login-username').fill('student_user');
    await page.locator('#login-password').fill('pass1234');
    await authDialog.getByRole('button', { name: /^sign in$/i }).click();

    // Wait for modal to close
    await expect(authDialog).not.toBeVisible();

    // Now try to open Club Studio as student
    await clubStudioPill.click();

    // RoleGuard should reject student from Organizer workspace
    await expect(page.getByRole('main').getByText('Restricted Clearance')).toBeVisible();
    await expect(page.getByRole('main').getByText('ROLE_STUDENT')).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('button', { name: /switch account/i }),
    ).toBeVisible();
  });

  test('Organizer Workspace Management, Check-In, and A11y Verification', async ({ page }) => {
    await page.goto('/');

    // Open Auth Modal
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Sign in with organizer credentials
    await page.locator('#login-username').fill('organizer');
    await page.locator('#login-password').fill('organizer123');
    const authDialog = page.getByRole('dialog');
    await authDialog.getByRole('button', { name: /^sign in$/i }).click();

    // Wait for modal to close
    await expect(authDialog).not.toBeVisible();

    // Verify user is recognized as ORGANIZER
    await expect(page.getByRole('banner').getByText('organizer', { exact: true })).toBeVisible();
    await expect(page.getByRole('banner').getByText('ORGANIZER', { exact: true })).toBeVisible();

    // Navigate to Club Studio
    const clubStudioPill = page.getByRole('banner').getByRole('button', { name: /club studio/i });
    await clubStudioPill.click();

    // Verify Organizer Dashboard loaded
    await expect(
      page.getByRole('main').getByRole('heading', { level: 1, name: /ACM Student Chapter/i }),
    ).toBeVisible();
    await expect(page.getByRole('main').getByText('Scheduled Events')).toBeVisible();

    // Verify Check-in scanner tab
    const scannerTab = page.getByRole('tab', { name: /live check-in engine/i });
    await expect(scannerTab).toBeVisible();
    await scannerTab.click();

    await expect(page.getByText('OPTICAL SCANNER READY')).toBeVisible();

    // Verify Roster tab
    const rosterTab = page.getByRole('tab', { name: /attendee roster/i });
    await expect(rosterTab).toBeVisible();
    await rosterTab.click();

    await expect(page.getByText('Attendee Roster Governance')).toBeVisible();
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible();

    // Run Axe automated accessibility scan on Organizer Dashboard
    const organizerAxeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(organizerAxeResults.violations).toEqual([]);
  });
});
