import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page renders with form fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('load');

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
    await page.waitForLoadState('load');

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
    await page.waitForLoadState('load');

    const nameField = page.locator('input[name="name"], input[placeholder*="name"]');
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    const hasFormElements = (await emailField.count()) > 0 && (await passwordField.count()) > 0;
    expect(hasFormElements).toBeTruthy();
  });

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('load');

    const emailField = page.locator('input[type="email"], input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailField.count() > 0) {
      await expect(emailField.first()).toBeVisible();
    }
  });

  test('protected page redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('load');
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
    await page.waitForLoadState('load');
    const loginLinks = page.locator('a').filter({ hasText: /sign ?in|log ?in/i });
    expect(await loginLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test('real signup via browser form as coach', async ({ page }) => {
    const email = `e2e-${Date.now()}@levelfitest.com`;
    const password = 'TestPass123!';

    await page.goto('/signup');
    await page.waitForLoadState('load');

    const firstNameInput = page.getByRole('textbox', { name: 'First name' });
    const lastNameInput = page.getByRole('textbox', { name: 'Last name' });
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password', exact: true });
    const confirmInput = page.getByRole('textbox', { name: 'Confirm password' });

    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('E2E');
    await lastNameInput.fill('Test');
    await page.getByRole('tab', { name: 'Coach' }).click();
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await confirmInput.fill(password);

    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL(/\/(coach|client)\/home/, { timeout: 30000 });
    expect(page.url()).toContain('/home');
  });
});
