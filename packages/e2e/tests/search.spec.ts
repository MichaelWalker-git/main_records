import { test, expect } from '../fixtures/auth';

test.describe('Search', () => {
  test('renders all four mode tabs with descriptions', async ({ adminPage: page }) => {
    await page.goto('/search');
    await expect(page.getByTestId('search-page')).toBeVisible();
    await expect(page.getByTestId('search-tab-metadata')).toBeVisible();
    await expect(page.getByTestId('search-tab-fulltext')).toBeVisible();
    await expect(page.getByTestId('search-tab-semantic')).toBeVisible();
    await expect(page.getByTestId('search-tab-ocr')).toBeVisible();
    await expect(page.getByTestId('search-mode-description')).toBeVisible();
  });

  test('switching mode tab updates the description', async ({ adminPage: page }) => {
    await page.goto('/search');
    const desc = page.getByTestId('search-mode-description');
    const initial = await desc.textContent();
    await page.getByTestId('search-tab-semantic').click();
    await expect(desc).not.toHaveText(initial!);
  });
});
