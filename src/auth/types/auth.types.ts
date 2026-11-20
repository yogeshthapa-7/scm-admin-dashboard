// import type { UserRole, UserStatus } from '@/features/users/types/user.types';

export interface LoginPayload {
  userName: string;
  password: string;
  // company: string;
  remember?: boolean;
}

export interface AuthUser {
  id: string | number;
  name: string;
  username?: string;
  email: string;
  role: string; // UserRole
  department: string;
  status: string; // UserStatus
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  phoneNumber?: string;
}

export interface RegisterResult {
  success: boolean;
  message?: string;
  data?: unknown;
}
