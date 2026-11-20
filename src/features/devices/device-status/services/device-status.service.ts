import api from '@/interceptors/interceptors';
import type {
  DeviceStatusItem,
  DeviceStatusSavePayload,
  DeviceStatusServerSearchRequest,
  ApiListResponse,
  FetchDeviceStatusParams,
  FetchDeviceStatusResult,
  SelectListItem,
} from '../types/device-status.types';

const BASE_URL = 'http://scmdevice.himalayankasturi.com.np/api';
export const RESOURCE_PATH = '/DeviceStatus';
export const API_URL = `${BASE_URL}${RESOURCE_PATH}/GetAllDeviceStatus`;
export const GET_BY_ID_URL = `${BASE_URL}${RESOURCE_PATH}/GetDeviceStatusById`;
export const CREATE_URL = `${BASE_URL}${RESOURCE_PATH}/CreateDeviceStatus`;
export const UPDATE_URL = `${BASE_URL}${RESOURCE_PATH}/UpdateDeviceStatus`;
export const DELETE_URL = `${BASE_URL}${RESOURCE_PATH}/DeleteDeviceStatus`;

function toItem(raw: any): DeviceStatusItem {
  return {
    id: raw?.id ?? raw?.Id ?? raw?.deviceStatusId ?? raw?.DeviceStatusId ?? 0,
    statusName: raw?.statusName ?? raw?.StatusName ?? raw?.name ?? raw?.Name ?? '',
    code: raw?.code ?? raw?.Code ?? '',
    colorCode: raw?.colorCode ?? raw?.ColorCode ?? raw?.color ?? raw?.Color ?? '#52c41a',
    orderKey: Number(raw?.orderKey ?? raw?.OrderKey ?? raw?.order ?? raw?.Order ?? 0),
  };
}

function extractItems(payload: any): DeviceStatusItem[] {
  if (Array.isArray(payload)) return payload.map(toItem);
  if (Array.isArray(payload?.data)) return payload.data.map(toItem);
  if (Array.isArray(payload?.items)) return payload.items.map(toItem);
  if (Array.isArray(payload?.result)) return payload.result.map(toItem);
  if (Array.isArray(payload?.records)) return payload.records.map(toItem);
  if (Array.isArray(payload?.data?.data)) return payload.data.data.map(toItem);
  if (Array.isArray(payload?.data?.items)) return payload.data.items.map(toItem);
  return [];
}

function extractTotal(payload: any, items: DeviceStatusItem[]): number {
  const candidates = [
    payload?.recordsTotal,
    payload?.total,
    payload?.totalCount,
    payload?.count,
    payload?.recordsFiltered,
    payload?.data?.recordsTotal,
    payload?.data?.total,
    payload?.data?.totalCount,
    payload?.data?.recordsFiltered,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return items.length;
}

function extractMessage(payload: any, fallback: string): string {
  return (
    payload?.message ??
    payload?.Message ??
    payload?.msg ??
    payload?.title ??
    payload?.error ??
    fallback
  );
}

export async function fetchDeviceStatus(
  params: FetchDeviceStatusParams
): Promise<FetchDeviceStatusResult> {
  const res = await api.get(API_URL, { signal: params.signal });
  const all = extractItems(res.data);
  const search = (params.search ?? '').trim().toLowerCase();
  const filtered = search
    ? all.filter(
        (s) =>
          s.statusName.toLowerCase().includes(search) ||
          s.code.toLowerCase().includes(search)
      )
    : all;
  const start = params.start ?? 0;
  const length = params.length ?? (filtered.length || 12);
  const items = filtered.slice(start, start + length);
  return {
    items,
    total: search ? filtered.length : extractTotal(res.data, all),
    filtered: filtered.length,
  };
}

export async function fetchDeviceStatusSelectList(
  _params?: Record<string, unknown>
): Promise<SelectListItem[]> {
  const res = await api.get(API_URL);
  return extractItems(res.data).map((item) => ({
    label: item.statusName,
    value: item.id,
  }));
}

export async function saveDeviceStatus(
  payload: DeviceStatusSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const body = {
    statusName: payload.statusName,
    code: payload.code,
    colorCode: payload.colorCode,
    orderKey: Number(payload.orderKey ?? 0),
  };

  const id = payload.id;
  const isUpdate = id !== undefined && id !== null && id !== '' && Number(id) !== 0;
  const res = isUpdate
    ? await api.put(`${UPDATE_URL}/${id}`, body)
    : await api.post(CREATE_URL, body);

  return { success: true, message: extractMessage(res.data, 'Saved successfully'), data: res.data };
}

export async function deleteDeviceStatus(
  id: number | string
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.delete(`${DELETE_URL}/${id}`);
  return { success: true, message: extractMessage(res.data, 'Deleted successfully'), data: res.data };
}

export const deviceStatusService = {
  serverSearch: (body: DeviceStatusServerSearchRequest, signal?: AbortSignal) =>
    api.get<ApiListResponse<DeviceStatusItem>>(API_URL, { params: body, signal }),
  save: saveDeviceStatus,
  delete: deleteDeviceStatus,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: (params?: Record<string, unknown>) => api.get(API_URL, { params }),
  fetchDeviceStatus,
  fetchDeviceStatusSelectList,
  saveDeviceStatus,
  deleteDeviceStatus,
};
