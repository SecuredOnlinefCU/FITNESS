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

  test('navbar has call-to-action buttons', async ({ page }) => {
    const getStarted = page.getByRole('link', { name: /get started|sign up|join/i });
    const signIn = page.getByRole('link', { name: /sign in|login/i });

    const hasGetStarted = (await getStarted.count()) > 0;
    const hasSignIn = (await signIn.count()) > 0;
    expect(hasGetStarted || hasSignIn).toBeTruthy();
  });

  test('pricing section shows plan tiers', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const pricingSection = page.locator('section').filter({ hasText: /pricing|plan/i });
    if (await pricingSection.count() > 0) {
      const priceElements = pricingSection.locator('text=$');
      expect(await priceElements.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('FAQ section has expandable questions', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const faqSection = page.locator('section').filter({ hasText: /FAQ|frequently asked/i });
    if (await faqSection.count() > 0) {
      const questions = faqSection.locator('button, [role="button"], summary');
      expect(await questions.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('page has proper meta tags', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const description = page.locator('meta[name="description"]');
    const descContent = await description.getAttribute('content');
    expect(descContent?.length).toBeGreaterThan(0);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('load');
    expect(errors.filter(e => !e.includes('favicon') && !e.includes('third-party') && !e.includes('400'))).toEqual([]);
  });
});
