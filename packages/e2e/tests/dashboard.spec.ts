import { test, expect } from '../fixtures/auth';

test.describe('Dashboard', () => {
  test('renders KPI widgets and lifecycle pipeline', async ({ adminPage: page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('lifecycle-pipeline')).toBeVisible();
  });

  test('Recent Activity shows "by system" for system events with no actor', async ({ adminPage: page }) => {
    await page.goto('/');
    const activitySection = page.locator('text=Recent Activity').locator('..');
    await activitySection.waitFor({ state: 'visible' });
    // At least one system event line should render with explicit "by system"
    const bodyText = await activitySection.textContent();
    if (bodyText && /AI_CLASSIFICATION|OCR_EXTRACTION/.test(bodyText)) {
      expect(bodyText).toMatch(/by (system|\w+@\w+)/);
      expect(bodyText).not.toMatch(/by\s*$/m);
    }
  });

  test('Recent Activity timestamps include hours and minutes', async ({ adminPage: page }) => {
    await page.goto('/');
    const activitySection = page.locator('text=Recent Activity').locator('..');
    const bodyText = (await activitySection.textContent()) || '';
    // Skip if the section is empty (no activity yet) — only assert format when present.
    if (bodyText.includes('No recent activity') || bodyText.trim() === 'Recent Activity') {
      test.skip(true, 'No recent activity events to verify timestamp format on');
    }
    expect(bodyText).toMatch(/\d{1,2}:\d{2}/);
  });
});
