import { test, expect } from '@playwright/test';

test.describe('Exercise video playback with zoom', () => {
  const email = `zoom-test-${Date.now()}@levelfitest.com`;
  const password = 'ZoomTest123!';

  test('create exercise with local video, play in modal, and use zoom controls', async ({ page, request }) => {
    const baseURL = process.env.API_URL || 'https://api-production-c73f.up.railway.app';

    // Sign up fresh coach
    await page.goto('/signup');
    await page.waitForLoadState('load');
    await page.getByRole('textbox', { name: 'First name' }).fill('Zoom');
    await page.getByRole('textbox', { name: 'Last name' }).fill('Test');
    await page.getByRole('tab', { name: 'Coach' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await page.getByRole('textbox', { name: 'Confirm password' }).fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForURL(/\/(coach|client)\/home/, { timeout: 30000 });

    const token = await page.evaluate(() => localStorage.getItem('fitness_access_token'));

    // Create exercise with a public video URL
    const publicVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    const createResp = await request.post(`${baseURL}/api/training/exercises`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {
        name: 'Zoom Test Press',
        instructions: 'Test zoom controls.',
        demoVideoUrl: publicVideoUrl,
      },
    });
    expect(createResp.status()).toBe(201);

    // Navigate to workout builder
    await page.goto('/coach/workouts/builder');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    // Search for the exercise in the search box
    const searchInput = page.locator('input[placeholder="Search exercises..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('Zoom');
    await page.waitForTimeout(1000);

    // Click play button (aria-label includes exercise name)
    const playButton = page.locator(`button[aria-label="Watch Zoom Test Press demo"]`);
    await expect(playButton).toBeVisible({ timeout: 10000 });
    await playButton.click();

    // Verify video modal opened
    const dialog = page.locator('[role="dialog"][aria-label="Exercise demo video"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Verify video element exists
    const video = dialog.locator('video');
    await expect(video).toBeVisible({ timeout: 3000 });

    // Verify zoom controls are present
    const zoomIn = dialog.locator('button[aria-label="Zoom in"]');
    const zoomOut = dialog.locator('button[aria-label="Zoom out"]');
    const resetZoom = dialog.locator('button[aria-label="Reset zoom"]');
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
    await expect(resetZoom).toBeVisible();

    // Test zoom in
    await zoomIn.click();
    await page.waitForTimeout(300);
    await zoomIn.click();
    await page.waitForTimeout(300);
    await zoomIn.click();
    await page.waitForTimeout(300);

    // Test zoom out
    await zoomOut.click();
    await page.waitForTimeout(300);

    // Test reset zoom
    await resetZoom.click();
    await page.waitForTimeout(300);

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    console.log('Video zoom test passed for:', email);
  });
});
