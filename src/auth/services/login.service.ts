import type { LoginPayload, LoginResult, AuthUser } from '../types/auth.types';
import type { UserItem } from '@/features/users/types/user.types';

export const AUTH_STORAGE_KEY = 'scm_auth';
export const COMPANY_STORAGE_KEY = 'scm_company';
export const USER_STORAGE_KEY = 'scm_user';
export const USERS_STORAGE_KEY = 'scm_users';

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin@123',
};

function getStoredUsers(): UserItem[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toAuthUser(user: UserItem): AuthUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    department: user.department,
    status: user.status,
  };
}

function persistSession(user: AuthUser, company: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, 'true');
  localStorage.setItem(COMPANY_STORAGE_KEY, company);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const identifier = payload.username.trim().toLowerCase();
  const password = payload.password;
  const company = payload.company;

  if (!identifier || !password) {
    return { success: false, message: 'Please enter username/email and password.' };
  }
  if (!company) {
    return { success: false, message: 'Please select a company.' };
  }

  const users = getStoredUsers();
  const matched = users.find((u) => {
    const email = (u.email || '').toLowerCase();
    const name = (u.name || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    return username === identifier || email === identifier || name === identifier;
  });

  if (matched) {
    if (matched.password !== password) {
      return { success: false, message: 'Invalid username or password.' };
    }
    if (matched.status !== 'Active') {
      return {
        success: false,
        message: 'Your account is inactive or suspended. Please contact an administrator.',
      };
    }
    const authUser = toAuthUser(matched);
    persistSession(authUser, company);
    return { success: true, user: authUser };
  }

  // Bootstrap fallback when no users exist in storage yet
  if (
    users.length === 0 &&
    identifier === DEFAULT_ADMIN.username &&
    password === DEFAULT_ADMIN.password
  ) {
    const bootstrapUser: AuthUser = {
      id: 'admin',
      name: 'Administrator',
      email: 'admin',
      role: 'Admin',
      department: 'System',
      status: 'Active',
    };
    persistSession(bootstrapUser, company);
    return { success: true, user: bootstrapUser };
  }

  return { success: false, message: 'Invalid username or password.' };
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(COMPANY_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem('access_token');
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getSelectedCompany(): string | null {
  return localStorage.getItem(COMPANY_STORAGE_KEY);
}
