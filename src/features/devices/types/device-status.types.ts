export interface DeviceStatusItem {
  id: string;
  statusName: string;
  code: string;
  colorCode: string;
  orderKey: number;
}

// Save payload matches current key/values used in DeviceStatus page
export type DeviceStatusSavePayload = DeviceStatusItem;

export interface ServerSearchModel {
  draw?: number;
  start?: number;
  length?: number;
  search?: { value: string; regex: string };
}

export interface DeviceStatusServerSearchRequest {
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

export interface FetchDeviceStatusParams {
  search?: string;
  start?: number;
  length?: number;
  signal?: AbortSignal;
}

export interface FetchDeviceStatusResult {
  items: DeviceStatusItem[];
  total: number;
  filtered: number;
}

export interface SelectListItem {
  label: string;
  value: string | number;
  [key: string]: unknown;
}
