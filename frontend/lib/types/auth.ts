export type UserRole = 'super_admin' | 'coach' | 'assistant_coach' | 'client';
export type AuthUser = { id: string; email: string; role: UserRole };
export type AuthSession = { user: AuthUser; accessToken: string; refreshToken: string };
