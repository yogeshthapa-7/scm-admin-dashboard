/* eslint-disable @typescript-eslint/no-explicit-any */
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const RESOURCE_PATH = '/CompanyInfo';
export const API_URL = `${API_BASE_URL}${RESOURCE_PATH}/GetAllCompanyInfo`;
export const GET_BY_ID_URL = `${API_BASE_URL}${RESOURCE_PATH}/GetCompanyInfoById`;
export const CREATE_URL = `${API_BASE_URL}${RESOURCE_PATH}/CreateCompanyInfo`;
export const UPDATE_URL = `${API_BASE_URL}${RESOURCE_PATH}/UpdateCompanyInfo`;
export const DELETE_URL = `${API_BASE_URL}${RESOURCE_PATH}/DeleteCompanyInfo`;

function toItem(raw: any): CompanyInfoItem {
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    fullName: raw?.fullName ?? raw?.FullName ?? '',
    email: raw?.email ?? raw?.Email ?? '',
    address: raw?.address ?? raw?.Address ?? '',
    contactNo: raw?.contactNo ?? raw?.ContactNo ?? '',
    websiteUrl: raw?.websiteUrl ?? raw?.WebsiteUrl ?? '',
    scmProviderId: raw?.scmProviderId ?? raw?.ScmProviderId ?? '',
    make: raw?.make ?? raw?.Make ?? '',
  };
}

function extractItems(payload: any): CompanyInfoItem[] {
  const candidates = [payload, payload?.data, payload?.items, payload?.result, payload?.records, payload?.data?.data, payload?.data?.items];
  const list = candidates.find(Array.isArray);
  return Array.isArray(list) ? list.map(toItem) : list ? [toItem(list)] : [];
}

function extractMessage(payload: any, fallback: string): string {
  return payload?.message ?? payload?.Message ?? payload?.msg ?? payload?.error ?? fallback;
}

function responseFailed(payload: any): boolean {
  return Boolean(payload && (payload.success === false || payload.isSuccess === false || String(payload.responseType ?? '').toLowerCase().includes('fail') || String(payload.responseType ?? '').toLowerCase().includes('error')));
}

export async function fetchCompanyInfo(params: FetchCompanyInfoParams = {}): Promise<FetchCompanyInfoResult> {
  const res = await api.post(
    API_URL,
    {
      draw: 1,
      start: params.start ?? 0,
      length: params.length ?? 12,
      searchValue: params.search ?? '',
      sortColumn: '',
      sortDirection: '',
    },
    { signal: params.signal },
  );
  const data = res.data?.data ?? res.data?.items ?? res.data?.result ?? res.data?.records ?? res.data;
  const items = extractItems(data);
  return {
    items,
    total: res.data?.recordsTotal ?? res.data?.total ?? res.data?.totalCount ?? items.length,
    filtered: res.data?.recordsFiltered ?? res.data?.filtered ?? res.data?.total ?? items.length,
  };
}

export async function fetchCompanyInfoSelectList(): Promise<SelectListItem[]> {
  const res = await api.post(API_URL, {});
  return extractItems(res.data).map((item) => ({ label: item.fullName, value: item.id }));
}

export async function saveCompanyInfo(payload: CompanyInfoSavePayload): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const id = payload.id;
  const isUpdate = id !== undefined && id !== null && id !== '' && Number(id) !== 0;
  const body = {
    ...(isUpdate ? { id: Number(id) } : {}),
    fullName: payload.fullName,
    email: payload.email,
    address: payload.address,
    contactNo: payload.contactNo,
    websiteUrl: payload.websiteUrl,
    scmProviderId: payload.scmProviderId,
    make: payload.make,
  };
  const res = isUpdate
    ? await api.put(`${UPDATE_URL}/${id}?action=UpdateCompanyInfo`, body)
    : await api.post(CREATE_URL, body);
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to save company'), data };
  return { success: true, message: extractMessage(data, 'Company saved successfully'), data };
}

export async function deleteCompanyInfo(id: number | string): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const res = await api.delete(`${DELETE_URL}/${id}?action=DeleteCompanyInfo`);
  const data = res.data;
  if (responseFailed(data)) return { success: false, message: extractMessage(data, 'Failed to delete company'), data };
  return { success: true, message: extractMessage(data, 'Company deleted successfully'), data };
}

export const companyInfoService = {
  serverSearch: (body: CompanyInfoServerSearchRequest, signal?: AbortSignal) => api.post<ApiListResponse<CompanyInfoItem>>(API_URL, body, { signal }),
  save: saveCompanyInfo,
  delete: deleteCompanyInfo,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: () => api.post(API_URL, {}),
  fetchCompanyInfo,
  fetchCompanyInfoSelectList,
  saveCompanyInfo,
  deleteCompanyInfo,
};
