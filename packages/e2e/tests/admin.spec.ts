import { test, expect } from '../fixtures/auth';

test.describe('Admin shell', () => {
  test('renders all admin tabs', async ({ adminPage: page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('admin-shell-page')).toBeVisible();
    await expect(page.getByTestId('admin-tab-users')).toBeVisible();
    await expect(page.getByTestId('admin-tab-templates')).toBeVisible();
    await expect(page.getByTestId('admin-tab-retention')).toBeVisible();
    await expect(page.getByTestId('admin-tab-integrations')).toBeVisible();
    await expect(page.getByTestId('admin-tab-notifications')).toBeVisible();
    await expect(page.getByTestId('admin-tab-audit')).toBeVisible();
  });

  test('switching tabs updates URL', async ({ adminPage: page }) => {
    await page.goto('/admin');
    await page.getByTestId('admin-tab-templates').click();
    await expect(page).toHaveURL(/\/admin\/templates/);
    await page.getByTestId('admin-tab-integrations').click();
    await expect(page).toHaveURL(/\/admin\/integrations/);
  });
});

test.describe('Notifications preferences', () => {
  test('Save button is disabled with no changes and enables on toggle', async ({ adminPage: page }) => {
    await page.goto('/admin/notifications');
    await expect(page.getByTestId('save-prefs-button')).toBeDisabled();

    await page.getByTestId('toggle-retention_alert-email').click();
    await expect(page.getByTestId('save-prefs-button')).toBeEnabled();
  });

  test('Save persists toggle across reload', async ({ adminPage: page }) => {
    await page.goto('/admin/notifications');
    const toggle = page.getByTestId('toggle-overdue_notice-email');
    const before = await toggle.getAttribute('aria-pressed');
    await toggle.click();
    await page.getByTestId('save-prefs-button').click();
    await expect(page.getByTestId('save-prefs-button')).toBeDisabled({ timeout: 5_000 });

    await page.reload();
    await page.waitForLoadState('networkidle');
    const after = await page.getByTestId('toggle-overdue_notice-email').getAttribute('aria-pressed');
    expect(after).not.toBe(before);
  });
});

test.describe('Integrations Test Connection', () => {
  test('Test Connection button surfaces a result', async ({ adminPage: page }) => {
    await page.goto('/admin/integrations');
    const buttons = page.getByText('Test Connection');
    const count = await buttons.count();
    if (count === 0) test.skip(true, 'No integrations to test');

    await buttons.first().click();
    // Either a success/error/warning toast or an inline result box
    const toast = page.locator('[role="alert"]').filter({ hasText: /test|connect|fail|ok/i }).first();
    const inlineResult = page.locator('[data-testid^="test-result-"]').first();
    await expect(toast.or(inlineResult)).toBeVisible({ timeout: 10_000 });
  });
});
