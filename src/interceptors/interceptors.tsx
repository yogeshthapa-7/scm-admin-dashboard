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

const AUTH_ENDPOINTS = ['/Auth/login', '/Auth/register', '/Auth/refresh', '/auth/login', '/auth/register', '/auth/refresh'];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((ep) => url.includes(ep));
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
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

    if (!originalRequest || status !== 401 || isAuthEndpoint(originalRequest.url)) {
      if (status === 401 && isAuthEndpoint(originalRequest?.url)) {
        clearSession();
      }
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearSession();
      redirectToLogin();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers ?? ({} as any);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest as AxiosRequestConfig));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshResponse = await axios.post(
        REFRESH_URL,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 },
      );

      const payload = refreshResponse.data ?? {};
      const data = payload.data ?? payload.result ?? payload;
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

      processQueue(newAccessToken);
      originalRequest.headers = originalRequest.headers ?? ({} as any);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest as AxiosRequestConfig);
    } catch (refreshError) {
      processQueue(null);
      clearSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;