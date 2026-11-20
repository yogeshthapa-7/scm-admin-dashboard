export interface DeviceModelItem {
  id: number | string;
  name: string;
}

export type DeviceModelSavePayload = DeviceModelItem;

export interface ServerSearchModel {
  draw?: number;
  start?: number;
  length?: number;
  search?: { value: string; regex: string };
}

export interface DeviceModelServerSearchRequest {
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

export interface FetchDeviceModelsParams {
  search?: string;
  start?: number;
  length?: number;
  signal?: AbortSignal;
}

export interface FetchDeviceModelsResult {
  items: DeviceModelItem[];
  total: number;
  filtered: number;
}

export interface SelectListItem {
  label: string;
  value: string | number;
  [key: string]: unknown;
}
