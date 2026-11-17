import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const companyInfoService = {
  serversearch: (params?: Record<string, unknown>) =>
    http.get('/company-info/search', { params }),

  selectlist: () => http.get('/company-info/select-list'),

  save: (data: unknown) => http.post('/company-info', data),

  delete: (id: string | number) => http.delete(`/company-info/${id}`),
};
