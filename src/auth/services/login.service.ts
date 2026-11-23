import api from '@/interceptors/interceptors';
import type { LoginPayload, LoginResult, AuthUser, RegisterPayload, RegisterResult } from '../types/auth.types';
import {
  setAuthenticated,
  setTokens,
  setAuthUser as persistAuthUser,
  clearSession,
  getAuthUser as readAuthUser,
} from './auth-session';

const AUTH_BASE_URL = `${import.meta.env.VITE_API_BASE_URL }/Auth`;
const LOGIN_URL = `${AUTH_BASE_URL}/login`;
const REGISTER_URL = `${AUTH_BASE_URL}/register`;

function extractMessage(payload: any, fallback: string): string {
  if (typeof payload === 'string') return payload;
  const err = payload?.errors;
  const errMsg =
    Array.isArray(err) ? err.join(', ') : err && typeof err === 'object' ? Object.values(err).flat().join(', ') : '';
  return (
    payload?.message ??
    payload?.Message ??
    payload?.msg ??
    payload?.title ??
    payload?.error ??
    errMsg ??
    fallback
  );
}

function isSuccessResponse(payload: any, status?: number): boolean {
  if (status && (status < 200 || status >= 300)) return false;
  if (payload == null) return true;
  if (typeof payload === 'boolean') return payload;
  if (typeof payload?.success === 'boolean') return payload.success;
  if (typeof payload?.isSuccess === 'boolean') return payload.isSuccess;
  if (typeof payload?.Succeeded === 'boolean') return payload.Succeeded;
  if (typeof payload?.succeeded === 'boolean') return payload.succeeded;
  if (payload?.statusCode && Number(payload.statusCode) >= 400) return false;
  if (payload?.error) return false;
  if (payload?.errors && (Array.isArray(payload.errors) ? payload.errors.length : Object.keys(payload.errors).length)) return false;
  if (payload?.responseType && String(payload.responseType).toLowerCase().includes('error')) return false;
  return true;
}

function extractAuthPayload(payload: any): any {
  return payload?.data ?? payload?.result ?? payload ?? {};
}

function extractTokens(payload: any) {
  const src = extractAuthPayload(payload);
  const accessToken =
    src?.accessToken ?? src?.AccessToken ?? src?.token ?? src?.access_token ?? payload?.accessToken ?? payload?.token ?? null;
  const refreshToken =
    src?.refreshToken ?? src?.RefreshToken ?? src?.refresh_token ?? payload?.refreshToken ?? null;
  const accessTokenExpiresAt =
    src?.accessTokenExpiresAt ?? src?.AccessTokenExpiresAt ?? src?.accessTokenExpiry ?? null;
  const refreshTokenExpiresAt =
    src?.refreshTokenExpiresAt ?? src?.RefreshTokenExpiresAt ?? src?.refreshTokenExpiry ?? null;
  return { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt };
}

function extractUser(payload: any, fallbackUserName: string): AuthUser {
  const src = extractAuthPayload(payload);
  const u = src?.user ?? src;
  const userName = u?.userName ?? u?.username ?? u?.UserName ?? u?.Username ?? fallbackUserName;
  const first = u?.firstName ?? u?.FirstName ?? '';
  const last = u?.lastName ?? u?.LastName ?? '';
  const name = (u?.name ?? u?.Name ?? `${first} ${last}`.trim()) || userName || 'User';
  return {
    id: u?.userId ?? u?.id ?? u?.Id ?? u?.UserId ?? userName,
    name,
    username: userName,
    email: u?.email ?? u?.Email ?? '',
    role: (u?.role ?? u?.Role ?? 'Viewer') as any,
    department: u?.department ?? u?.Department ?? '',
    status: (u?.status ?? u?.Status ?? 'Active') as any,
  };
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const userName = (payload.userName || '').trim();
  const password = payload.password || '';

  if (!userName || !password) {
    return { success: false, message: 'Please enter username and password.' };
  }

  try {
    const res = await api.post(LOGIN_URL, { userName, password });
    const ok = isSuccessResponse(res.data, res.status);
    if (!ok) {
      return { success: false, message: extractMessage(res.data, 'Invalid username or password.') };
    }

    const { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = extractTokens(res.data);
    const user = extractUser(res.data, userName);

    if (accessToken) {
      setTokens({ accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt });
    }
    persistAuthUser(user);
    setAuthenticated(true);

    return { success: true, user, token: accessToken ?? undefined, message: extractMessage(res.data, 'Login successful') };
  } catch (error: any) {
    const data = error?.response?.data;
    const msg =
      extractMessage(data, '') ||
      (data?.errors && typeof data.errors === 'object' ? Object.values(data.errors).flat().join(', ') : '') ||
      error?.message ||
      'Invalid username or password.';
    return { success: false, message: msg };
  }
}

export async function register(payload: RegisterPayload): Promise<RegisterResult> {
  const body: RegisterPayload = {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim(),
    userName: payload.userName.trim(),
    password: payload.password,
  };
  const phone = payload.phoneNumber?.trim();
  if (phone) {
    body.phoneNumber = phone;
  }

  try {
    const res = await api.post(REGISTER_URL, body);
    const ok = isSuccessResponse(res.data, res.status);
    return {
      success: ok,
      message: extractMessage(res.data, ok ? 'Registration successful' : 'Registration failed'),
      data: res.data,
    };
  } catch (error: any) {
    const data = error?.response?.data;
    const msg =
      extractMessage(data, '') ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : '') ||
      (data?.errors && typeof data.errors === 'object'
        ? Object.values(data.errors).flat().join(', ')
        : '') ||
      error?.message ||
      'Registration failed';
    return { success: false, message: msg, data };
  }
}

export function logout(): void {
  clearSession();
}

export function getAuthUser(): AuthUser | null {
  return readAuthUser();
}
