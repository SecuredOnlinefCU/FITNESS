import { apiFetch } from '@/lib/api/client';
import type { AuthSession, AuthUser, SignUpInput } from '@/lib/types/auth';

export const authApi = {
  signup(input: SignUpInput) {
    return apiFetch<AuthSession>('/api/auth/signup', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(input),
    });
  },
  login(input: { email: string; password: string }) {
    return apiFetch<AuthSession>('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(input),
    });
  },
  refresh(refreshToken: string) {
    return apiFetch<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ refreshToken }),
    });
  },
  me<T = any>() {
    return apiFetch<T>('/api/auth/me');
  },
  googleUrl() {
    return apiFetch<{ url: string; state: string }>('/api/auth/google', {
      auth: false,
    });
  },
  googleCallback(code: string, state: string) {
    return apiFetch<AuthSession>('/api/auth/google/callback', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ code, state }),
    });
  },
  setPassword(password: string) {
    return apiFetch<{ success: true }>('/api/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
  microsoft(idToken: string) {
    return apiFetch<AuthSession & { isNewUser?: boolean }>('/api/auth/microsoft', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ idToken }),
    });
  },
};
