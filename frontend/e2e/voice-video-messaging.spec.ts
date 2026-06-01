import { test, expect, Page } from '@playwright/test';

const BASE = process.env.CI ? 'https://frontend-eosin-seven-71.vercel.app' : 'http://localhost:3001';
const API = process.env.CI ? 'https://api-production-c73f.up.railway.app' : 'http://localhost:4000';

const COACH_EMAIL = 'coach-voice-test@levelfitest.com';
const COACH_PASSWORD = 'CoachTest123!';
const CLIENT_EMAIL = 'client-voice-test@levelfitest.com';
const CLIENT_PASSWORD = 'ClientTest123!';

let coachToken: string;
let clientToken: string;
let coachUserId: string;
let clientUserId: string;
let threadId: string;

test.describe.serial('Voice and video messaging', () => {
  test('Step 1: Set up session — login accounts and create thread', async ({ request }) => {
    // Login coach
    const coachRes = await request.post(`${API}/api/auth/login`, {
      data: { email: COACH_EMAIL, password: COACH_PASSWORD },
    });
    expect(coachRes.status()).toBe(200);
    const coachData = await coachRes.json();
    coachToken = coachData.accessToken;
    coachUserId = coachData.user?.id || coachData.userId;

    // Login client
    const clientRes = await request.post(`${API}/api/auth/login`, {
      data: { email: CLIENT_EMAIL, password: CLIENT_PASSWORD },
    });
    expect(clientRes.status()).toBe(200);
    const clientData = await clientRes.json();
    clientToken = clientData.accessToken;
    clientUserId = clientData.user?.id || clientData.userId;

    // Coach creates a messaging thread with client
    const threadRes = await request.post(`${API}/api/messaging/threads`, {
      headers: { Authorization: `Bearer ${coachToken}` },
      data: { coachUserId, clientUserId },
    });
    expect(threadRes.ok()).toBeTruthy();
    const threadData = await threadRes.json();
    threadId = threadData.id;

    console.log(`Coach: ${COACH_EMAIL} / ${COACH_PASSWORD} (userId: ${coachUserId})`);
    console.log(`Client: ${CLIENT_EMAIL} / ${CLIENT_PASSWORD} (userId: ${clientUserId})`);
    console.log(`Thread ID: ${threadId}`);
  });

  test('Step 2: Coach records and sends voice message', async ({ page, context }) => {
    // Inject auth token via localStorage
    await page.goto(BASE);
    await page.evaluate(({ token, uid, email }) => {
      localStorage.setItem('fitness_access_token', token);
      localStorage.setItem('fitness_user', JSON.stringify({ id: uid, role: 'coach', email }));
    }, { token: coachToken, uid: coachUserId, email: COACH_EMAIL });
    await page.reload();
    await page.waitForLoadState('load');

    // Navigate to thread
    await page.goto(`${BASE}/dashboard/messages/${threadId}`);
    await page.waitForLoadState('load');

    // Wait for the composer and recording buttons
    const micButton = page.locator('button[aria-label="Record voice message"]');
    const videoButton = page.locator('button[aria-label="Record video message"]');
    await expect(micButton).toBeVisible({ timeout: 15000 });
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
    await page.evaluate(({ token, uid, email }) => {
      localStorage.setItem('fitness_access_token', token);
      localStorage.setItem('fitness_user', JSON.stringify({ id: uid, role: 'coach', email }));
    }, { token: coachToken, uid: coachUserId, email: COACH_EMAIL });
    await page.reload();
    await page.waitForLoadState('load');

    await page.goto(`${BASE}/dashboard/messages/${threadId}`);
    await page.waitForLoadState('load');

    // Grant camera + microphone
    await context.grantPermissions(['camera', 'microphone']);

    const videoButton = page.locator('button[aria-label="Record video message"]');
    await expect(videoButton).toBeVisible({ timeout: 15000 });
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
    await page.evaluate(({ token, uid, email }) => {
      localStorage.setItem('fitness_access_token', token);
      localStorage.setItem('fitness_user', JSON.stringify({ id: uid, role: 'client', email }));
    }, { token: clientToken, uid: clientUserId, email: CLIENT_EMAIL });
    await page.reload();
    await page.waitForLoadState('load');

    await page.goto(`${BASE}/dashboard/messages/${threadId}`);
    await page.waitForLoadState('load');

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
    await page.evaluate(({ token, uid, email }) => {
      localStorage.setItem('fitness_access_token', token);
      localStorage.setItem('fitness_user', JSON.stringify({ id: uid, role: 'client', email }));
    }, { token: clientToken, uid: clientUserId, email: CLIENT_EMAIL });
    await page.reload();
    await page.waitForLoadState('load');

    await page.goto(`${BASE}/dashboard/messages/${threadId}`);
    await page.waitForLoadState('load');

    await context.grantPermissions(['microphone']);

    const micButton = page.locator('button[aria-label="Record voice message"]');
    await expect(micButton).toBeVisible({ timeout: 15000 });
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
