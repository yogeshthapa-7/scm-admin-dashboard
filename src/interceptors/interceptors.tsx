import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearSession,
} from '@/auth/services/auth-session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const REFRESH_URL = 'http://scmdevice.himalayankasturi.com.np/api/Auth/refresh';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return AUTH_PATHS.some((ep) => lower.includes(ep));
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null, error?: unknown) => void> = [];

function processQueue(token: string | null, error?: unknown) {
  refreshQueue.forEach((cb) => cb(token, error));
  refreshQueue = [];
}

function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

function isRefreshUnauthorized(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  if (status === 401 || status === 403) return true;
  const data = error.response?.data as any;
  if (!data) return false;
  const msg = String(data.message ?? data.Message ?? data.error ?? data.error_description ?? '').toLowerCase();
  const respType = String(data.responseType ?? '').toLowerCase();
  return (
    data.success === false ||
    respType.includes('fail') ||
    respType.includes('error') ||
    msg.includes('invalid') ||
    msg.includes('expired') ||
    msg.includes('unauthorized')
  );
}

async function requestTokenRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const refreshResponse = await axios.post(
    REFRESH_URL,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: 15000 },
  );

  const payload = refreshResponse.data ?? {};
  const data = payload.data ?? payload.result ?? payload;
  const responseFailed =
    payload.success === false ||
    payload.isSuccess === false ||
    String(payload.responseType ?? '').toLowerCase().includes('fail') ||
    String(payload.responseType ?? '').toLowerCase().includes('error');

  if (responseFailed) {
    throw new Error(String(payload.message ?? payload.Message ?? 'Token refresh failed'));
  }

  const newAccessToken: string | undefined =
    data.accessToken ?? data.AccessToken ?? data.token ?? data.access_token ?? payload.accessToken;
  const newRefreshToken: string | undefined =
    data.refreshToken ?? data.RefreshToken ?? data.refresh_token ?? payload.refreshToken ?? refreshToken;
  const accessTokenExpiresAt: string | undefined =
    data.accessTokenExpiresAt ?? data.AccessTokenExpiresAt ?? data.accessTokenExpiry;
  const refreshTokenExpiresAt: string | undefined =
    data.refreshTokenExpiresAt ?? data.RefreshTokenExpiresAt ?? data.refreshTokenExpiry;

  if (!newAccessToken) {
    throw new Error('No access token returned from refresh');
  }

  setTokens({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  });

  return newAccessToken;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? ({} as any);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    // Never attempt refresh for auth endpoints; let caller handle (e.g. login errors)
    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Already retried once after refresh; give up
    if (originalRequest._retry) {
      if (getRefreshToken()) {
        clearSession();
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token, refreshError) => {
          if (!token) {
            reject(refreshError ?? error);
            return;
          }
          originalRequest.headers = originalRequest.headers ?? ({} as any);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest as AxiosRequestConfig));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await requestTokenRefresh();
      processQueue(newAccessToken);
      originalRequest.headers = originalRequest.headers ?? ({} as any);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest as AxiosRequestConfig);
    } catch (refreshError) {
      processQueue(null, refreshError);
      if (isRefreshUnauthorized(refreshError)) {
        clearSession();
        redirectToLogin();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;