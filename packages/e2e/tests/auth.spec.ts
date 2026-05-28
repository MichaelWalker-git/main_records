import { test, expect, USERS, loginAs } from '../fixtures/auth';

test.describe('Authentication', () => {
  test('login with valid demo credentials lands on dashboard', async ({ page }) => {
    await loginAs(page, USERS.admin);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('login with wrong password is rejected', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(USERS.admin.email);
    await page.getByTestId('login-password').fill('wrong-password');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('login with arbitrary password "1" is rejected (was previously accepted)', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(USERS.admin.email);
    await page.getByTestId('login-password').fill('1');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
