import type { AuthUser } from '../types/auth.types';

export const AUTH_FLAG_KEY = 'scm_auth';
export const ACCESS_TOKEN_KEY = 'scm_access_token';
export const REFRESH_TOKEN_KEY = 'scm_refresh_token';
export const ACCESS_TOKEN_EXPIRES_AT_KEY = 'scm_access_token_expires_at';
export const REFRESH_TOKEN_EXPIRES_AT_KEY = 'scm_refresh_token_expires_at';
export const USER_STORAGE_KEY = 'scm_user';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
  refreshTokenExpiresAt?: string | null;
}

const isBrowser = typeof window !== 'undefined';

export function getAccessToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  if (!isBrowser) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  if (tokens.accessTokenExpiresAt) {
    localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, tokens.accessTokenExpiresAt);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  }
  if (tokens.refreshTokenExpiresAt) {
    localStorage.setItem(REFRESH_TOKEN_EXPIRES_AT_KEY, tokens.refreshTokenExpiresAt);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
  }
}

export function setAuthUser(user: AuthUser): void {
  if (!isBrowser) return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuthenticated(flag: boolean): void {
  if (!isBrowser) return;
  if (flag) {
    localStorage.setItem(AUTH_FLAG_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_FLAG_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem(AUTH_FLAG_KEY) === 'true';
}

export function clearSession(): void {
  if (!isBrowser) return;
  const keys = [
    AUTH_FLAG_KEY,
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    ACCESS_TOKEN_EXPIRES_AT_KEY,
    REFRESH_TOKEN_EXPIRES_AT_KEY,
    USER_STORAGE_KEY,
    // legacy / commented company keys cleanup
    'access_token',
    'scm_company',
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}