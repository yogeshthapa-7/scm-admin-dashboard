import type { AuthUser } from '../types/auth.types';

export const AUTH_FLAG_KEY = 'auth_flag';
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const ACCESS_TOKEN_EXPIRES_AT_KEY = 'access_token_expires_at';
export const REFRESH_TOKEN_EXPIRES_AT_KEY = 'refresh_token_expires_at';
export const USER_STORAGE_KEY = 'user';
export const REMEMBER_ME_KEY = 'remember_me';

const LEGACY_AUTH_KEYS = ['auth'];

const STORAGE_KEYS = [
  AUTH_FLAG_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_TOKEN_EXPIRES_AT_KEY,
  REFRESH_TOKEN_EXPIRES_AT_KEY,
  USER_STORAGE_KEY,
  REMEMBER_ME_KEY,
];

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
  refreshTokenExpiresAt?: string | null;
}

const isBrowser = typeof window !== 'undefined';

function getStorage(rememberMe: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

export function getAccessToken(rememberMe?: boolean): string | null {
  if (!isBrowser) return null;
  const storages: Storage[] = rememberMe === undefined ? [localStorage, sessionStorage] : [getStorage(rememberMe)];
  for (const storage of storages) {
    const token = storage.getItem(ACCESS_TOKEN_KEY);
    if (token) return token;
  }
  return null;
}

export function getRefreshToken(rememberMe?: boolean): string | null {
  if (!isBrowser) return null;
  const storages: Storage[] = rememberMe === undefined ? [localStorage, sessionStorage] : [getStorage(rememberMe)];
  for (const storage of storages) {
    const token = storage.getItem(REFRESH_TOKEN_KEY);
    if (token) return token;
  }
  return null;
}

export function setTokens(tokens: AuthTokens, rememberMe: boolean): void {
  if (!isBrowser) return;
  const storage = getStorage(rememberMe);
  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    storage.removeItem(REFRESH_TOKEN_KEY);
  }
  if (tokens.accessTokenExpiresAt) {
    storage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, tokens.accessTokenExpiresAt);
  } else {
    storage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  }
  if (tokens.refreshTokenExpiresAt) {
    storage.setItem(REFRESH_TOKEN_EXPIRES_AT_KEY, tokens.refreshTokenExpiresAt);
  } else {
    storage.removeItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
  }
  storage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
}

export function setAuthUser(user: AuthUser, rememberMe: boolean): void {
  if (!isBrowser) return;
  const storage = getStorage(rememberMe);
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser(rememberMe?: boolean): AuthUser | null {
  if (!isBrowser) return null;
  const storages: Storage[] = rememberMe === undefined ? [localStorage, sessionStorage] : [getStorage(rememberMe)];
  for (const storage of storages) {
    try {
      const raw = storage.getItem(USER_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AuthUser;
    } catch {
      // continue to next storage
    }
  }
  return null;
}

export function setAuthenticated(flag: boolean, rememberMe: boolean): void {
  if (!isBrowser) return;
  const storage = getStorage(rememberMe);
  if (flag) {
    storage.setItem(AUTH_FLAG_KEY, 'true');
  } else {
    storage.removeItem(AUTH_FLAG_KEY);
  }
}

export function isAuthenticated(rememberMe?: boolean): boolean {
  if (!isBrowser) return false;
  const storages: Storage[] = rememberMe === undefined ? [localStorage, sessionStorage] : [getStorage(rememberMe)];
  for (const storage of storages) {
    const authenticated = storage.getItem(AUTH_FLAG_KEY) === 'true';
    const hasAccessToken = Boolean(storage.getItem(ACCESS_TOKEN_KEY));
    const hasRefreshToken = Boolean(storage.getItem(REFRESH_TOKEN_KEY));
    if (authenticated && (hasAccessToken || hasRefreshToken)) return true;
  }
  return false;
}

export function clearSession(rememberMe?: boolean): void {
  if (!isBrowser) return;
  const storages: Storage[] = [];
  if (rememberMe === undefined || rememberMe) storages.push(localStorage);
  if (rememberMe === undefined || !rememberMe) storages.push(sessionStorage);
  STORAGE_KEYS.forEach((k) => {
    storages.forEach((s) => s.removeItem(k));
  });
  [...LEGACY_AUTH_KEYS].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

export function clearAllSessions(): void {
  if (!isBrowser) return;
  STORAGE_KEYS.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  [...LEGACY_AUTH_KEYS].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

export function getRememberMe(): boolean | null {
  if (!isBrowser) return null;
  const raw = localStorage.getItem(REMEMBER_ME_KEY);
  return raw ? raw === 'true' : null;
}
