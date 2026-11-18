export interface CompanyInfoItem {
  id: string;
  fullName: string;
  email: string;
  address: string;
  contactNo: string;
  websiteUrl: string;
  scmProviderId: string;
  make: string;
}

// Save payload matches current localStorage key/values (company_info)
export type CompanyInfoSavePayload = CompanyInfoItem;

export interface ServerSearchModel {
  draw?: number;
  start?: number;
  length?: number;
  search?: { value: string; regex: string };
}

export interface CompanyInfoServerSearchRequest {
  model: ServerSearchModel;
  param?: Record<string, unknown>;
}

export interface ApiListResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  [key: string]: unknown;
}

export interface FetchCompanyInfoParams {
  search?: string;
  start?: number;
  length?: number;
  signal?: AbortSignal;
}

export interface FetchCompanyInfoResult {
  items: CompanyInfoItem[];
  total: number;
  filtered: number;
}

export interface SelectListItem {
  label: string;
  value: string | number;
  [key: string]: unknown;
}
