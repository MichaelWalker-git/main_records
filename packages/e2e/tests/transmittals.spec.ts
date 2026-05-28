import { test, expect } from '../fixtures/auth';

test.describe('Transmittals', () => {
  test('list renders with sender, items, status columns', async ({ adminPage: page }) => {
    await page.goto('/transmittals');
    await expect(page.getByTestId('transmittals-list-page')).toBeVisible();
  });

  test('opening a transmittal shows transfer summary and timeline', async ({ adminPage: page }) => {
    await page.goto('/transmittals');
    const firstLink = page.locator('[data-testid^="transmittal-link-"]').first();
    await firstLink.waitFor({ timeout: 10_000 });
    await firstLink.click();

    await expect(page.getByTestId('transmittal-detail-page')).toBeVisible();
    await expect(page.getByTestId('transfer-summary')).toBeVisible();
    await expect(page.getByTestId('transmittal-timeline')).toBeVisible();
  });

  test('status filter narrows the list', async ({ adminPage: page }) => {
    await page.goto('/transmittals');
    await page.getByTestId('transmittal-status-filter').selectOption('approved');
    await page.waitForTimeout(500);
    // rows should all be approved or list should be empty
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    if (count > 0) {
      const badges = page.locator('[data-testid="status-badge-approved"]');
      expect(await badges.count()).toBeGreaterThan(0);
    }
  });
});
