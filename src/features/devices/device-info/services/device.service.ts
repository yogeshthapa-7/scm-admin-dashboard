/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/interceptors/interceptors';
import type { DeviceItem, DeviceSavePayload, DeviceStatusChangePayload, FetchDevicesParams, FetchDevicesResult } from '../types/device.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const API_URL = `${API_BASE_URL}/Device/GetAllDevice`;
export const GET_BY_ID_URL = `${API_BASE_URL}/Device/GetDeviceById`;
export const CREATE_URL = `${API_BASE_URL}/Device/CreateDevice`;
export const UPDATE_URL = `${API_BASE_URL}/Device/UpdateDevice`;
export const DELETE_URL = `${API_BASE_URL}/Device/DeleteDevice`;
export const CREATE_STATUS_CHANGE_URL = `${API_BASE_URL}/DeviceStatusChange/CreateDeviceStatusChange`;

function toItem(raw: any): DeviceItem {
  const statusId = raw?.deviceStatusId ?? raw?.DeviceStatusId ?? raw?.statusId ?? raw?.StatusId ?? 0;
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    purchaseMasterId: raw?.purchaseMasterId ?? raw?.PurchaseMasterId ?? 0,
    serialNo: raw?.serialNo ?? raw?.SerialNo ?? raw?.serialNumber ?? raw?.SerialNumber ?? '',
    deviceStatusId: statusId,
    purchaseRefNo: raw?.purchaseRefNo ?? raw?.PurchaseRefNo ?? raw?.refNo ?? raw?.RefNo,
    statusName: raw?.deviceStatusName ?? raw?.DeviceStatusName ?? raw?.statusName ?? raw?.StatusName,
    modelName: raw?.modelName ?? raw?.ModelName ?? raw?.deviceModelName ?? raw?.DeviceModelName ?? raw?.model ?? raw?.Model,
  };
}

function extractItems(payload: any): DeviceItem[] {
  const candidates = [payload, payload?.data, payload?.items, payload?.result, payload?.records, payload?.data?.data, payload?.data?.items];
  const list = candidates.find(Array.isArray);
  return Array.isArray(list) ? list.map(toItem) : list ? [toItem(list)] : [];
}

function messageOf(payload: any, fallback: string): string {
  return payload?.message ?? payload?.Message ?? payload?.msg ?? payload?.error ?? fallback;
}

function failed(payload: any): boolean {
  return Boolean(payload && (payload.success === false || payload.isSuccess === false || String(payload.responseType ?? '').toLowerCase().includes('fail') || String(payload.responseType ?? '').toLowerCase().includes('error')));
}

export async function fetchDevices(params: FetchDevicesParams = {}): Promise<FetchDevicesResult> {
  const res = await api.get(API_URL, {
    params: {
      ...(params.purchaseMasterId ? { purchaseMasterId: params.purchaseMasterId } : {}),
      ...(params.deviceStatusId ? { deviceStatusId: params.deviceStatusId } : {}),
      ...(params.serialNo ? { serialNo: params.serialNo } : {}),
    },
    signal: params.signal,
  });
  const items = extractItems(res.data).filter((item) => (
    (!params.purchaseMasterId || String(item.purchaseMasterId) === String(params.purchaseMasterId))
    && (!params.deviceStatusId || String(item.deviceStatusId) === String(params.deviceStatusId))
    && (!params.serialNo || item.serialNo?.toLowerCase().includes(params.serialNo.toLowerCase()))
  ));
  const start = params.start ?? 0;
  const length = params.length ?? (items.length || 12);
  return { items: items.slice(start, start + length), total: items.length, filtered: items.length };
}

export async function saveDevice(payload: DeviceSavePayload): Promise<{ success: boolean; message?: string; data?: unknown }> {
  if (payload.id === undefined || payload.id === null || payload.id === '' || Number(payload.id) === 0) {
    return { success: false, message: 'Device id is required for update' };
  }
  const id = typeof payload.id === 'string' && /^\d+$/.test(payload.id) ? Number(payload.id) : payload.id;
  const purchaseMasterId = typeof payload.purchaseMasterId === 'string' && /^\d+$/.test(payload.purchaseMasterId) ? Number(payload.purchaseMasterId) : payload.purchaseMasterId;
  const deviceStatusId = typeof payload.deviceStatusId === 'string' && /^\d+$/.test(payload.deviceStatusId) ? Number(payload.deviceStatusId) : payload.deviceStatusId;

  const body: Record<string, unknown> = {
    id,
    Id: id,
    purchaseMasterId,
    serialNo: String(payload.serialNo ?? '').trim(),
    deviceStatusId,
  };

  const res = await api.put(`${UPDATE_URL}/${payload.id}?action=UpdateDevice`, body);

  if (failed(res.data)) {
    return { success: false, message: messageOf(res.data, 'Failed to update device'), data: res.data };
  }

  return { success: true, message: messageOf(res.data, 'Device updated successfully'), data: res.data };
}

export async function deleteDevice(id: number | string): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.delete(`${DELETE_URL}/${id}?action=DeleteDevice`);
  if (failed(res.data)) return { success: false, message: messageOf(res.data, 'Failed to delete device'), data: res.data };
  return { success: true, message: messageOf(res.data, 'Device deleted successfully'), data: res.data };
}

export async function createDeviceStatusChange(payload: DeviceStatusChangePayload): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.post(CREATE_STATUS_CHANGE_URL, {
    deviceInfoId: Number(payload.deviceInfoId),
    targetDeviceStatusId: Number(payload.targetDeviceStatusId),
    narration: payload.narration || 'status change',
    changeBy: payload.changeBy,
  });
  if (failed(res.data)) return { success: false, message: messageOf(res.data, 'Failed to update device status'), data: res.data };
  return { success: true, message: messageOf(res.data, 'Device status updated successfully'), data: res.data };
}

export const deviceService = { fetchDevices, saveDevice, deleteDevice, createDeviceStatusChange, getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`) };
