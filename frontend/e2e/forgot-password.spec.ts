import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  test('should load forgot password form', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /reset|send/i })).toBeVisible();
  });
});
