export type PurchaseStatus = 0 | 1 | 2 | 3 | 4;

export interface Purchase {
  id: number;
  trnDate: string;
  refNo: string;
  narration: string;
  companyInfoId: string;
  companyName: string;
  make: string;
  deviceModelId: string;
  deviceModel: string;
  snPrefix: string;
  snPadding: number;
  snStart?: number;
  totalItem: number;
  status: PurchaseStatus;
  rejectedDate?: string;
  rejectedBy?: string;
  rejectedReason?: string;
}

export interface GeneratedDevice {
  id: number;
  purchaseMasterId: number;
  serialNumber: string;
  model: string;
  status: 'Available' | 'Rejected';
  rejectReason?: string;
}

export interface PurchaseFormValues {
  trnDate: string;
  refNo: string;
  narration: string;
  deviceModelId: string;
  make: string;
  snPrefix: string;
  snPadding: number;
  totalItem: number;
}

export interface PurchaseFormProps {
  deviceModels: { id: string; name: string; make: string }[];
  companyName: string;
  companyInfoId: string;
  make: string;
  purchases?: Purchase[];
  devices?: GeneratedDevice[];
  editingPurchaseId?: number | null;
  readOnly?: boolean;
}

// Save payload matches current localStorage key/values (scm_purchases)
export type PurchaseSavePayload = Purchase;

export interface ServerSearchModel {
  draw?: number;
  start?: number;
  length?: number;
  search?: { value: string; regex: string };
}

export interface PurchaseServerSearchParam {
  Status?: string | number;
  CompanyInfoId?: string | number;
  [key: string]: unknown;
}

export interface PurchaseServerSearchRequest {
  model: ServerSearchModel;
  param?: PurchaseServerSearchParam;
}

export interface ApiListResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  [key: string]: unknown;
}

export interface FetchPurchasesParams {
  search?: string;
  start?: number;
  length?: number;
  status?: string | number;
  signal?: AbortSignal;
}

export interface FetchPurchasesResult {
  items: Purchase[];
  total: number;
  filtered: number;
}

export interface SelectListItem {
  label: string;
  value: string | number;
  [key: string]: unknown;
}

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  0: 'Deleted',
  1: 'Draft Approved',
  2: 'Draft',
  3: 'Generated',
  4: 'Rejected',
};
