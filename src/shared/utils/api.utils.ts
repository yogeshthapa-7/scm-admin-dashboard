export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function isApiResponseFailed(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const record = payload as Record<string, unknown>;
  const responseType = String(record.responseType ?? '').toLowerCase();
  return (
    record.success === false ||
    record.isSuccess === false ||
    responseType.includes('fail') ||
    responseType.includes('error')
  );
}

export function getApiMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const record = payload as Record<string, unknown>;
  const message =
    record.message ?? record.Message ?? record.msg ?? record.error ?? record.title;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

export function toNumberId(value: unknown): number | string {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return (value as number | string) ?? 0;
}