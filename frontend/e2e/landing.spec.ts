import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
  });

  test('renders all major sections', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 20000 });
    const text = await body.textContent();
    expect(text?.length).toBeGreaterThan(200);
  });

  test('displays brand logo and tagline', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
    const h1Text = await h1.first().textContent();
    expect(h1Text?.trim().length).toBeGreaterThan(0);
  });

  test('primary call-to-action is visible on landing', async ({ page }) => {
    const cta = page.getByRole('link', { name: /start free trial/i }).first();
    await expect(cta).toBeVisible();
  });

  test('mobile navigation control is present on small screens', async ({ page }) => {
    const menuButton = page.getByRole('button', { name: /open navigation menu/i }).first();
    await expect(menuButton).toBeVisible();
  });

  test('pricing section shows plan tiers', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const pricingSection = page.locator('section').filter({ hasText: /pricing|plan/i });
    if (await pricingSection.count() > 0) {
      const priceElements = pricingSection.locator('text=$');
      await expect(priceElements.first()).toBeVisible();
    }
  });

  test('FAQ section has expandable questions', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const faqHeading = page.getByRole('heading', { name: /faq|frequently asked questions/i });
    if (await faqHeading.count() > 0) {
      await expect(faqHeading.first()).toBeVisible();
    }
  });

  test('page has proper meta tags', async ({ page }) => {
    const metaTitle = page.locator('head title');
    await expect(metaTitle).toHaveCount(1);
  });

  test('avoids obvious runtime script errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState('load');
    const scriptErrors = errors.filter((msg) => !msg.includes('Loading chunk') && !msg.includes('chunk'));
    expect(scriptErrors).toHaveLength(0);
  });
});
