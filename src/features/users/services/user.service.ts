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

const STORAGE_KEY = 'scm_users';

function getStoredUsers(): UserItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(items: UserItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export async function fetchUsers(params: FetchUsersParams): Promise<FetchUsersResult> {
  const all = getStoredUsers();
  const search = (params.search ?? '').trim().toLowerCase();
  const role = (params.role ?? '').trim();
  const status = (params.status ?? '').trim();

  const filtered = all.filter((u) => {
    if (
      search &&
      !(u.name || '').toLowerCase().includes(search) &&
      !(u.username || '').toLowerCase().includes(search) &&
      !(u.email || '').toLowerCase().includes(search) &&
      !(u.department || '').toLowerCase().includes(search)
    ) return false;
    if (role && u.role !== role) return false;
    if (status && u.status !== status) return false;
    return true;
  });

  return {
    users: filtered.slice(params.start ?? 0, (params.start ?? 0) + (params.length ?? 12)),
    total: filtered.length,
    filtered: filtered.length,
  };
}

export async function fetchUserSelectList(_params?: Record<string, unknown>): Promise<SelectListItem[]> {
  return getStoredUsers().map((u) => ({ label: u.name, value: u.id }));
}

export async function saveUser(
  payload: UserSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const all = getStoredUsers();
  const updated = payload.id
    ? all.map((u) => (String(u.id) === String(payload.id) ? payload : u))
    : [{ ...payload, id: `USR-${Date.now()}`, lastLogin: 'Never', createdAt: new Date().toISOString().split('T')[0] }, ...all];
  saveStoredUsers(updated);
  return { success: true, message: 'Saved successfully' };
}

export async function deleteUser(id: string | number): Promise<{ success: boolean; message?: string }> {
  saveStoredUsers(getStoredUsers().filter((u) => String(u.id) !== String(id)));
  return { success: true, message: 'Deleted successfully' };
}

export const userService = {
  serverSearch: (body: UserServerSearchRequest, signal?: AbortSignal) =>
    api.post<ApiUserResponse<UserItem>>(API_URL, body, { signal }),
  save: saveUser,
  delete: deleteUser,
  selectList: (params?: Record<string, unknown>) => api.post(SELECT_LIST_URL, params ?? {}),
  fetchUsers,
  fetchUserSelectList,
  saveUser,
  deleteUser,
};
