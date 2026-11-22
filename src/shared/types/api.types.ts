export interface ApiListResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  [key: string]: unknown;
}

export interface SelectListItem {
  label: string;
  value: string | number;
  [key: string]: unknown;
}

export interface ServerSearchModel {
  draw?: number;
  start?: number;
  length?: number;
  search?: { value: string; regex: string };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  filtered: number;
}