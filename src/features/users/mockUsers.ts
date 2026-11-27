import type { User } from './types/user.types';

export const mockUsers: User[] = [
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
