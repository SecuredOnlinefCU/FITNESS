import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
];

test.describe('Responsive Design', () => {
  for (const vp of VIEWPORTS) {
    test(`landing page renders at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const body = page.locator('body');
      await expect(body).toBeVisible();

      const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
      expect(scrollHeight).toBeGreaterThan(vp.height);
    });
  }

  for (const vp of VIEWPORTS) {
    test(`protected page redirects to login at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/coach/home');
      await page.waitForURL(/\/login/, { timeout: 20000 });
      await page.waitForLoadState('networkidle');
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      const headingText = await heading.textContent();
      expect(headingText?.toLowerCase()).toContain('log in');
    });
  }
});

test.describe('Touch Targets (WCAG 2.2)', () => {
  test('nav links have minimum 44x44px touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = page.locator('nav a, nav button');
    const count = await links.count();
    const tooSmall: number[] = [];

    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await links.nth(i).boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        tooSmall.push(i);
      }
    }
    expect(tooSmall.length).toBe(0);
  });
});
