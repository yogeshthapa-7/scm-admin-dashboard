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

const BASE_URL = 'http://scmdevice.himalayankasturi.com.np/api';
export const RESOURCE_PATH = '/CompanyInfo';
export const API_URL = `${BASE_URL}${RESOURCE_PATH}/GetAllCompanyInfo`;
export const GET_BY_ID_URL = `${BASE_URL}${RESOURCE_PATH}/GetCompanyInfoById`;
export const CREATE_URL = `${BASE_URL}${RESOURCE_PATH}/CreateCompanyInfo`;
export const UPDATE_URL = `${BASE_URL}${RESOURCE_PATH}/UpdateCompanyInfo`;
export const DELETE_URL = `${BASE_URL}${RESOURCE_PATH}/DeleteCompanyInfo`;

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

function extractTotal(payload: any, items: CompanyInfoItem[]): number {
  const candidates = [payload?.recordsTotal, payload?.total, payload?.totalCount, payload?.recordsFiltered, payload?.data?.recordsTotal, payload?.data?.total, payload?.data?.totalCount];
  for (const value of candidates) {
    const total = Number(value);
    if (Number.isFinite(total) && total >= 0) return total;
  }
  return items.length;
}

function extractMessage(payload: any, fallback: string): string {
  return payload?.message ?? payload?.Message ?? payload?.msg ?? payload?.error ?? fallback;
}

function responseFailed(payload: any): boolean {
  return Boolean(payload && (payload.success === false || payload.isSuccess === false || String(payload.responseType ?? '').toLowerCase().includes('fail') || String(payload.responseType ?? '').toLowerCase().includes('error')));
}

export async function fetchCompanyInfo(params: FetchCompanyInfoParams = {}): Promise<FetchCompanyInfoResult> {
  const res = await api.get(API_URL, { signal: params.signal });
  const all = extractItems(res.data);
  const search = (params.search ?? '').trim().toLowerCase();
  const filtered = search ? all.filter((company) => company.fullName.toLowerCase().includes(search) || company.email.toLowerCase().includes(search) || company.address.toLowerCase().includes(search)) : all;
  const start = params.start ?? 0;
  const length = params.length ?? (filtered.length || 12);
  return { items: filtered.slice(start, start + length), total: search ? filtered.length : extractTotal(res.data, all), filtered: filtered.length };
}

export async function fetchCompanyInfoSelectList(): Promise<SelectListItem[]> {
  const res = await api.get(API_URL);
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
  serverSearch: (body: CompanyInfoServerSearchRequest, signal?: AbortSignal) => api.get<ApiListResponse<CompanyInfoItem>>(API_URL, { params: body, signal }),
  save: saveCompanyInfo,
  delete: deleteCompanyInfo,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: () => api.get(API_URL),
  fetchCompanyInfo,
  fetchCompanyInfoSelectList,
  saveCompanyInfo,
  deleteCompanyInfo,
};
