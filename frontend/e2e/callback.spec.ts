import { test, expect } from '@playwright/test';

test.describe('Auth Callback Page', () => {
  test('should load callback page', async ({ page }) => {
    await page.goto('/auth/callback');
    await expect(page).toHaveURL(/\/auth\/callback/);
    await expect(page.locator('body')).toBeVisible();
  });
});
