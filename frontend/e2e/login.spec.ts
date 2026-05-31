import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should load login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
  });
});
