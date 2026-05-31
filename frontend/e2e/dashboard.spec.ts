import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should load dashboard if available', async ({ page }) => {
    await page.goto('/dashboard');
    // If dashboard exists, check for a heading or main content
    await expect(page.locator('main')).toBeVisible();
  });
});
