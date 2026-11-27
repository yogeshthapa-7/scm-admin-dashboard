import type { PaginatedResult } from '@/shared/types/api.types';

export interface DeviceStatusChangeRecord {
  id: number | string;
  deviceInfoId: number | string;
  deviceSerialNo?: string;
  targetDeviceStatusId: number | string;
  targetStatusName?: string;
  colorCode?: string;
  narration: string;
  changeBy: string;
  changeDate?: string;
}

export interface DeviceStatusChangeParams {
  deviceInfoId?: number | string;
  search?: string;
  start?: number;
  length?: number;
  signal?: AbortSignal;
}

export type DeviceStatusChangeResult = PaginatedResult<DeviceStatusChangeRecord>;
