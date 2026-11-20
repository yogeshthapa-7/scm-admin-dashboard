export interface DeviceStatusItem {
  id: number | string;
  statusName: string;
  code: string;
  colorCode: string;
  orderKey: number;
}

export interface DeviceStatusPayload {
  statusName: string;
  code: string;
  colorCode: string;
  orderKey: number;
}

export type DeviceStatusSavePayload = DeviceStatusPayload & { id?: number | string };

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
