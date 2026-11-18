import api from '@/interceptors/interceptors';
import type {
  DeviceStatusChangeRecord,
  DeviceStatusChangeRecordSavePayload,
  DeviceStatusChangeRecordServerSearchRequest,
  ApiListResponse,
  FetchDeviceStatusChangeRecordsParams,
  FetchDeviceStatusChangeRecordsResult,
  SelectListItem,
} from '../types/device-status-change-record.types';

export const RESOURCE_PATH = '/device-status-change-records';
export const API_URL = `${RESOURCE_PATH}/ServerSearch`;
export const SELECT_LIST_URL = `${RESOURCE_PATH}/SelectList`;
export const SAVE_URL = `${RESOURCE_PATH}/Save`;
export const DELETE_URL = `${RESOURCE_PATH}/Delete`;

export async function fetchDeviceStatusChangeRecords(
  params: FetchDeviceStatusChangeRecordsParams
): Promise<FetchDeviceStatusChangeRecordsResult> {
  try {
    return await doFetchDeviceStatusChangeRecords(params);
  } catch {
    return { items: [], total: 0, filtered: 0 };
  }
}

async function doFetchDeviceStatusChangeRecords(
  params: FetchDeviceStatusChangeRecordsParams
): Promise<FetchDeviceStatusChangeRecordsResult> {
  const body: DeviceStatusChangeRecordServerSearchRequest = {
    model: {
      draw: 1,
      start: params.start ?? 0,
      length: params.length ?? 12,
      search: { value: (params.search ?? '').trim(), regex: '' },
    },
    param: {
      DeviceId: params.deviceId,
    },
  };

  const res = await api.post<ApiListResponse<DeviceStatusChangeRecord>>(API_URL, body, {
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

export async function fetchDeviceStatusChangeRecordSelectList(
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

export async function saveDeviceStatusChangeRecord(
  payload: DeviceStatusChangeRecordSavePayload
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
    const message = error instanceof Error ? error.message : 'Failed to save device status change record';
    return { success: false, message };
  }
}

export async function deleteDeviceStatusChangeRecord(
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
    const message = error instanceof Error ? error.message : 'Failed to delete device status change record';
    return { success: false, message };
  }
}

export const deviceStatusChangeRecordService = {
  serverSearch: (body: DeviceStatusChangeRecordServerSearchRequest, signal?: AbortSignal) =>
    api.post<ApiListResponse<DeviceStatusChangeRecord>>(API_URL, body, { signal }),
  save: (payload: DeviceStatusChangeRecordSavePayload) => api.post(SAVE_URL, payload),
  delete: (id: string | number) => api.post(DELETE_URL, { id }),
  selectList: (params?: Record<string, unknown>) => api.post(SELECT_LIST_URL, params ?? {}),
  fetchDeviceStatusChangeRecords,
  fetchDeviceStatusChangeRecordSelectList,
  saveDeviceStatusChangeRecord,
  deleteDeviceStatusChangeRecord,
};
