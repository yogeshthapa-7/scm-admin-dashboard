import type { PaginatedResult } from '@/shared/types/api.types';

export interface DeviceItem {
  id: number | string;
  purchaseMasterId: number | string;
  serialNo: string;
  deviceStatusId: number | string;
  purchaseRefNo?: string;
  statusName?: string;
  modelName?: string;
}

export type DeviceSavePayload = Omit<DeviceItem, 'id'> & { id?: number | string };

export interface DeviceStatusChangePayload {
  deviceInfoId: number | string;
  targetDeviceStatusId: number | string;
  narration: string;
  changeBy: string;
}

export interface FetchDevicesParams {
  purchaseMasterId?: number | string;
  deviceStatusId?: number | string;
  serialNo?: string;
  start?: number;
  length?: number;
  signal?: AbortSignal;
}

export type FetchDevicesResult = PaginatedResult<DeviceItem>;
