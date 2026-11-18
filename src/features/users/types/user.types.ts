export type UserRole = 'Admin' | 'Manager' | 'Officer' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
}

// Save payload matches current localStorage key/values (scm_users)
export type UserSavePayload = UserItem;

export interface UserServerSearchModel {
  draw?: number;
  start?: number;
  length?: number;
  search?: { value: string; regex: string };
}

export interface UserServerSearchParam {
  UserId?: number | string;
  UserGroupName?: string;
  Role?: string;
  Status?: string;
  [key: string]: unknown;
}

export interface UserServerSearchRequest {
  model: UserServerSearchModel;
  param?: UserServerSearchParam;
}

export interface ApiUserResponse<T = UserItem> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  [key: string]: unknown;
}

export interface FetchUsersParams {
  search?: string;
  start?: number;
  length?: number;
  role?: string;
  status?: string;
  signal?: AbortSignal;
}

export interface FetchUsersResult {
  users: UserItem[];
  total: number;
  filtered: number;
}

export interface SelectListItem {
  label: string;
  value: string | number;
  [key: string]: unknown;
}
