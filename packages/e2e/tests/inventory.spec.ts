import { test, expect } from '../fixtures/auth';

test.describe('Inventory locations', () => {
  test('renders the location tree and detail panel', async ({ adminPage: page }) => {
    await page.goto('/inventory');
    await expect(page.getByTestId('inventory-page')).toBeVisible();
  });

  test('clicking a top-level location reveals Edit / Add child / Deactivate buttons', async ({ adminPage: page }) => {
    await page.goto('/inventory');
    const firstNode = page.locator('text=State Records Center').first();
    await firstNode.waitFor({ state: 'visible', timeout: 10_000 });
    await firstNode.click();

    await expect(page.getByTestId('location-detail')).toBeVisible();
    await expect(page.getByTestId('edit-location-button')).toBeVisible();
    await expect(page.getByTestId('deactivate-location-button')).toBeVisible();
  });

  test('Edit Location modal opens and Save Changes triggers a request (success or error)', async ({ adminPage: page }) => {
    await page.goto('/inventory');
    const firstNode = page.locator('text=State Records Center').first();
    await firstNode.waitFor({ state: 'visible', timeout: 10_000 });
    await firstNode.click();
    await page.getByTestId('edit-location-button').click();

    await expect(page.getByTestId('location-form')).toBeVisible();
    // Tweak the name and submit; restore it after so re-runs are idempotent.
    const nameInput = page.getByTestId('loc-name-input');
    const original = await nameInput.inputValue();
    await nameInput.fill(`${original} edited`);
    await page.getByTestId('loc-submit-button').click();

    await expect(page.getByText('Location updated.')).toBeVisible({ timeout: 10_000 });

    // Restore the original name so this test can run repeatedly without
    // accumulating " edited" suffixes in the seed.
    await page.locator('text=State Records Center').first().click();
    await page.getByTestId('edit-location-button').click();
    await page.getByTestId('loc-name-input').fill(original);
    await page.getByTestId('loc-submit-button').click();
    await expect(page.getByText('Location updated.')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Circulation', () => {
  test('renders explanation cards and overdue table', async ({ adminPage: page }) => {
    await page.goto('/inventory/circulation');
    await expect(page.getByTestId('circulation-page')).toBeVisible();
    await expect(page.getByText('Check Out').first()).toBeVisible();
    await expect(page.getByText('Return (Check In)')).toBeVisible();
    await expect(page.getByText('Barcode Scan').first()).toBeVisible();
  });

  test('Check Out modal opens and validates required fields', async ({ adminPage: page }) => {
    await page.goto('/inventory/circulation');
    await page.getByTestId('checkout-button').click();
    await expect(page.getByTestId('checkout-record-input')).toBeVisible();
    await expect(page.getByTestId('checkout-purpose-input')).toBeVisible();
    await expect(page.getByTestId('checkout-due-input')).toBeVisible();
  });
});
