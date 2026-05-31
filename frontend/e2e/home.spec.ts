import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText(/hero/i)).toBeVisible();
    await expect(page.getByText(/features/i)).toBeVisible();
    await expect(page.getByText(/pricing/i)).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
