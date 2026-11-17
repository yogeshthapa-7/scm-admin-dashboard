import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const deviceStatusService = {
  serversearch: (params?: Record<string, unknown>) =>
    http.get('/device-status/search', { params }),

  selectlist: () => http.get('/device-status/select-list'),

  save: (data: unknown) => http.post('/device-status', data),

  delete: (id: string | number) => http.delete(`/device-status/${id}`),
};
