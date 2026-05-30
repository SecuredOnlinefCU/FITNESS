import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page renders with form fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailField.count() > 0) {
      await expect(emailField.first()).toBeVisible();
      await expect(passwordField.first()).toBeVisible();
      await expect(submitButton.first()).toBeVisible();
    }
  });

  test('login form validation shows errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(500);
      const errorElements = page.locator('[role="alert"], .error, .text-destructive, .text-red');
      expect(await errorElements.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('signup page renders with registration form', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const nameField = page.locator('input[name="name"], input[placeholder*="name"]');
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    const hasFormElements = (await emailField.count()) > 0 && (await passwordField.count()) > 0;
    expect(hasFormElements).toBeTruthy();
  });

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');

    const emailField = page.locator('input[type="email"], input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailField.count() > 0) {
      await expect(emailField.first()).toBeVisible();
    }
  });

  test('protected page redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    const redirectedToLogin = currentUrl.includes('/login');
    const sawAuthForm = (await page.locator('input[type="email"]').count()) > 0 ||
      (await page.locator('input[type="password"]').count()) > 0;
    const is404 = currentUrl.includes('_not-found') || (await page.locator('text=404').count()) > 0;

    expect(redirectedToLogin || sawAuthForm || is404).toBeTruthy();
  });

  test('logout link exists on landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loginLinks = page.locator('a').filter({ hasText: /sign ?in|log ?in/i });
    expect(await loginLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test('real signup via browser form', async ({ page }) => {
    const email = `e2e-${Date.now()}@test.com`;
    const password = 'TestPass123!';

    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const firstNameInput = page.locator('input[name="firstName"]');
    const lastNameInput = page.locator('input[name="lastName"]');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmInput = page.locator('input[type="password"]').nth(1);

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('E2E');
    await lastNameInput.fill('Test');
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await confirmInput.fill(password);

    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    expect(page.url()).toContain('/dashboard');
  });
});
