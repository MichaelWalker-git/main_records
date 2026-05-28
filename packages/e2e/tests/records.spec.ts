import { test, expect } from '../fixtures/auth';

test.describe('Records list', () => {
  test('renders KPI bar and table', async ({ adminPage: page }) => {
    await page.goto('/records');
    await expect(page.getByTestId('records-list-page')).toBeVisible();
    await expect(page.getByTestId('records-kpi-bar')).toBeVisible();
    await expect(page.getByTestId('data-table')).toBeVisible();
  });

  test('opens record detail when clicking a row link', async ({ adminPage: page }) => {
    await page.goto('/records');
    const firstLink = page.locator('[data-testid^="record-link-"]').first();
    await firstLink.waitFor();
    const href = await firstLink.getAttribute('href');
    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/\//g, '\\/')));
    await expect(page.getByTestId('record-detail-page')).toBeVisible();
  });

  test('row action menu opens with View / Edit / AI Classify / Delete', async ({ adminPage: page }) => {
    await page.goto('/records');
    const firstTrigger = page.getByTestId('dropdown-trigger').first();
    await firstTrigger.click();
    await expect(page.getByTestId('dropdown-item-view')).toBeVisible();
    await expect(page.getByTestId('dropdown-item-edit')).toBeVisible();
    await expect(page.getByTestId('dropdown-item-classify')).toBeVisible();
    await expect(page.getByTestId('dropdown-item-delete')).toBeVisible();
  });

  test('AI Classify shows starting toast and inline spinner', async ({ adminPage: page }) => {
    await page.goto('/records');
    const firstTrigger = page.getByTestId('dropdown-trigger').first();
    await firstTrigger.click();
    await page.getByTestId('dropdown-item-classify').click();

    await expect(page.getByText('AI classification started')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Classifying...').first()).toBeVisible({ timeout: 5_000 });
  });

  test('status filter narrows the list', async ({ adminPage: page }) => {
    await page.goto('/records');
    await page.getByTestId('status-filter').selectOption('on_hold');
    // Either rows render with on_hold badge or the empty state appears
    await page.waitForTimeout(500);
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount > 0) {
      const badges = page.getByTestId(/^status-badge-/);
      const badgeCount = await badges.count();
      for (let i = 0; i < badgeCount; i++) {
        const testId = await badges.nth(i).getAttribute('data-testid');
        // expect status to be on_hold (possibly mixed with overlay/empty rows)
        expect(testId).toContain('on_hold');
      }
    }
  });
});
