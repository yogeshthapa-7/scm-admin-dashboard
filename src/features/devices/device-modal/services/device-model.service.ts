import api from '@/interceptors/interceptors';
import type {
  DeviceModelItem,
  DeviceModelSavePayload,
  DeviceModelServerSearchRequest,
  ApiListResponse,
  FetchDeviceModelsParams,
  FetchDeviceModelsResult,
  SelectListItem,
} from '../types/device-model.types';

export const RESOURCE_PATH = '/DeviceModel';
export const API_URL = `${RESOURCE_PATH}/GetAllDeviceModel`;
export const GET_BY_ID_URL = `${RESOURCE_PATH}/GetDeviceModelById`;
export const CREATE_URL = `${RESOURCE_PATH}/CreateDeviceModel`;
export const UPDATE_URL = `${RESOURCE_PATH}/UpdateDeviceModel`;
export const DELETE_URL = `${RESOURCE_PATH}/DeleteDeviceModel`;

const STORAGE_KEY = 'device_models';

const DEFAULT_DEVICE_MODELS: DeviceModelItem[] = [
  { id: 'MDL-001', name: 'MacBook Pro 16" M3 Max' },
  { id: 'MDL-002', name: 'Dell XPS 15 9530' },
  { id: 'MDL-003', name: 'Lenovo ThinkPad X1 Carbon Gen 11' },
  { id: 'MDL-004', name: 'HP EliteBook 840 G10' },
  { id: 'MDL-005', name: 'Apple iPad Pro 12.9" M2' },
  { id: 'MDL-006', name: 'Samsung Galaxy Tab S9 Ultra' },
  { id: 'MDL-007', name: 'Cisco Catalyst 9300 Switch' },
  { id: 'MDL-008', name: 'Fortinet FortiGate 60F Firewall' },
  { id: 'MDL-009', name: 'Ubiquiti UniFi U6 Enterprise AP' },
  { id: 'MDL-010', name: 'Dell UltraSharp 27" 4K Monitor' },
  { id: 'MDL-011', name: 'Logitech MX Master 3S Mouse' },
  { id: 'MDL-012', name: 'Apple Magic Keyboard' },
  { id: 'MDL-013', name: 'Zebra TC26 Handheld Computer' },
  { id: 'MDL-014', name: 'Honeywell Voyager 1400g Scanner' },
  { id: 'MDL-015', name: 'Epson WorkForce Enterprise Printer' },
];

function getStoredDeviceModels(): DeviceModelItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEVICE_MODELS));
    return DEFAULT_DEVICE_MODELS;
  } catch {
    return DEFAULT_DEVICE_MODELS;
  }
}

function saveStoredDeviceModels(items: DeviceModelItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export async function fetchDeviceModels(
  params: FetchDeviceModelsParams
): Promise<FetchDeviceModelsResult> {
  const all = getStoredDeviceModels();
  const search = (params.search ?? '').trim().toLowerCase();
  const filtered = search ? all.filter((m) => m.name.toLowerCase().includes(search)) : all;
  const start = params.start ?? 0;
  const length = params.length ?? 12;
  return {
    items: filtered.slice(start, start + length),
    total: filtered.length,
    filtered: filtered.length,
  };
}

export async function fetchDeviceModelSelectList(
  _params?: Record<string, unknown>
): Promise<SelectListItem[]> {
  return getStoredDeviceModels().map((item) => ({ label: item.name, value: item.id }));
}

export async function saveDeviceModel(
  payload: DeviceModelSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const all = getStoredDeviceModels();
  const updated = payload.id
    ? all.map((item) => (String(item.id) === String(payload.id) ? payload : item))
    : [{ ...payload, id: `MDL-${Date.now()}` }, ...all];
  saveStoredDeviceModels(updated);
  return { success: true, message: 'Saved successfully' };
}

export async function deleteDeviceModel(
  id: number | string
): Promise<{ success: boolean; message?: string }> {
  saveStoredDeviceModels(getStoredDeviceModels().filter((m) => String(m.id) !== String(id)));
  return { success: true, message: 'Deleted successfully' };
}

export const deviceModelService = {
  serverSearch: (body: DeviceModelServerSearchRequest, signal?: AbortSignal) =>
    api.get<ApiListResponse<DeviceModelItem>>(API_URL, { params: body, signal }),
  save: saveDeviceModel,
  delete: deleteDeviceModel,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: (params?: Record<string, unknown>) => api.get(API_URL, { params }),
  fetchDeviceModels,
  fetchDeviceModelSelectList,
  saveDeviceModel,
  deleteDeviceModel,
};
