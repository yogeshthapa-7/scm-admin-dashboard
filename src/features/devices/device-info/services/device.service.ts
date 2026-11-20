/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/interceptors/interceptors';
import type { DeviceItem, DeviceSavePayload, FetchDevicesParams, FetchDevicesResult } from '../types/device.types';

const BASE_URL = 'http://scmdevice.himalayankasturi.com.np/api';
export const API_URL = `${BASE_URL}/Device/GetAllDevice`;
export const GET_BY_ID_URL = `${BASE_URL}/Device/GetDeviceById`;
export const CREATE_URL = `${BASE_URL}/Device/CreateDevice`;
export const UPDATE_URL = `${BASE_URL}/Device/UpdateDevice`;
export const DELETE_URL = `${BASE_URL}/Device/DeleteDevice`;
const GENERATED_DEVICES_KEY = 'generated_devices_fallback';

function toItem(raw: any): DeviceItem {
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    purchaseMasterId: raw?.purchaseMasterId ?? raw?.PurchaseMasterId ?? 0,
    serialNo: raw?.serialNo ?? raw?.SerialNo ?? raw?.serialNumber ?? raw?.SerialNumber ?? '',
    deviceStatusId: raw?.deviceStatusId ?? raw?.DeviceStatusId ?? 0,
    purchaseRefNo: raw?.purchaseRefNo ?? raw?.PurchaseRefNo ?? raw?.refNo ?? raw?.RefNo,
    statusName: raw?.statusName ?? raw?.StatusName,
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

function loadGeneratedDevices(): DeviceItem[] {
  try {
    const raw = localStorage.getItem(GENERATED_DEVICES_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items)
      ? items.map((item) => ({
          id: item.id,
          purchaseMasterId: item.purchaseMasterId,
          serialNo: item.serialNumber ?? item.serialNo ?? '',
          deviceStatusId: item.deviceStatusId ?? 0,
          statusName: item.statusName ?? item.status ?? 'Available',
          modelName: item.modelName ?? item.model ?? '',
        }))
      : [];
  } catch {
    return [];
  }
}

export async function fetchDevices(params: FetchDevicesParams = {}): Promise<FetchDevicesResult> {
  let apiItems: DeviceItem[] = [];
  try {
    const res = await api.get(API_URL, {
      params: {
        ...(params.purchaseMasterId ? { purchaseMasterId: params.purchaseMasterId } : {}),
        ...(params.deviceStatusId ? { deviceStatusId: params.deviceStatusId } : {}),
      },
      signal: params.signal,
    });
    apiItems = extractItems(res.data);
  } catch {
    // Keep generated fallback records visible until the generation API is available.
  }
  const fallbackItems = loadGeneratedDevices();
  const merged = [...apiItems, ...fallbackItems].filter(
    (item, index, all) => all.findIndex((candidate) => String(candidate.serialNo) === String(item.serialNo)) === index,
  );
  const items = merged.filter((item) => (
    (!params.purchaseMasterId || String(item.purchaseMasterId) === String(params.purchaseMasterId))
    && (!params.deviceStatusId || String(item.deviceStatusId) === String(params.deviceStatusId))
  ));
  const total = items.length;
  const start = params.start ?? 0;
  const length = params.length ?? (items.length || 12);
  return { items: items.slice(start, start + length), total: Number.isFinite(total) ? total : items.length, filtered: items.length };
}

export async function saveDevice(payload: DeviceSavePayload): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const isUpdate = payload.id !== undefined && payload.id !== null && payload.id !== '' && Number(payload.id) !== 0;
  const id = Number.isNaN(Number(payload.id)) ? payload.id : Number(payload.id);
  const body = isUpdate
    ? { id, serialNo: payload.serialNo }
    : { purchaseMasterId: Number(payload.purchaseMasterId), serialNo: payload.serialNo, deviceStatusId: Number(payload.deviceStatusId) };
  const res = isUpdate
    ? await api.put(`${UPDATE_URL}/${payload.id}?action=UpdateDevice`, body)
    : await api.post(CREATE_URL, body);
  if (failed(res.data)) return { success: false, message: messageOf(res.data, 'Failed to save device'), data: res.data };
  return { success: true, message: messageOf(res.data, 'Device saved successfully'), data: res.data };
}

export async function deleteDevice(id: number | string): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.delete(`${DELETE_URL}/${id}?action=DeleteDevice`);
  if (failed(res.data)) return { success: false, message: messageOf(res.data, 'Failed to delete device'), data: res.data };
  return { success: true, message: messageOf(res.data, 'Device deleted successfully'), data: res.data };
}

export const deviceService = { fetchDevices, saveDevice, deleteDevice, getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`) };
