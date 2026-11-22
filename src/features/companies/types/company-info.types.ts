import type { ApiListResponse, PaginatedResult, SelectListItem, ServerSearchModel } from '@/shared/types/api.types';

export interface CompanyInfoItem {
  id: number | string;
  fullName: string;
  email: string;
  address: string;
  contactNo: string;
  websiteUrl: string;
  scmProviderId: string;
  make: string;
}

export type CompanyInfoSavePayload = CompanyInfoItem;

export interface CompanyInfoServerSearchRequest {
  model: ServerSearchModel;
  param?: Record<string, unknown>;
}

export interface FetchCompanyInfoParams {
  search?: string;
  start?: number;
  length?: number;
  signal?: AbortSignal;
}

export type FetchCompanyInfoResult = PaginatedResult<CompanyInfoItem>;

export type { ApiListResponse, SelectListItem, ServerSearchModel };
