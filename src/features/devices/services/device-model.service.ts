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

export const RESOURCE_PATH = '/device-models';
export const API_URL = `${RESOURCE_PATH}/ServerSearch`;
export const SELECT_LIST_URL = `${RESOURCE_PATH}/SelectList`;
export const SAVE_URL = `${RESOURCE_PATH}/Save`;
export const DELETE_URL = `${RESOURCE_PATH}/Delete`;

export async function fetchDeviceModels(
  params: FetchDeviceModelsParams
): Promise<FetchDeviceModelsResult> {
  try {
    return await doFetchDeviceModels(params);
  } catch {
    return { items: [], total: 0, filtered: 0 };
  }
}

async function doFetchDeviceModels(
  params: FetchDeviceModelsParams
): Promise<FetchDeviceModelsResult> {
  const body: DeviceModelServerSearchRequest = {
    model: {
      draw: 1,
      start: params.start ?? 0,
      length: params.length ?? 12,
      search: { value: (params.search ?? '').trim(), regex: '' },
    },
    param: {},
  };

  const res = await api.post<ApiListResponse<DeviceModelItem>>(API_URL, body, {
    signal: params.signal,
  });
  const response = res.data;
  const rows = Array.isArray(response?.data) ? response.data : [];
  return {
    items: rows,
    total: response.recordsTotal ?? rows.length,
    filtered: response.recordsFiltered ?? rows.length,
  };
}

export async function fetchDeviceModelSelectList(
  params?: Record<string, unknown>
): Promise<SelectListItem[]> {
  try {
    const res = await api.post<SelectListItem[] | { data?: SelectListItem[] }>(
      SELECT_LIST_URL,
      params ?? {}
    );
    const json = res.data;
    return Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function saveDeviceModel(
  payload: DeviceModelSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  try {
    const res = await api.post(SAVE_URL, payload);
    const json = res.data ?? {};
    return {
      success: json.Success ?? json.success ?? true,
      message: json.Message ?? json.message,
      data: json.Data ?? json.data ?? json,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save device model';
    return { success: false, message };
  }
}

export async function deleteDeviceModel(
  id: string | number
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await api.post(DELETE_URL, { id });
    const json = res.data ?? {};
    return {
      success: json.Success ?? json.success ?? true,
      message: json.Message ?? json.message,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete device model';
    return { success: false, message };
  }
}

export const deviceModelService = {
  serverSearch: (body: DeviceModelServerSearchRequest, signal?: AbortSignal) =>
    api.post<ApiListResponse<DeviceModelItem>>(API_URL, body, { signal }),
  save: (payload: DeviceModelSavePayload) => api.post(SAVE_URL, payload),
  delete: (id: string | number) => api.post(DELETE_URL, { id }),
  selectList: (params?: Record<string, unknown>) => api.post(SELECT_LIST_URL, params ?? {}),
  fetchDeviceModels,
  fetchDeviceModelSelectList,
  saveDeviceModel,
  deleteDeviceModel,
};
