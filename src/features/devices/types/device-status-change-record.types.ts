export interface DeviceStatusChangeRecord {
  id?: string | number;
  deviceId?: string | number;
  fromStatus?: string | number;
  toStatus?: string | number;
  changedBy?: string;
  changedDate?: string;
  reason?: string;
  remarks?: string;
  [key: string]: unknown;
}

// Save payload for future API integration (no dedicated page/localStorage currently)
export type DeviceStatusChangeRecordSavePayload = DeviceStatusChangeRecord;

export interface ServerSearchModel {
  draw?: number;
  start?: number;
  length?: number;
  search?: { value: string; regex: string };
}

export interface DeviceStatusChangeRecordServerSearchRequest {
  model: ServerSearchModel;
  param?: Record<string, unknown>;
}

export interface ApiListResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  [key: string]: unknown;
}

export interface FetchDeviceStatusChangeRecordsParams {
  search?: string;
  start?: number;
  length?: number;
  deviceId?: string | number;
  signal?: AbortSignal;
}

export interface FetchDeviceStatusChangeRecordsResult {
  items: DeviceStatusChangeRecord[];
  total: number;
  filtered: number;
}

export interface SelectListItem {
  label: string;
  value: string | number;
  [key: string]: unknown;
}
