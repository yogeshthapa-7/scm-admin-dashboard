import api from '@/interceptors/interceptors';
import type {
  UserItem,
  UserSavePayload,
  UserServerSearchRequest,
  ApiUserResponse,
  FetchUsersParams,
  FetchUsersResult,
  SelectListItem,
} from '../types/user.types';

export const RESOURCE_PATH = '/users';
export const API_URL = `${RESOURCE_PATH}/ServerSearch`;
export const SELECT_LIST_URL = `${RESOURCE_PATH}/SelectList`;
export const SAVE_URL = `${RESOURCE_PATH}/Save`;
export const DELETE_URL = `${RESOURCE_PATH}/Delete`;

export async function fetchUsers(params: FetchUsersParams): Promise<FetchUsersResult> {
  try {
    return await doFetchUsers(params);
  } catch {
    return { users: [], total: 0, filtered: 0 };
  }
}

async function doFetchUsers(params: FetchUsersParams): Promise<FetchUsersResult> {
  const body: UserServerSearchRequest = {
    model: {
      draw: 1,
      start: params.start ?? 0,
      length: params.length ?? 12,
      search: { value: (params.search ?? '').trim(), regex: '' },
    },
    param: {
      UserId: 0,
      UserGroupName: params.role ?? '',
      Status: params.status ?? '',
    },
  };

  const res = await api.post<ApiUserResponse<UserItem>>(API_URL, body, {
    signal: params.signal,
  });
  const response = res.data;
  const rows = Array.isArray(response?.data) ? response.data : [];
  return {
    users: rows,
    total: response.recordsTotal ?? rows.length,
    filtered: response.recordsFiltered ?? rows.length,
  };
}

export async function fetchUserSelectList(params?: Record<string, unknown>): Promise<SelectListItem[]> {
  try {
    const res = await api.post<SelectListItem[] | { data?: SelectListItem[] }>(SELECT_LIST_URL, params ?? {});
    const json = res.data;
    return Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function saveUser(
  payload: UserSavePayload
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
    const message = error instanceof Error ? error.message : 'Failed to save user';
    return { success: false, message };
  }
}

export async function deleteUser(id: string | number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await api.post(DELETE_URL, { id });
    const json = res.data ?? {};
    return {
      success: json.Success ?? json.success ?? true,
      message: json.Message ?? json.message,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return { success: false, message };
  }
}

export const userService = {
  serverSearch: (body: UserServerSearchRequest, signal?: AbortSignal) =>
    api.post<ApiUserResponse<UserItem>>(API_URL, body, { signal }),
  save: (payload: UserSavePayload) => api.post(SAVE_URL, payload),
  delete: (id: string | number) => api.post(DELETE_URL, { id }),
  selectList: (params?: Record<string, unknown>) => api.post(SELECT_LIST_URL, params ?? {}),
  fetchUsers,
  fetchUserSelectList,
  saveUser,
  deleteUser,
};
