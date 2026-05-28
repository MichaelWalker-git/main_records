import { test as base, expect, Page } from '@playwright/test';

export type DemoUser = {
  email: string;
  password: string;
  role: string;
  name: string;
};

export const USERS = {
  admin: {
    email: 'sarah.chen@maine.gov',
    password: 'Demo@2024!',
    role: 'admin',
    name: 'Sarah Chen',
  },
  staff: {
    email: 'michael.torres@maine.gov',
    password: 'Demo@2024!',
    role: 'staff',
    name: 'Michael Torres',
  },
  recordsOfficer: {
    email: 'diana.patel@maine.gov',
    password: 'Demo@2024!',
    role: 'records_officer',
    name: 'Diana Patel',
  },
  agencyUser: {
    email: 'james.wright@maine.gov',
    password: 'Demo@2024!',
    role: 'agency_user',
    name: 'James Wright',
  },
} as const;

export async function loginAs(page: Page, user: DemoUser) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(user.email);
  await page.getByTestId('login-password').fill(user.password);
  await page.getByTestId('login-submit').click();
  // Successful login lands on /dashboard or /
  await expect(page).toHaveURL(/\/(dashboard|)$/, { timeout: 10_000 });
}

export const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ page }, use) => {
    await loginAs(page, USERS.admin);
    await use(page);
  },
});

export { expect };
