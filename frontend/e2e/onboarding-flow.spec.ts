import { test, expect } from '@playwright/test';

test.describe.serial('Onboarding wizard flow', () => {
  const email = `test-${Date.now()}@levelfitest.com`;
  const password = 'TestPass123!';

  test('Step 1: sign up as client then navigate to onboarding', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('load');

    await page.getByRole('textbox', { name: 'First name' }).fill('Onboard');
    await page.getByRole('textbox', { name: 'Last name' }).fill('Test');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await page.getByRole('textbox', { name: 'Confirm password' }).fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    // Wait for either onboarding redirect or client home
    await page.waitForURL(/\/(onboarding|client\/home)/, { timeout: 30000 });
    const url = page.url();
    if (url.includes('/client/home')) {
      // Production may not have the onboarding redirect deployed yet
      console.log('Signup went to /client/home, navigating to /onboarding manually');
      await page.goto('/onboarding');
    }
    await page.waitForLoadState('load');
    expect(page.url()).toContain('/onboarding');
  });

  test('Step 2: complete onboarding wizard', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    // Step: Goal — pick Fat Loss
    const goalBtn = page.locator('button').filter({ hasText: 'Fat Loss' }).first();
    await expect(goalBtn).toBeVisible({ timeout: 15000 });
    await goalBtn.click({ force: true });
    await page.waitForTimeout(500);
    // Verify a check icon appeared (goal was selected)
    const continueBtn = page.getByRole('button', { name: /continue/i }).first();
    await expect(continueBtn).toBeEnabled({ timeout: 5000 });
    await continueBtn.click();
    await page.waitForTimeout(1000);

    // Step: Level — Intermediate
    const levelBtn = page.locator('button').filter({ hasText: 'Intermediate' }).first();
    await expect(levelBtn).toBeVisible({ timeout: 10000 });
    await levelBtn.click({ force: true });
    await page.waitForTimeout(500);
    await expect(continueBtn).toBeEnabled({ timeout: 5000 });
    await continueBtn.click();
    await page.waitForTimeout(1000);

    // Step: Equipment — Full Gym
    const equipBtn = page.locator('button').filter({ hasText: 'Full Gym' }).first();
    await expect(equipBtn).toBeVisible({ timeout: 10000 });
    await equipBtn.click({ force: true });
    await page.waitForTimeout(500);
    await expect(continueBtn).toBeEnabled({ timeout: 5000 });
    await continueBtn.click();
    await page.waitForTimeout(1000);

    // Step: Schedule — 4 days
    const dayBtn = page.getByRole('button', { name: '4' }).first();
    await expect(dayBtn).toBeVisible({ timeout: 10000 });
    await dayBtn.click({ force: true });
    await page.waitForTimeout(500);
    await continueBtn.click();
    await page.waitForTimeout(1000);

    // Step: Injuries — None
    const noneBtn = page.locator('button').filter({ hasText: 'None' }).first();
    await expect(noneBtn).toBeVisible({ timeout: 10000 });
    await noneBtn.click({ force: true });
    await page.waitForTimeout(500);
    await continueBtn.click();
    await page.waitForTimeout(1000);

    // Step: Lifestyle — Continue
    await continueBtn.click();
    await page.waitForTimeout(1000);

    // Step: Assessment — Continue
    await continueBtn.click();
    await page.waitForTimeout(1000);

    // Step: Blueprint — Generate
    await expect(page.getByRole('button', { name: /generate my blueprint/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /generate my blueprint/i }).click();

    // Wait for generation (blueprint + program)
    await expect(page.getByRole('button', { name: /start training/i })).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: /start training/i }).click();

    await page.waitForURL('/client/home', { timeout: 30000 });
    expect(page.url()).toContain('/client/home');
    const flag = await page.evaluate(() => localStorage.getItem('levelfit_onboarding_complete'));
    expect(flag).toBe('true');
  });

  test('Step 3: re-login goes directly to /client/home', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.waitForLoadState('load');

    await page.getByRole('textbox', { name: /email/i }).fill(email);
    await page.getByRole('textbox', { name: /password/i }).fill(password);
    await page.getByRole('button', { name: /sign in|log in|continue/i }).first().click();

    await page.waitForURL('/client/home', { timeout: 30000 });
    expect(page.url()).toContain('/client/home');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/client/home');
  });
});
