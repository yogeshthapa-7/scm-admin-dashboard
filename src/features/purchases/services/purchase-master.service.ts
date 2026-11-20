/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/interceptors/interceptors';
import type {
  Purchase,
  PurchaseSavePayload,
  PurchaseServerSearchRequest,
  ApiListResponse,
  FetchPurchasesParams,
  FetchPurchasesResult,
  SelectListItem,
} from '../types/purchase.types';

const BASE_URL = 'http://scmdevice.himalayankasturi.com.np/api';
export const RESOURCE_PATH = '/Purchase';
export const API_URL = `${BASE_URL}${RESOURCE_PATH}/GetAllPurchase`;
export const GET_BY_ID_URL = `${BASE_URL}${RESOURCE_PATH}/GetPurchaseById`;
export const CREATE_URL = `${BASE_URL}${RESOURCE_PATH}/CreatePurchase`;
export const UPDATE_URL = `${BASE_URL}${RESOURCE_PATH}/UpdatePurchase`;
export const DELETE_URL = `${BASE_URL}${RESOURCE_PATH}/DeletePurchase`;

function toItem(raw: any): Purchase {
  const rawDate = raw?.tranDate ?? raw?.trnDate ?? raw?.TranDate ?? raw?.TrnDate ?? '';
  const rawStatus = raw?.status ?? raw?.Status;
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
    snStart: raw?.snStart ?? raw?.SnStart,
    totalItem: Number(raw?.totalQty ?? raw?.TotalQty ?? raw?.totalItem ?? raw?.TotalItem ?? 0),
    status: (rawStatus === undefined || rawStatus === null || rawStatus === '' ? 2 : Number(rawStatus)) as Purchase['status'],
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

function extractTotal(payload: any, items: Purchase[]): number {
  const candidates = [payload?.recordsTotal, payload?.total, payload?.totalCount, payload?.recordsFiltered, payload?.data?.recordsTotal, payload?.data?.total, payload?.data?.totalCount];
  for (const value of candidates) {
    const total = Number(value);
    if (Number.isFinite(total) && total >= 0) return total;
  }
  return items.length;
}

function addDerivedSerialStarts(items: Purchase[]): Purchase[] {
  const nextByPrefix = new Map<string, number>();
  const ordered = [...items].sort((a, b) => a.id - b.id);
  const starts = new Map<number, number>();

  ordered.forEach((purchase) => {
    const prefix = String(purchase.snPrefix || '').trim();
    const start = purchase.snStart ?? nextByPrefix.get(prefix) ?? 1;
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
  const res = await api.get(API_URL, { signal: params.signal });
  const all = addDerivedSerialStarts(extractItems(res.data));
  const search = (params.search ?? '').trim().toLowerCase();
  const status = params.status == null ? '' : String(params.status);
  const filtered = all.filter((purchase) => {
    const matchesSearch = !search || purchase.refNo.toLowerCase().includes(search) || purchase.deviceModel.toLowerCase().includes(search) || purchase.make.toLowerCase().includes(search);
    return matchesSearch && (!status || String(purchase.status) === status);
  });
  const start = params.start ?? 0;
  const length = params.length ?? (filtered.length || 12);
  return { items: filtered.slice(start, start + length), total: search || status ? filtered.length : extractTotal(res.data, all), filtered: filtered.length };
}

export async function fetchPurchaseSelectList(): Promise<SelectListItem[]> {
  const res = await api.get(API_URL);
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

export const purchaseMasterService = {
  serverSearch: (body: PurchaseServerSearchRequest, signal?: AbortSignal) => api.get<ApiListResponse<Purchase>>(API_URL, { params: body, signal }),
  save: savePurchase,
  delete: deletePurchase,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: () => api.get(API_URL),
  fetchPurchases,
  fetchPurchaseSelectList,
  savePurchase,
  deletePurchase,
};
