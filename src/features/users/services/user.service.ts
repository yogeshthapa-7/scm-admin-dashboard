import type { User } from '../types/user.types';

const STORAGE_KEY = 'scm_users';

const initialUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@scm.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john.doe@scm.com',
    role: 'Manager',
    status: 'active',
    createdAt: '2026-02-20',
  },
  {
    id: 3,
    name: 'Jane Smith',
    email: 'jane.smith@scm.com',
    role: 'Operator',
    status: 'inactive',
    createdAt: '2026-03-10',
  },
  {
    id: 4,
    name: 'Robert Brown',
    email: 'robert.brown@scm.com',
    role: 'Operator',
    status: 'active',
    createdAt: '2026-04-05',
  },
  {
    id: 5,
    name: 'Emily Davis',
    email: 'emily.davis@scm.com',
    role: 'Viewer',
    status: 'inactive',
    createdAt: '2026-05-12',
  },
];

const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return initialUsers;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(raw);
  } catch {
    return initialUsers;
  }
};

const saveStoredUsers = (users: User[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export interface UserParams {
  search?: string;
  status?: string;
  role?: string;
  start?: number;
  length?: number;
}

export interface UserResult {
  items: User[];
  total: number;
  filtered: number;
}

export const userService = {
  getAllUsers: (): User[] => getStoredUsers(),

  fetchUsers: (params: UserParams = {}): UserResult => {
    const users = getStoredUsers();
    const search = (params.search ?? '').trim().toLowerCase();
    const status = params.status ? String(params.status).toLowerCase() : '';
    const role = params.role ? String(params.role).toLowerCase() : '';

    const filtered = users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.role.toLowerCase().includes(search);
      const matchesStatus = !status || u.status.toLowerCase() === status;
      const matchesRole = !role || u.role.toLowerCase() === role;
      return matchesSearch && matchesStatus && matchesRole;
    });

    const start = params.start ?? 0;
    const length = params.length ?? 12;
    const items = filtered.slice(start, start + length);

    return { items, total: filtered.length, filtered: filtered.length };
  },

  addUser: (user: Omit<User, 'id'>): User => {
    const users = getStoredUsers();
    const newId = users.length > 0 ? Math.max(...users.map((u) => Number(u.id))) + 1 : 1;
    const newUser: User = { ...user, id: newId };
    saveStoredUsers([...users, newUser]);
    return newUser;
  },

  updateUser: (id: number | string, updates: Partial<User>): User | null => {
    const users = getStoredUsers();
    const index = users.findIndex((u) => String(u.id) === String(id));
    if (index === -1) return null;
    const updated = { ...users[index], ...updates };
    users[index] = updated;
    saveStoredUsers(users);
    return updated;
  },

  deleteUser: (id: number | string): boolean => {
    const users = getStoredUsers();
    const filtered = users.filter((u) => String(u.id) !== String(id));
    if (filtered.length === users.length) return false;
    saveStoredUsers(filtered);
    return true;
  },
};
