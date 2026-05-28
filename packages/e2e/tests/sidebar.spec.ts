import { test, expect } from '../fixtures/auth';

test.describe('Sidebar highlighting', () => {
  test('only one nav item is highlighted at a time', async ({ adminPage: page }) => {
    const checkSinglehighlight = async (path: string) => {
      await page.goto(path);
      // Wait for the sidebar to settle (one item with aria-current). Don't use
      // networkidle — it times out on the cloud due to long-poll/recharts traffic.
      await expect(page.locator('aside [aria-current="page"]')).toHaveCount(1, {
        timeout: 10_000,
      });
    };

    await checkSinglehighlight('/');
    await checkSinglehighlight('/records');
    await checkSinglehighlight('/transmittals');
    await checkSinglehighlight('/inventory');
    await checkSinglehighlight('/inventory/circulation');
    await checkSinglehighlight('/inventory/scan');
    await checkSinglehighlight('/dispositions');
    await checkSinglehighlight('/admin');
    await checkSinglehighlight('/admin/retention-schedules');
    await checkSinglehighlight('/analytics');
    await checkSinglehighlight('/analytics/reports');
  });

  test('Circulation is highlighted on /inventory/circulation, not Inventory', async ({ adminPage: page }) => {
    await page.goto('/inventory/circulation');
    await expect(page.getByTestId('nav-circulation')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('nav-inventory')).not.toHaveAttribute('aria-current');
  });

  test('Retention is highlighted on /admin/retention-schedules, not Administration', async ({ adminPage: page }) => {
    await page.goto('/admin/retention-schedules');
    await expect(page.getByTestId('nav-retention')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('nav-administration')).not.toHaveAttribute('aria-current');
  });
});
