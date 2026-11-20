import type { UserRole, UserStatus } from '@/features/users/types/user.types';

export interface LoginPayload {
  username: string;
  password: string;
  company: string;
  remember?: boolean;
}

export interface AuthUser {
  id: string | number;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: AuthUser;
}
