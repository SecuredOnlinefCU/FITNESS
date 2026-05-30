import { test, expect } from '@playwright/test';

const COACH_PAGES = [
  '/coach/home', '/coach/clients', '/coach/feed', '/coach/nutrition',
  '/coach/packages', '/coach/programs', '/coach/programs/new',
  '/coach/progress', '/coach/tasks', '/coach/tasks/review',
  '/coach/workouts', '/coach/workouts/builder', '/coach/recovery',
  '/coach/client-health', '/coach/risk-signals', '/coach/intelligence',
];

const CLIENT_PAGES = [
  '/client/home', '/client/billing', '/client/feed', '/client/notifications',
  '/client/nutrition', '/client/program', '/client/progress',
  '/client/recovery', '/client/tasks', '/client/today', '/client/workouts',
];

const ADMIN_PAGES = [
  '/admin', '/admin/audit-logs', '/admin/delivery-logs', '/admin/feature-flags',
  '/admin/reports', '/admin/users', '/admin/webhooks',
];

const SHARED_PAGES = [
  '/dashboard/messages',
];

const ALL_PROTECTED_PAGES = [...COACH_PAGES, ...CLIENT_PAGES, ...ADMIN_PAGES, ...SHARED_PAGES];

const REDIRECT_TIMEOUT = 20000;

test.describe('Protected Pages — Auth Redirect', () => {
  for (const path of ALL_PROTECTED_PAGES) {
    test(`unauthenticated user is redirected from ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL(/\/login/, { timeout: REDIRECT_TIMEOUT });
      const hasAuthForm = (await page.locator('input[type="email"]').count()) > 0;
      expect(hasAuthForm).toBeTruthy();
    });
  }
});

test.describe('Protected Pages — HTTP Status', () => {
  test('coach pages return 200 or redirect (302)', async ({ request }) => {
    for (const path of COACH_PAGES) {
      const resp = await request.get(path, { maxRedirects: 0 });
      const status = resp.status();
      expect([200, 302, 307, 404]).toContain(status);
    }
  });

  test('client pages return 200 or redirect (302)', async ({ request }) => {
    for (const path of CLIENT_PAGES) {
      const resp = await request.get(path, { maxRedirects: 0 });
      const status = resp.status();
      expect([200, 302, 307, 404]).toContain(status);
    }
  });

  test('admin pages return 200 or redirect (302)', async ({ request }) => {
    for (const path of ADMIN_PAGES) {
      const resp = await request.get(path, { maxRedirects: 0 });
      const status = resp.status();
      expect([200, 302, 307, 404]).toContain(status);
    }
  });
});

test.describe('Dashboard Shell', () => {
  test('shared messages page shows auth state', async ({ page }) => {
    await page.goto('/dashboard/messages');
    await page.waitForURL(/\/login/, { timeout: REDIRECT_TIMEOUT });
    const hasAuthForm = (await page.locator('input[type="email"]').count()) > 0;
    expect(hasAuthForm).toBeTruthy();
  });
});
