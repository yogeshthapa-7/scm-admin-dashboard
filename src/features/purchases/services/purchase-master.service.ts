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

export const RESOURCE_PATH = '/Purchase';
export const API_URL = `${RESOURCE_PATH}/GetAllPurchase`;
export const GET_BY_ID_URL = `${RESOURCE_PATH}/GetPurchaseById`;
export const CREATE_URL = `${RESOURCE_PATH}/CreatePurchase`;
export const UPDATE_URL = `${RESOURCE_PATH}/UpdatePurchase`;
export const DELETE_URL = `${RESOURCE_PATH}/DeletePurchase`;

function getStoredPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem('scm_purchases');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchPurchases(params: FetchPurchasesParams): Promise<FetchPurchasesResult> {
  const search = (params.search ?? '').trim().toLowerCase();
  const status = params.status == null ? '' : String(params.status);
  const filtered = getStoredPurchases().filter((purchase) => {
    const matchesSearch = !search || purchase.refNo.toLowerCase().includes(search) || purchase.deviceModel.toLowerCase().includes(search) || purchase.make.toLowerCase().includes(search);
    const matchesStatus = !status || String(purchase.status) === status;
    return matchesSearch && matchesStatus;
  });
  const start = params.start ?? 0;
  const length = params.length ?? 12;
  return {
    items: filtered.slice(start, start + length),
    total: filtered.length,
    filtered: filtered.length,
  };
}

export async function fetchPurchaseSelectList(
  _params?: Record<string, unknown>
): Promise<SelectListItem[]> {
  return getStoredPurchases().map((item) => ({ label: item.refNo, value: item.id }));
}

export async function savePurchase(
  payload: PurchaseSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const all = getStoredPurchases();
  const updated = payload.id
    ? all.map((purchase) => (purchase.id === payload.id ? payload : purchase))
    : [{ ...payload, id: Math.max(0, ...all.map((purchase) => purchase.id)) + 1 }, ...all];
  localStorage.setItem('scm_purchases', JSON.stringify(updated));
  return { success: true, message: 'Saved successfully', data: payload };
}

export async function deletePurchase(
  id: number
): Promise<{ success: boolean; message?: string }> {
  localStorage.setItem('scm_purchases', JSON.stringify(getStoredPurchases().filter((purchase) => purchase.id !== id)));
  return { success: true, message: 'Deleted successfully' };
}

export const purchaseMasterService = {
  serverSearch: (body: PurchaseServerSearchRequest, signal?: AbortSignal) =>
    api.get<ApiListResponse<Purchase>>(API_URL, { params: body, signal }),
  save: (payload: PurchaseSavePayload) => payload.id
    ? api.put(`${UPDATE_URL}/${payload.id}`, payload)
    : api.post(CREATE_URL, payload),
  delete: (id: number) => api.delete(`${DELETE_URL}/${id}`),
  getById: (id: number) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: (params?: Record<string, unknown>) => api.get(API_URL, { params }),
  fetchPurchases,
  fetchPurchaseSelectList,
  savePurchase,
  deletePurchase,
};
