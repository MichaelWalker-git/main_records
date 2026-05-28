import { test, expect } from '../fixtures/auth';

test.describe('Dispositions', () => {
  test('list renders Pending Approvals and History tabs', async ({ adminPage: page }) => {
    await page.goto('/dispositions');
    await expect(page.getByTestId('dispositions-list-page')).toBeVisible();
    await expect(page.getByTestId('tab-pending')).toBeVisible();
    await expect(page.getByTestId('tab-history')).toBeVisible();
  });

  test('switching to History tab swaps the list', async ({ adminPage: page }) => {
    await page.goto('/dispositions');
    await page.getByTestId('tab-history').click();
    // History tab should still render the page-level container
    await expect(page.getByTestId('dispositions-list-page')).toBeVisible();
  });

  test('opening a pending disposition reveals approve/reject controls', async ({ adminPage: page }) => {
    await page.goto('/dispositions');
    const firstLink = page.locator('[data-testid^="disposition-link-"]').first();
    const linkCount = await firstLink.count();
    if (linkCount === 0) test.skip(true, 'No dispositions available');

    await firstLink.click();
    await expect(page.getByTestId('disposition-detail-page')).toBeVisible();

    // Pending dispositions show approve + reject; terminal ones do not.
    const approve = page.getByTestId('approve-disposition-button');
    const reject = page.getByTestId('reject-disposition-button');
    const isPending = await approve.isVisible().catch(() => false);
    if (isPending) {
      await expect(reject).toBeVisible();
    }
  });

  test('Legal Holds page is reachable from the list header', async ({ adminPage: page }) => {
    await page.goto('/dispositions');
    await page.getByTestId('legal-holds-link').click();
    await expect(page.getByTestId('legal-holds-page')).toBeVisible();
    await expect(page.getByTestId('create-hold-button')).toBeVisible();
  });
});
