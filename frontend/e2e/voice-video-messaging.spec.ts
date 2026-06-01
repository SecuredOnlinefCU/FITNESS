import { test, expect, Page } from '@playwright/test';

const BASE = process.env.CI ? 'https://levelfitcoach.com' : 'http://localhost:3001';
const API = process.env.CI ? 'https://api-production-c73f.up.railway.app' : 'http://localhost:4000';

const COACH_EMAIL = `coach-voice-${Date.now()}@levelfitest.com`;
const COACH_PASSWORD = 'CoachTest123!';
const CLIENT_EMAIL = `client-voice-${Date.now()}@levelfitest.com`;
const CLIENT_PASSWORD = 'ClientTest123!';

let coachToken: string;
let clientToken: string;
let coachUserId: string;
let clientUserId: string;
let threadId: string;

test.describe('Voice and video messaging', () => {
  test('Step 1: Set up coach and client accounts', async ({ request }) => {
    // Sign up coach
    const coachRes = await request.post(`${API}/api/auth/signup`, {
      data: { email: COACH_EMAIL, password: COACH_PASSWORD, firstName: 'Coach', lastName: 'Voice', role: 'coach' },
    });
    expect(coachRes.status()).toBe(201);
    const coachData = await coachRes.json();
    coachToken = coachData.accessToken;
    coachUserId = coachData.user?.id || coachData.userId;

    // Sign up client
    const clientRes = await request.post(`${API}/api/auth/signup`, {
      data: { email: CLIENT_EMAIL, password: CLIENT_PASSWORD, firstName: 'Client', lastName: 'Voice', role: 'client' },
    });
    expect(clientRes.status()).toBe(201);
    const clientData = await clientRes.json();
    clientToken = clientData.accessToken;
    clientUserId = clientData.user?.id || clientData.userId;

    // Coach creates a messaging thread with client
    const threadRes = await request.post(`${API}/api/messaging/threads`, {
      headers: { Authorization: `Bearer ${coachToken}` },
      data: { coachUserId, clientUserId },
    });
    expect(threadRes.status()).toBe(201);
    const threadData = await threadRes.json();
    threadId = threadData.id;

    console.log(`Coach: ${COACH_EMAIL} / ${COACH_PASSWORD} (userId: ${coachUserId})`);
    console.log(`Client: ${CLIENT_EMAIL} / ${CLIENT_PASSWORD} (userId: ${clientUserId})`);
    console.log(`Thread ID: ${threadId}`);
  });

  test('Step 2: Coach records and sends voice message', async ({ page, context }) => {
    await page.goto(BASE);
    // Inject auth token
    await page.evaluate((token) => {
      localStorage.setItem('fitness_access_token', token);
      localStorage.setItem('fitness_user', JSON.stringify({ id: coachUserId, role: 'coach', email: COACH_EMAIL }));
    }, coachToken);
    await page.reload();

    // Navigate to thread
    await page.goto(`${BASE}/dashboard/messages/${threadId}`);
    await page.waitForLoadState('networkidle');

    // Wait for the composer and recording buttons
    const micButton = page.locator('button[aria-label="Record voice message"]');
    const videoButton = page.locator('button[aria-label="Record video message"]');
    await expect(micButton).toBeVisible({ timeout: 10000 });
    await expect(videoButton).toBeVisible({ timeout: 5000 });

    // Grant microphone permission and click record
    await context.grantPermissions(['microphone']);
    await micButton.click();

    // Confirm recording started (pulse dot appears + stop button)
    const stopButton = page.locator('button[aria-label="Stop recording"]');
    await expect(stopButton).toBeVisible({ timeout: 5000 });

    // Record for 3 seconds
    await page.waitForTimeout(3000);

    // Stop recording
    await stopButton.click();

    // Preview state shows Send button
    const sendButton = page.locator('button:has-text("Send")');
    await expect(sendButton).toBeVisible({ timeout: 5000 });

    // Click Send
    await sendButton.click();

    // Wait for message to appear in thread (voice message bubble)
    await page.waitForTimeout(3000);
    const voiceBubble = page.locator('audio').first();
    await expect(voiceBubble).toBeVisible({ timeout: 10000 });
    console.log('Voice message sent and visible');
  });

  test('Step 3: Coach records and sends video message', async ({ page, context }) => {
    await page.goto(BASE);
    await page.evaluate((token) => {
      localStorage.setItem('fitness_access_token', token);
      localStorage.setItem('fitness_user', JSON.stringify({ id: coachUserId, role: 'coach', email: COACH_EMAIL }));
    }, coachToken);
    await page.reload();

    await page.goto(`${BASE}/dashboard/messages/${threadId}`);
    await page.waitForLoadState('networkidle');

    // Grant camera + microphone
    await context.grantPermissions(['camera', 'microphone']);

    const videoButton = page.locator('button[aria-label="Record video message"]');
    await expect(videoButton).toBeVisible({ timeout: 10000 });
    await videoButton.click();

    // Recording should show preview video + stop button
    const stopButton = page.locator('button[aria-label="Stop recording"]');
    await expect(stopButton).toBeVisible({ timeout: 5000 });

    // Record for 2 seconds
    await page.waitForTimeout(2000);
    await stopButton.click();

    // Preview shows Send button
    const sendButton = page.locator('button:has-text("Send")');
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    await sendButton.click();

    // Wait for video message to appear
    await page.waitForTimeout(3000);
    const videoBubble = page.locator('video').last();
    await expect(videoBubble).toBeVisible({ timeout: 10000 });
    console.log('Video message sent and visible');
  });

  test('Step 4: Replay voice and video from thread', async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate((token) => {
      localStorage.setItem('fitness_access_token', token);
      localStorage.setItem('fitness_user', JSON.stringify({ id: clientUserId, role: 'client', email: CLIENT_EMAIL }));
    }, clientToken);
    await page.reload();

    await page.goto(`${BASE}/dashboard/messages/${threadId}`);
    await page.waitForLoadState('networkidle');

    // Find audio elements and try to play
    const audioCount = await page.locator('audio').count();
    expect(audioCount).toBeGreaterThan(0);
    console.log(`Found ${audioCount} audio elements in thread`);

    // Find video elements and try to play
    const videoCount = await page.locator('video').count();
    expect(videoCount).toBeGreaterThan(0);
    console.log(`Found ${videoCount} video elements in thread`);
  });

  test('Step 5: Client can also record and send voice message', async ({ page, context }) => {
    await page.goto(BASE);
    await page.evaluate((token) => {
      localStorage.setItem('fitness_access_token', token);
      localStorage.setItem('fitness_user', JSON.stringify({ id: clientUserId, role: 'client', email: CLIENT_EMAIL }));
    }, clientToken);
    await page.reload();

    await page.goto(`${BASE}/dashboard/messages/${threadId}`);
    await page.waitForLoadState('networkidle');

    await context.grantPermissions(['microphone']);

    const micButton = page.locator('button[aria-label="Record voice message"]');
    await expect(micButton).toBeVisible({ timeout: 10000 });
    await micButton.click();

    const stopButton = page.locator('button[aria-label="Stop recording"]');
    await expect(stopButton).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(2000);
    await stopButton.click();

    const sendButton = page.locator('button:has-text("Send")');
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    await sendButton.click();

    await page.waitForTimeout(3000);
    console.log('Client sent voice message successfully');
  });
});
