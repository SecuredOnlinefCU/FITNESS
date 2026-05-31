import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /train|fitness|perform/i }).first()).toBeVisible();
    await expect(page.getByText(/workout builder/i).first()).toBeVisible();
    await expect(page.getByText(/\$29/i).first()).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
