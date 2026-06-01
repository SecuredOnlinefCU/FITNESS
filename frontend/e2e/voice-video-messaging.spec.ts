import { test, expect } from '@playwright/test';

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
  test('Step 1: Login accounts and create thread', async ({ request }) => {
    const coachRes = await request.post(`${API}/api/auth/login`, {
      data: { email: COACH_EMAIL, password: COACH_PASSWORD },
    });
    expect(coachRes.status()).toBe(200);
    const coachData = await coachRes.json();
    coachToken = coachData.accessToken;
    coachUserId = coachData.user?.id || coachData.userId;

    const clientRes = await request.post(`${API}/api/auth/login`, {
      data: { email: CLIENT_EMAIL, password: CLIENT_PASSWORD },
    });
    expect(clientRes.status()).toBe(200);
    const clientData = await clientRes.json();
    clientToken = clientData.accessToken;
    clientUserId = clientData.user?.id || clientData.userId;

    const threadRes = await request.post(`${API}/api/messaging/threads`, {
      headers: { Authorization: `Bearer ${coachToken}` },
      data: { coachUserId, clientUserId },
    });
    expect(threadRes.ok()).toBeTruthy();
    threadId = (await threadRes.json()).id;

    console.log(`Coach: ${COACH_EMAIL} (userId: ${coachUserId})`);
    console.log(`Client: ${CLIENT_EMAIL} (userId: ${clientUserId})`);
    console.log(`Thread ID: ${threadId}`);
  });

  test('Step 2: Upload voice message and send via API', async ({ request }) => {
    const uploadRes = await request.post(`${API}/api/media/upload-chat-media`, {
      headers: { Authorization: `Bearer ${coachToken}` },
      data: { fileName: 'voice-test.webm', mimeType: 'audio/webm', messageType: 'VOICE', data: 'Vk9JQ0VfVEVTVF9EQVRB' },
    });
    expect(uploadRes.status()).toBe(200);
    const uploadData = await uploadRes.json();
    expect(uploadData.webUrl).toContain('ChatMedia');
    expect(uploadData.mediaAssetId).toBe(uploadData.webUrl);

    const msgRes = await request.post(`${API}/api/messaging/threads/${threadId}/messages`, {
      headers: { Authorization: `Bearer ${coachToken}` },
      data: { messageType: 'VOICE', mediaAssetId: uploadData.mediaAssetId, durationMs: 3000, bodyText: '' },
    });
    expect(msgRes.status()).toBe(201);
    const msg = await msgRes.json();
    expect(msg.messageType).toBe('VOICE');
    expect(msg.mediaAssetId).toBe(uploadData.mediaAssetId);
    expect(msg.durationMs).toBe(3000);
    expect(msg.senderUserId).toBe(coachUserId);
    console.log(`Voice message created: ${msg.id}`);
  });

  test('Step 3: Upload video message and send via API', async ({ request }) => {
    const uploadRes = await request.post(`${API}/api/media/upload-chat-media`, {
      headers: { Authorization: `Bearer ${coachToken}` },
      data: { fileName: 'video-test.webm', mimeType: 'video/webm', messageType: 'VIDEO', data: 'VklERU9fVEVTVF9EQVRB' },
    });
    expect(uploadRes.status()).toBe(200);
    const uploadData = await uploadRes.json();
    expect(uploadData.webUrl).toContain('ChatMedia');

    const msgRes = await request.post(`${API}/api/messaging/threads/${threadId}/messages`, {
      headers: { Authorization: `Bearer ${coachToken}` },
      data: { messageType: 'VIDEO', mediaAssetId: uploadData.mediaAssetId, durationMs: 5000, bodyText: '' },
    });
    expect(msgRes.status()).toBe(201);
    const msg = await msgRes.json();
    expect(msg.messageType).toBe('VIDEO');
    expect(msg.mediaAssetId).toBe(uploadData.mediaAssetId);
    expect(msg.durationMs).toBe(5000);
    console.log(`Video message created: ${msg.id}`);
  });

  test('Step 4: Client can see voice and video messages in thread', async ({ request }) => {
    const msgsRes = await request.get(`${API}/api/messaging/threads/${threadId}/messages`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    expect(msgsRes.status()).toBe(200);
    const data = await msgsRes.json();
    const items = data.items || data;
    const voiceMsgs = items.filter((m: any) => m.messageType === 'VOICE');
    const videoMsgs = items.filter((m: any) => m.messageType === 'VIDEO');
    expect(voiceMsgs.length).toBeGreaterThanOrEqual(1);
    expect(videoMsgs.length).toBeGreaterThanOrEqual(1);
    console.log(`Client sees ${voiceMsgs.length} voice and ${videoMsgs.length} video messages`);
  });

  test('Step 5: Client sends voice message via API', async ({ request }) => {
    const uploadRes = await request.post(`${API}/api/media/upload-chat-media`, {
      headers: { Authorization: `Bearer ${clientToken}` },
      data: { fileName: 'client-voice.webm', mimeType: 'audio/webm', messageType: 'VOICE', data: 'Q0xJRU5UX1ZPSUNFX1RFU1Q=' },
    });
    expect(uploadRes.status()).toBe(200);
    const uploadData = await uploadRes.json();

    const msgRes = await request.post(`${API}/api/messaging/threads/${threadId}/messages`, {
      headers: { Authorization: `Bearer ${clientToken}` },
      data: { messageType: 'VOICE', mediaAssetId: uploadData.mediaAssetId, durationMs: 2000, bodyText: '' },
    });
    expect(msgRes.status()).toBe(201);
    const msg = await msgRes.json();
    expect(msg.messageType).toBe('VOICE');
    expect(msg.senderUserId).toBe(clientUserId);
    console.log(`Client voice message created: ${msg.id}`);
  });
});
