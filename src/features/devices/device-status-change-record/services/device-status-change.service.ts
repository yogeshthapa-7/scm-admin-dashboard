/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/interceptors/interceptors';
import type {
  DeviceStatusChangeRecord,
  DeviceStatusChangeParams,
  DeviceStatusChangeResult,
} from '../types/device-status-change.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://scmdevice-api.himalayankasturi.com.np/api';
export const GET_ALL_STATUS_CHANGE_URL = `${API_BASE_URL}/DeviceStatusChange/GetAllDeviceStatusChange`;
export const GET_STATUS_CHANGE_BY_ID_URL = `${API_BASE_URL}/DeviceStatusChange/GetDeviceStatusChangeById`;

function toItem(raw: any): DeviceStatusChangeRecord {
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    deviceInfoId: raw?.deviceInfoId ?? raw?.DeviceInfoId ?? raw?.deviceId ?? raw?.DeviceId ?? 0,
    deviceSerialNo: raw?.serialNo ?? raw?.SerialNo ?? raw?.serialNumber ?? '',
    targetDeviceStatusId:
      raw?.targetDeviceStatusId ?? raw?.TargetDeviceStatusId ?? raw?.statusId ?? raw?.StatusId ?? 0,
    targetStatusName: raw?.targetStatusName ?? raw?.statusName ?? raw?.StatusName ?? '',
    colorCode: raw?.colorCode ?? raw?.ColorCode ?? raw?.color ?? raw?.Color ?? '',
    narration: raw?.narration ?? raw?.Narration ?? '',
    changeBy: raw?.changeBy ?? raw?.ChangeBy ?? '',
    changeDate: raw?.changeDate ?? raw?.ChangeDate ?? raw?.changedAt ?? raw?.ChangedAt ?? '',
  };
}

function extractItems(payload: any): DeviceStatusChangeRecord[] {
  const candidates = [payload, payload?.data, payload?.items, payload?.result, payload?.records, payload?.data?.data, payload?.data?.items];
  const list = candidates.find(Array.isArray);
  return Array.isArray(list) ? list.map(toItem) : list ? [toItem(list)] : [];
}

export async function fetchDeviceStatusChangeRecords(
  params: DeviceStatusChangeParams = {},
): Promise<DeviceStatusChangeResult> {
  const requestBody: Record<string, unknown> = {
    draw: 1,
    start: params.start ?? 0,
    length: params.length ?? 12,
    searchValue: params.search ?? '',
    sortColumn: '',
    sortDirection: '',
  };
  if (params.deviceInfoId != null) requestBody.deviceInfoId = params.deviceInfoId;

  const res = await api.post(
    GET_ALL_STATUS_CHANGE_URL,
    requestBody,
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

export async function fetchDeviceStatusChangeRecordById(
  id: number | string,
  signal?: AbortSignal,
): Promise<DeviceStatusChangeRecord | null> {
  const res = await api.get(`${GET_STATUS_CHANGE_BY_ID_URL}/${id}`, { signal });
  const raw = res.data?.data ?? res.data;
  if (!raw) return null;
  return toItem(raw);
}

export const deviceStatusChangeService = {
  fetchDeviceStatusChangeRecords,
  fetchDeviceStatusChangeRecordById,
};
