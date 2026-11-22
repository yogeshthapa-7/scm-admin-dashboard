import type { ApiListResponse, PaginatedResult, SelectListItem, ServerSearchModel } from '@/shared/types/api.types';

export interface DeviceModelItem {
  id: number | string;
  name: string;
}

export type DeviceModelSavePayload = DeviceModelItem;

export interface DeviceModelServerSearchRequest {
  model: ServerSearchModel;
  param?: Record<string, unknown>;
}

export interface FetchDeviceModelsParams {
  search?: string;
  start?: number;
  length?: number;
  signal?: AbortSignal;
}

export type FetchDeviceModelsResult = PaginatedResult<DeviceModelItem>;

export type { ApiListResponse, SelectListItem, ServerSearchModel };
