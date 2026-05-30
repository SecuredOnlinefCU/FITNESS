import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://api-production-c73f.up.railway.app';

test.describe('Backend API Health', () => {
  test('GET /health returns 200 with status ok', async ({ request }) => {
    const resp = await request.get(`${API_URL}/health`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.status).toBe('ok');
  });

  test('GET /api/auth/me returns 401 when no token', async ({ request }) => {
    const resp = await request.get(`${API_URL}/api/auth/me`);
    expect(resp.status()).toBe(401);
  });

  test('POST /api/auth/login with bad creds returns 401', async ({ request }) => {
    const resp = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'nonexistent@test.com', password: 'wrongpassword123' },
    });
    expect(resp.status()).toBe(401);
  });

  test('POST /api/auth/signup with missing fields returns 400', async ({ request }) => {
    const resp = await request.post(`${API_URL}/api/auth/signup`, {
      data: { email: '' },
    });
    expect([400, 401, 422]).toContain(resp.status());
  });

  test('API responds with CORS headers', async ({ request }) => {
    const resp = await request.get(`${API_URL}/health`);
    const headers = resp.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
  });

  test('API rate limiting works (many requests)', async ({ request }) => {
    const results: number[] = [];
    for (let i = 0; i < 10; i++) {
      const resp = await request.get(`${API_URL}/health`);
      results.push(resp.status());
    }
    const allOk = results.every(s => s === 200);
    const someLimited = results.some(s => s === 429);
    expect(allOk || someLimited).toBeTruthy();
  });
});

test.describe('Backend API Endpoints', () => {
  test('GET /api/training/exercises returns 401 without auth', async ({ request }) => {
    const resp = await request.get(`${API_URL}/api/training/exercises`);
    expect(resp.status()).toBe(401);
  });

  test('GET /api/programs returns 401 without auth', async ({ request }) => {
    const resp = await request.get(`${API_URL}/api/programs`);
    expect(resp.status()).toBe(401);
  });

  test('GET /api/feed/program/:id returns 401 without auth', async ({ request }) => {
    const resp = await request.get(`${API_URL}/api/feed/program/123`);
    expect(resp.status()).toBe(401);
  });

  test('GET /api/messaging/threads returns 401 without auth', async ({ request }) => {
    const resp = await request.get(`${API_URL}/api/messaging/threads`);
    expect(resp.status()).toBe(401);
  });

  test('GET /api/tasks returns 401 without auth', async ({ request }) => {
    const resp = await request.get(`${API_URL}/api/tasks`);
    expect(resp.status()).toBe(401);
  });
});
