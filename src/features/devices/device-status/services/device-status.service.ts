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

export const RESOURCE_PATH = '/DeviceStatus';
export const API_URL = `${RESOURCE_PATH}/GetAllDeviceStatus`;
export const GET_BY_ID_URL = `${RESOURCE_PATH}/GetDeviceStatusById`;
export const CREATE_URL = `${RESOURCE_PATH}/CreateDeviceStatus`;
export const UPDATE_URL = `${RESOURCE_PATH}/UpdateDeviceStatus`;
export const DELETE_URL = `${RESOURCE_PATH}/DeleteDeviceStatus`;

const STORAGE_KEY = 'scm_device_statuses';

function getStoredDeviceStatuses(): DeviceStatusItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredDeviceStatuses(items: DeviceStatusItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export async function fetchDeviceStatus(
  params: FetchDeviceStatusParams
): Promise<FetchDeviceStatusResult> {
  const all = getStoredDeviceStatuses();
  const search = (params.search ?? '').trim().toLowerCase();
  const filtered = search
    ? all.filter(
        (s) =>
          s.statusName.toLowerCase().includes(search) ||
          s.code.toLowerCase().includes(search)
      )
    : all;
  const start = params.start ?? 0;
  const length = params.length ?? 12;
  const items = filtered.slice(start, start + length);
  return {
    items,
    total: filtered.length,
    filtered: filtered.length,
  };
}

export async function fetchDeviceStatusSelectList(
  _params?: Record<string, unknown>
): Promise<SelectListItem[]> {
  return getStoredDeviceStatuses().map((item) => ({ label: item.statusName, value: item.id }));
}

export async function saveDeviceStatus(
  payload: DeviceStatusSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const all = getStoredDeviceStatuses();
  const isUpdate = all.some((item) => Number(item.id) === Number(payload.id)) && Number(payload.id) !== 0;
  const updated = isUpdate
    ? all.map((item) =>
        Number(item.id) === Number(payload.id) ? { ...payload, id: Number(payload.id) } : item
      )
    : [
        {
          ...payload,
          id: all.length ? Math.max(...all.map((s) => Number(s.id) || 0)) + 1 : 1,
        },
        ...all,
      ];
  saveStoredDeviceStatuses(updated);
  return { success: true, message: 'Saved successfully' };
}

export async function deleteDeviceStatus(
  id: number
): Promise<{ success: boolean; message?: string }> {
  saveStoredDeviceStatuses(getStoredDeviceStatuses().filter((s) => Number(s.id) !== Number(id)));
  return { success: true, message: 'Deleted successfully' };
}

export const deviceStatusService = {
  serverSearch: (body: DeviceStatusServerSearchRequest, signal?: AbortSignal) =>
    api.get<ApiListResponse<DeviceStatusItem>>(API_URL, { params: body, signal }),
  save: saveDeviceStatus,
  delete: deleteDeviceStatus,
  getById: (id: number) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: (params?: Record<string, unknown>) => api.get(API_URL, { params }),
  fetchDeviceStatus,
  fetchDeviceStatusSelectList,
  saveDeviceStatus,
  deleteDeviceStatus,
};
