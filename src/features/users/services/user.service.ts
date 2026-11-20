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

const DEFAULT_USERS: UserItem[] = [
  { id: 'USR-001', name: 'System Administrator', email: 'admin@scm.gov', role: 'Admin', department: 'IT', status: 'Active', lastLogin: '2026-11-16 09:30', createdAt: '2020-01-01' },
  { id: 'USR-002', name: 'IT Manager', email: 'it.manager@scm.gov', role: 'Manager', department: 'IT', status: 'Active', lastLogin: '2026-11-16 08:15', createdAt: '2020-03-15' },
  { id: 'USR-003', name: 'Amit Sharma', email: 'amit.s@scm.gov', role: 'Officer', department: 'IT', status: 'Active', lastLogin: '2026-11-15 17:00', createdAt: '2021-06-10' },
  { id: 'USR-004', name: 'Priya Nair', email: 'priya.n@scm.gov', role: 'Officer', department: 'Finance', status: 'Active', lastLogin: '2026-11-15 16:45', createdAt: '2021-09-20' },
  { id: 'USR-005', name: 'Rajesh Kumar', email: 'rajesh.k@scm.gov', role: 'Officer', department: 'Field Operations', status: 'Active', lastLogin: '2026-11-16 07:50', createdAt: '2022-01-10' },
  { id: 'USR-006', name: 'Sita Gurung', email: 'sita.g@scm.gov', role: 'Viewer', department: 'Admin', status: 'Active', lastLogin: '2026-11-14 15:30', createdAt: '2022-04-05' },
  { id: 'USR-007', name: 'Bikash Rai', email: 'bikash.r@scm.gov', role: 'Manager', department: 'Procurement', status: 'Active', lastLogin: '2026-11-16 09:00', createdAt: '2021-11-15' },
  { id: 'USR-008', name: 'Hari Sharma', email: 'hari.s@scm.gov', role: 'Officer', department: 'Admin', status: 'Inactive', lastLogin: '2026-10-20 14:00', createdAt: '2022-08-12' },
  { id: 'USR-009', name: 'Meera Thapa', email: 'meera.t@scm.gov', role: 'Viewer', department: 'Finance', status: 'Active', lastLogin: '2026-11-15 13:20', createdAt: '2023-02-01' },
  { id: 'USR-010', name: 'Sunita Basnet', email: 'sunita.b@scm.gov', role: 'Manager', department: 'IT', status: 'Suspended', lastLogin: '2026-09-30 10:00', createdAt: '2022-05-18' },
  { id: 'USR-011', name: 'Anil Karki', email: 'anil.k@scm.gov', role: 'Officer', department: 'Logistics', status: 'Active', lastLogin: '2026-11-16 11:20', createdAt: '2023-04-10' },
  { id: 'USR-012', name: 'Rabin Shrestha', email: 'rabin.s@scm.gov', role: 'Viewer', department: 'Operations', status: 'Active', lastLogin: '2026-11-15 14:10', createdAt: '2023-06-15' },
  { id: 'USR-013', name: 'Deepa Adhikari', email: 'deepa.a@scm.gov', role: 'Manager', department: 'HR', status: 'Active', lastLogin: '2026-11-16 08:45', createdAt: '2022-09-01' },
  { id: 'USR-014', name: 'Sanjay Pandey', email: 'sanjay.p@scm.gov', role: 'Officer', department: 'IT', status: 'Active', lastLogin: '2026-11-14 16:30', createdAt: '2023-01-20' },
  { id: 'USR-015', name: 'Pooja Joshi', email: 'pooja.j@scm.gov', role: 'Viewer', department: 'Finance', status: 'Inactive', lastLogin: '2026-10-15 12:00', createdAt: '2023-08-05' },
  { id: 'USR-016', name: 'Ganesh KC', email: 'ganesh.kc@scm.gov', role: 'Officer', department: 'Field Operations', status: 'Active', lastLogin: '2026-11-16 10:15', createdAt: '2023-10-12' },
];

function getStoredUsers(): UserItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
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
    if (search && !u.name.toLowerCase().includes(search) && !u.email.toLowerCase().includes(search) && !u.department.toLowerCase().includes(search)) return false;
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
