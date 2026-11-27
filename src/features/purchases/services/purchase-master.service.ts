/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/interceptors/interceptors';
import { getAuthUser } from '@/auth/services/auth-session';
import { todayEnglish } from '@/utils/dateConverter';
import type {
  Purchase,
  PurchaseSavePayload,
  PurchaseServerSearchRequest,
  ApiListResponse,
  FetchPurchasesParams,
  FetchPurchasesResult,
  SelectListItem,
} from '../types/purchase.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const RESOURCE_PATH = '/Purchase';
export const API_URL = `${API_BASE_URL}${RESOURCE_PATH}/GetAllPurchase`;
export const GET_BY_ID_URL = `${API_BASE_URL}${RESOURCE_PATH}/GetPurchaseById`;
export const CREATE_URL = `${API_BASE_URL}${RESOURCE_PATH}/CreatePurchase`;
export const UPDATE_URL = `${API_BASE_URL}${RESOURCE_PATH}/UpdatePurchase`;
export const DELETE_URL = `${API_BASE_URL}${RESOURCE_PATH}/DeletePurchase`;
export const APPROVE_URL = (id: number | string) => `${API_BASE_URL}${RESOURCE_PATH}/${id}/approve`;
export const REJECT_URL = (id: number | string) => `${API_BASE_URL}${RESOURCE_PATH}/${id}/reject`;
export const GENERATE_DEVICES_URL = (id: number | string) => `${API_BASE_URL}${RESOURCE_PATH}/${id}/generatedevices`;

function toItem(raw: any): Purchase {
  const rawDate = raw?.tranDate ?? raw?.trnDate ?? raw?.TranDate ?? raw?.TrnDate ?? '';
  const rawStatus = raw?.status ?? raw?.Status ?? raw?.purchaseStatus ?? raw?.PurchaseStatus;
  const normalizedStatus = typeof rawStatus === 'string'
    ? ({
        deleted: 0,
        approved: 1,
        draft: 2,
        generated: 3,
        rejected: 4,
      } as Record<string, number>)[rawStatus.trim().toLowerCase()]
    : rawStatus;
  return {
    id: Number(raw?.id ?? raw?.Id ?? 0),
    trnDate: String(rawDate).slice(0, 10),
    refNo: raw?.refNo ?? raw?.RefNo ?? '',
    narration: raw?.narration ?? raw?.Narration ?? '',
    companyInfoId: String(raw?.companyInfoId ?? raw?.CompanyInfoId ?? ''),
    companyName: raw?.companyName ?? raw?.CompanyName ?? '',
    make: raw?.make ?? raw?.Make ?? '',
    deviceModelId: String(raw?.deviceModelId ?? raw?.DeviceModelId ?? ''),
    deviceModel: raw?.deviceModel ?? raw?.DeviceModel ?? raw?.modelName ?? raw?.ModelName ?? '',
    snPrefix: raw?.snPrefix ?? raw?.SnPrefix ?? '',
    snPadding: Number(raw?.snPadding ?? raw?.SnPadding ?? 0),
    startingNumber: Number(raw?.startingNumber ?? 0),
    snStart: raw?.snStart ?? raw?.SnStart,
    totalItem: Number(raw?.totalQty ?? raw?.TotalQty ?? raw?.totalItem ?? raw?.TotalItem ?? 0),
    status: (normalizedStatus === undefined || normalizedStatus === null || normalizedStatus === '' ? 2 : Number(normalizedStatus)) as Purchase['status'],
    rejectedDate: raw?.rejectedDate ?? raw?.RejectedDate,
    rejectedBy: raw?.rejectedBy ?? raw?.RejectedBy,
    rejectedReason: raw?.rejectedReason ?? raw?.RejectedReason,
  };
}

function extractItems(payload: any): Purchase[] {
  const candidates = [payload, payload?.data, payload?.items, payload?.result, payload?.records, payload?.data?.data, payload?.data?.items];
  const list = candidates.find(Array.isArray);
  return Array.isArray(list) ? list.map(toItem) : list ? [toItem(list)] : [];
}

function addDerivedSerialStarts(items: Purchase[]): Purchase[] {
  const nextByPrefix = new Map<string, number>();
  const ordered = [...items].sort((a, b) => a.id - b.id);
  const starts = new Map<number, number>();

  ordered.forEach((purchase) => {
    const prefix = String(purchase.snPrefix || '').trim();
    const start = purchase.startingNumber ?? purchase.snStart ?? nextByPrefix.get(prefix) ?? 1;
    starts.set(purchase.id, start);
    nextByPrefix.set(prefix, start + Math.max(0, Number(purchase.totalItem || 0)));
  });

  return items.map((purchase) => ({
    ...purchase,
    snStart: starts.get(purchase.id) ?? purchase.snStart ?? 1,
  }));
}

function extractMessage(payload: any, fallback: string): string {
  return payload?.message ?? payload?.Message ?? payload?.msg ?? payload?.error ?? fallback;
}

function responseFailed(payload: any): boolean {
  return Boolean(payload && (payload.success === false || payload.isSuccess === false || String(payload.responseType ?? '').toLowerCase().includes('fail') || String(payload.responseType ?? '').toLowerCase().includes('error')));
}

export async function fetchPurchases(params: FetchPurchasesParams = {}): Promise<FetchPurchasesResult> {
  const hasClientFilter = params.status != null || Boolean(params.fromDate) || Boolean(params.toDate);
  const requestBody = {
    draw: 1,
    start: hasClientFilter ? 0 : (params.start ?? 0),
    length: hasClientFilter ? 100000 : (params.length ?? 12),
    searchValue: params.search ?? '',
    sortColumn: '',
    sortDirection: '',
  };

  const res = await api.post(
    API_URL,
    requestBody,
    { signal: params.signal },
  );
  const data = res.data?.data ?? res.data?.items ?? res.data?.result ?? res.data?.records ?? res.data;
  const allItems = addDerivedSerialStarts(extractItems(data));

  if (hasClientFilter) {
    const status = params.status == null ? '' : String(params.status);
    const fromDate = params.fromDate ?? '';
    const toDate = params.toDate ?? '';
    const filtered = allItems.filter((purchase) => {
      const transactionDate = purchase.trnDate.slice(0, 10);
      const matchesDate = (!fromDate || transactionDate >= fromDate) && (!toDate || transactionDate <= toDate);
      return (!status || String(purchase.status) === status) && matchesDate;
    });
    const start = params.start ?? 0;
    const length = params.length ?? (filtered.length || 12);
    return {
      items: filtered.slice(start, start + length),
      total: filtered.length,
      filtered: filtered.length,
    };
  }

  return {
    items: allItems,
    total: res.data?.recordsTotal ?? res.data?.total ?? res.data?.totalCount ?? allItems.length,
    filtered: res.data?.recordsFiltered ?? res.data?.filtered ?? res.data?.total ?? allItems.length,
  };
}

export async function fetchPurchaseSelectList(): Promise<SelectListItem[]> {
  const res = await api.post(API_URL, {});
  return extractItems(res.data).map((item) => ({ label: item.refNo, value: item.id }));
}

export async function savePurchase(payload: PurchaseSavePayload): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const id = payload.id;
  const isUpdate = id !== undefined && id !== null && id !== 0;
  const resolvedId = Number.isNaN(Number(id)) ? id : Number(id);
  const body = {
    ...(isUpdate ? { id: resolvedId } : {}),
    tranDate: payload.trnDate.length === 10 ? `${payload.trnDate}T00:00:00.000Z` : payload.trnDate,
    refNo: payload.refNo,
    narration: payload.narration,
    companyInfoId: Number(payload.companyInfoId),
    make: payload.make,
    deviceModelId: Number(payload.deviceModelId),
    snPrefix: payload.snPrefix,
    snPadding: Number(payload.snPadding),
    totalQty: Number(payload.totalItem),
    startingNumber: Number(payload.startingNumber),
  };
  const res = isUpdate
    ? await api.put(`${UPDATE_URL}/${id}?action=UpdatePurchase`, body)
    : await api.post(CREATE_URL, body);
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to save purchase'), data };
  return { success: true, message: extractMessage(data, 'Purchase saved successfully'), data };
}

export async function deletePurchase(id: number | string): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.delete(`${DELETE_URL}/${id}?action=DeletePurchase`);
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to delete purchase'), data };
  return { success: true, message: extractMessage(data, 'Purchase deleted successfully'), data };
}

export async function approvePurchase(id: number | string): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.post(APPROVE_URL(id), {});
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to approve purchase'), data };
  return { success: true, message: extractMessage(data, 'Purchase approved successfully'), data };
}

export async function rejectPurchase(id: number | string, reason: string): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const user = getAuthUser();
  const rejectedBy = String(user?.id ?? user?.username ?? user?.name ?? '').trim();
  const res = await api.post(REJECT_URL(id), {
    id: Number(id),
    rejectedReason: reason,
    rejectedDate: todayEnglish(),
    rejectedBy,
  });
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to reject purchase'), data };
  return { success: true, message: extractMessage(data, 'Purchase rejected successfully'), data };
}

export async function generatePurchaseDevices(id: number | string): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.post(GENERATE_DEVICES_URL(id), {});
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to generate devices'), data };
  return { success: true, message: extractMessage(data, 'Devices generated successfully'), data };
}

export const purchaseMasterService = {
  serverSearch: (body: PurchaseServerSearchRequest, signal?: AbortSignal) => api.post<ApiListResponse<Purchase>>(API_URL, body, { signal }),
  save: savePurchase,
  delete: deletePurchase,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: () => api.post(API_URL, {}),
  fetchPurchases,
  fetchPurchaseSelectList,
  savePurchase,
  deletePurchase,
  approvePurchase,
  rejectPurchase,
  generatePurchaseDevices,
};
