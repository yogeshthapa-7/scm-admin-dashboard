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

export const RESOURCE_PATH = '/purchase-master';
export const API_URL = `${RESOURCE_PATH}/ServerSearch`;
export const SELECT_LIST_URL = `${RESOURCE_PATH}/SelectList`;
export const SAVE_URL = `${RESOURCE_PATH}/Save`;
export const DELETE_URL = `${RESOURCE_PATH}/Delete`;

export async function fetchPurchases(params: FetchPurchasesParams): Promise<FetchPurchasesResult> {
  try {
    return await doFetchPurchases(params);
  } catch {
    return { items: [], total: 0, filtered: 0 };
  }
}

async function doFetchPurchases(params: FetchPurchasesParams): Promise<FetchPurchasesResult> {
  const body: PurchaseServerSearchRequest = {
    model: {
      draw: 1,
      start: params.start ?? 0,
      length: params.length ?? 12,
      search: { value: (params.search ?? '').trim(), regex: '' },
    },
    param: {
      Status: params.status ?? '',
    },
  };

  const res = await api.post<ApiListResponse<Purchase>>(API_URL, body, {
    signal: params.signal,
  });
  const response = res.data;
  const rows = Array.isArray(response?.data) ? response.data : [];
  return {
    items: rows,
    total: response.recordsTotal ?? rows.length,
    filtered: response.recordsFiltered ?? rows.length,
  };
}

export async function fetchPurchaseSelectList(
  params?: Record<string, unknown>
): Promise<SelectListItem[]> {
  try {
    const res = await api.post<SelectListItem[] | { data?: SelectListItem[] }>(
      SELECT_LIST_URL,
      params ?? {}
    );
    const json = res.data;
    return Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function savePurchase(
  payload: PurchaseSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  try {
    const res = await api.post(SAVE_URL, payload);
    const json = res.data ?? {};
    return {
      success: json.Success ?? json.success ?? true,
      message: json.Message ?? json.message,
      data: json.Data ?? json.data ?? json,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save purchase';
    return { success: false, message };
  }
}

export async function deletePurchase(
  id: string | number
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await api.post(DELETE_URL, { id });
    const json = res.data ?? {};
    return {
      success: json.Success ?? json.success ?? true,
      message: json.Message ?? json.message,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete purchase';
    return { success: false, message };
  }
}

export const purchaseMasterService = {
  serverSearch: (body: PurchaseServerSearchRequest, signal?: AbortSignal) =>
    api.post<ApiListResponse<Purchase>>(API_URL, body, { signal }),
  save: (payload: PurchaseSavePayload) => api.post(SAVE_URL, payload),
  delete: (id: string | number) => api.post(DELETE_URL, { id }),
  selectList: (params?: Record<string, unknown>) => api.post(SELECT_LIST_URL, params ?? {}),
  fetchPurchases,
  fetchPurchaseSelectList,
  savePurchase,
  deletePurchase,
};
