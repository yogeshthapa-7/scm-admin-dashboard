import type { ApiListResponse, PaginatedResult, SelectListItem, ServerSearchModel } from '@/shared/types/api.types';

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

export interface DeviceStatusServerSearchRequest {
  model: ServerSearchModel;
  param?: Record<string, unknown>;
}

export interface FetchDeviceStatusParams {
  search?: string;
  start?: number;
  length?: number;
  signal?: AbortSignal;
}

export type FetchDeviceStatusResult = PaginatedResult<DeviceStatusItem>;

export type { ApiListResponse, SelectListItem, ServerSearchModel };
