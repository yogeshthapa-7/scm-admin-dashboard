/* eslint-disable @typescript-eslint/no-explicit-any */
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const RESOURCE_PATH = '/DeviceModel';
export const API_URL = `${API_BASE_URL}${RESOURCE_PATH}/GetAllDeviceModel`;
export const GET_BY_ID_URL = `${API_BASE_URL}${RESOURCE_PATH}/GetDeviceModelById`;
export const CREATE_URL = `${API_BASE_URL}${RESOURCE_PATH}/CreateDeviceModel`;
export const UPDATE_URL = `${API_BASE_URL}${RESOURCE_PATH}/UpdateDeviceModel`;
export const DELETE_URL = `${API_BASE_URL}${RESOURCE_PATH}/DeleteDeviceModel`;

function toItem(raw: any): DeviceModelItem {
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    name: raw?.modelName ?? raw?.ModelName ?? raw?.name ?? raw?.Name ?? '',
  };
}

function extractItems(payload: any): DeviceModelItem[] {
  const candidates = [payload, payload?.data, payload?.items, payload?.result, payload?.records, payload?.data?.data, payload?.data?.items];
  const list = candidates.find(Array.isArray);
  return Array.isArray(list) ? list.map(toItem) : list ? [toItem(list)] : [];
}

function extractMessage(payload: any, fallback: string): string {
  return payload?.message ?? payload?.Message ?? payload?.msg ?? payload?.error ?? fallback;
}

function responseFailed(payload: any): boolean {
  return Boolean(payload && (payload.success === false || payload.isSuccess === false || String(payload.responseType ?? '').toLowerCase().includes('fail') || String(payload.responseType ?? '').toLowerCase().includes('error')));
}

export async function fetchDeviceModels(params: FetchDeviceModelsParams = {}): Promise<FetchDeviceModelsResult> {
  const res = await api.post(
    API_URL,
    {
      draw: 1,
      start: params.start ?? 0,
      length: params.length ?? 12,
      searchValue: params.search ?? '',
      sortColumn: '',
      sortDirection: '',
    },
    { signal: params.signal },
  );
  const data = res.data?.data ?? res.data?.items ?? res.data?.result ?? res.data?.records ?? res.data;
  const items = extractItems(data);
  return {
    items,
    total: res.data?.recordsTotal ?? res.data?.total ?? res.data?.totalCount ?? items.length,
    filtered: res.data?.recordsFiltered ?? res.data?.filtered ?? res.data?.total ?? items.length,
  };
}

export async function fetchDeviceModelSelectList(): Promise<SelectListItem[]> {
  const res = await api.post(API_URL, {});
  return extractItems(res.data).map((item) => ({ label: item.name, value: item.id }));
}

export async function saveDeviceModel(payload: DeviceModelSavePayload): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const id = payload.id;
  const isUpdate = id !== undefined && id !== null && id !== '' && Number(id) !== 0;
  const resolvedId = Number.isNaN(Number(id)) ? id : Number(id);
  const body = {
    ...(isUpdate ? { id: resolvedId } : {}),
    modelName: payload.name,
  };
  const res = isUpdate
    ? await api.put(`${UPDATE_URL}/${id}?action=UpdateDeviceModel`, body)
    : await api.post(CREATE_URL, body);
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to save device model'), data };
  return { success: true, message: extractMessage(data, 'Device model saved successfully'), data };
}

export async function deleteDeviceModel(id: number | string): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.delete(`${DELETE_URL}/${id}?action=DeleteDeviceModel`);
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to delete device model'), data };
  return { success: true, message: extractMessage(data, 'Device model deleted successfully'), data };
}

export const deviceModelService = {
  serverSearch: (body: DeviceModelServerSearchRequest, signal?: AbortSignal) => api.post<ApiListResponse<DeviceModelItem>>(API_URL, body, { signal }),
  save: saveDeviceModel,
  delete: deleteDeviceModel,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: () => api.post(API_URL, {}),
  fetchDeviceModels,
  fetchDeviceModelSelectList,
  saveDeviceModel,
  deleteDeviceModel,
};
