import { test, expect } from '@playwright/test';

test.describe('Exercise video playback verification', () => {
  test('play demo video in workout builder', async ({ page, request }) => {
    const email = `verify-${Date.now()}@levelfitest.com`;
    const password = 'VerifyPass123!';
    const baseURL = 'https://api-production-c73f.up.railway.app';

    // Sign up fresh coach
    await page.goto('/signup');
    await page.waitForLoadState('load');
    await page.getByRole('textbox', { name: 'First name' }).fill('Verify');
    await page.getByRole('textbox', { name: 'Last name' }).fill('Test');
    await page.getByRole('tab', { name: 'Coach' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await page.getByRole('textbox', { name: 'Confirm password' }).fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForURL(/\/(coach|client)\/home/, { timeout: 30000 });

    const token = await page.evaluate(() => localStorage.getItem('fitness_access_token'));

    // Create an exercise with a demo video URL via API
    const createResp = await request.post(`${baseURL}/api/training/exercises`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {
        name: 'Test Bench Press',
        instructions: 'Test instructions.',
        demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    console.log('Created exercise demoVideoUrl:', created.demoVideoUrl);
    expect(created.demoVideoUrl).toBeTruthy();

    // Verify the API returns demoVideoUrl in the list
    const listResp = await request.get(`${baseURL}/api/training/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = await listResp.json();
    const items: any[] = list.items ?? list;
    console.log('Exercise count:', items.length);
    const bench = items.find((ex: any) => ex.id === created.id);
    expect(bench).toBeDefined();
    console.log('Bench demoVideoUrl:', bench.demoVideoUrl);
    expect(bench.demoVideoUrl).toBeTruthy();

    // Navigate to workout builder
    await page.goto('/coach/workouts/builder');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000); // wait for exercises fetch

    // Search for the exercise
    const searchInput = page.locator('input[placeholder="Search exercises..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('Bench');

    // Wait a moment for filter to apply
    await page.waitForTimeout(500);

    // Debug: take screenshot
    await page.screenshot({ path: 'test-results/search-results.png' });

    // Find the play button — it renders after the exercise name in each row
    const playButton = page.locator('button[aria-label="Watch Test Bench Press demo"]');
    await expect(playButton).toBeVisible({ timeout: 5000 });

    await playButton.click();

    // Verify video modal opened
    const dialog = page.locator('[role="dialog"][aria-label="Exercise demo video"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const video = dialog.locator('video');
    await expect(video).toBeVisible({ timeout: 3000 });

    await page.waitForTimeout(2000);

    const readyState = await video.evaluate((el: HTMLVideoElement) => el.readyState);
    expect(readyState).toBeGreaterThanOrEqual(1);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    console.log('Video playback verified successfully');
  });
});
