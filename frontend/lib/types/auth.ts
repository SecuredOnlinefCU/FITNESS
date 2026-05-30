export type UserRole = 'super_admin' | 'coach' | 'assistant_coach' | 'client';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type SignUpInput = {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  firstName: string;
  lastName: string;
};
