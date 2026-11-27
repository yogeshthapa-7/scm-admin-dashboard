export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  password?: string;
  createdAt?: string;
}
