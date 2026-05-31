import { test, expect } from '@playwright/test';

test.describe('Signup Page', () => {
  test('should load signup form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });
});
