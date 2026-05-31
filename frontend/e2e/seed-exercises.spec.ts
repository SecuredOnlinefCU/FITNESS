import { test, expect } from '@playwright/test';

test.describe('Exercise demo video seed', () => {
  test('sign up as coach and create exercises with demo videos', async ({ page, request }) => {
    const email = `seed-${Date.now()}@levelfitest.com`;
    const password = 'SeedPass123!';
    const baseURL = 'https://api-production-c73f.up.railway.app';

    // Sign up as coach
    await page.goto('/signup');
    await page.waitForLoadState('load');
    await page.getByRole('textbox', { name: 'First name' }).fill('Seed');
    await page.getByRole('textbox', { name: 'Last name' }).fill('Test');
    await page.getByRole('tab', { name: 'Coach' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await page.getByRole('textbox', { name: 'Confirm password' }).fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForURL(/\/(coach|client)\/home/, { timeout: 30000 });

    // Extract auth token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('fitness_access_token'));

    const SAMPLE_VIDEOS = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    ];

    const exercises = [
      {
        name: 'Barbell Bench Press',
        instructions: 'Lie on a flat bench, grip the bar shoulder-width apart, lower to your chest, and press up.',
        muscleGroups: 'Chest, Triceps, Shoulders',
        equipment: 'Barbell, Bench',
        demoVideoUrl: SAMPLE_VIDEOS[0],
      },
      {
        name: 'Barbell Squat',
        instructions: 'Stand with feet shoulder-width, bar on upper back, bend knees to parallel, drive up.',
        muscleGroups: 'Quads, Glutes, Hamstrings, Core',
        equipment: 'Barbell, Squat rack',
        demoVideoUrl: SAMPLE_VIDEOS[1],
      },
      {
        name: 'Deadlift',
        instructions: 'Hinge at hips, grip bar shoulder-width, drive through heels, extend hips and knees.',
        muscleGroups: 'Back, Glutes, Hamstrings, Core',
        equipment: 'Barbell',
        demoVideoUrl: SAMPLE_VIDEOS[2],
      },
      {
        name: 'Overhead Press',
        instructions: 'Stand with bar at shoulders, press overhead, keep core braced.',
        muscleGroups: 'Shoulders, Triceps',
        equipment: 'Barbell',
        demoVideoUrl: SAMPLE_VIDEOS[3],
      },
      {
        name: 'Pull-Up',
        instructions: 'Hang from bar, pull yourself up until chin is over bar, lower with control.',
        muscleGroups: 'Back, Biceps',
        equipment: 'Pull-up bar',
        demoVideoUrl: SAMPLE_VIDEOS[4],
      },
    ];

    let createdCount = 0;
    for (const ex of exercises) {
      const resp = await request.post(`${baseURL}/api/training/exercises`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: ex,
      });
      if (resp.status() === 201 || resp.status() === 200) {
        createdCount++;
        console.log(`Created: ${ex.name}`);
      } else {
        console.log(`Failed ${ex.name}: ${resp.status()} ${await resp.text()}`);
      }
    }

    expect(createdCount).toBe(exercises.length);

    // Verify exercises are listed
    const listResp = await request.get(`${baseURL}/api/training/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(listResp.status()).toBe(200);
    const body = await listResp.json();
    expect(body.items?.length ?? body.length).toBeGreaterThanOrEqual(exercises.length);
  });
});
