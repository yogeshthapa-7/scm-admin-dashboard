import api from '@/interceptors/interceptors';
import type {
  CompanyInfoItem,
  CompanyInfoSavePayload,
  CompanyInfoServerSearchRequest,
  ApiListResponse,
  FetchCompanyInfoParams,
  FetchCompanyInfoResult,
  SelectListItem,
} from '../types/company-info.types';

export const RESOURCE_PATH = '/CompanyInfo';
export const API_URL = `${RESOURCE_PATH}/GetAllCompanyInfo`;
export const GET_BY_ID_URL = `${RESOURCE_PATH}/GetCompanyInfoById`;
export const CREATE_URL = `${RESOURCE_PATH}/CreateCompanyInfo`;
export const UPDATE_URL = `${RESOURCE_PATH}/UpdateCompanyInfo`;
export const DELETE_URL = `${RESOURCE_PATH}/DeleteCompanyInfo`;

const STORAGE_KEY = 'company_info';

function getStoredCompanies(): CompanyInfoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCompanies(items: CompanyInfoItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export async function fetchCompanyInfo(
  params: FetchCompanyInfoParams
): Promise<FetchCompanyInfoResult> {
  const all = getStoredCompanies();
  const search = (params.search ?? '').trim().toLowerCase();
  const filtered = search
    ? all.filter((c) => c.fullName.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.address.toLowerCase().includes(search))
    : all;
  const start = params.start ?? 0;
  const length = params.length ?? 12;
  return {
    items: filtered.slice(start, start + length),
    total: filtered.length,
    filtered: filtered.length,
  };
}

export async function fetchCompanyInfoSelectList(
  _params?: Record<string, unknown>
): Promise<SelectListItem[]> {
  return getStoredCompanies().map((item) => ({ label: item.fullName, value: item.id }));
}

export async function saveCompanyInfo(
  payload: CompanyInfoSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const all = getStoredCompanies();
  const updated = payload.id
    ? all.map((c) => (String(c.id) === String(payload.id) ? payload : c))
    : [{ ...payload, id: `CMP-${Date.now()}` }, ...all];
  saveStoredCompanies(updated);
  return { success: true, message: 'Saved successfully' };
}

export async function deleteCompanyInfo(
  id: number | string
): Promise<{ success: boolean; message?: string }> {
  saveStoredCompanies(getStoredCompanies().filter((c) => String(c.id) !== String(id)));
  return { success: true, message: 'Deleted successfully' };
}

export const companyInfoService = {
  serverSearch: (body: CompanyInfoServerSearchRequest, signal?: AbortSignal) =>
    api.get<ApiListResponse<CompanyInfoItem>>(API_URL, { params: body, signal }),
  save: saveCompanyInfo,
  delete: deleteCompanyInfo,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: (params?: Record<string, unknown>) => api.get(API_URL, { params }),
  fetchCompanyInfo,
  fetchCompanyInfoSelectList,
  saveCompanyInfo,
  deleteCompanyInfo,
};
