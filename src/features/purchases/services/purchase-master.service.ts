import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const purchaseMasterService = {
  serversearch: (params?: Record<string, unknown>) =>
    http.get('/purchase-master/search', { params }),

  selectlist: () => http.get('/purchase-master/select-list'),

  save: (data: unknown) => http.post('/purchase-master', data),

  delete: (id: string | number) => http.delete(`/purchase-master/${id}`),
};
