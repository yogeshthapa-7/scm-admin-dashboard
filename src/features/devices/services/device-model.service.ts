import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const deviceModelService = {
  serversearch: (params?: Record<string, unknown>) =>
    http.get('/device-models/search', { params }),

  selectlist: () => http.get('/device-models/select-list'),

  save: (data: unknown) => http.post('/device-models', data),

  delete: (id: string | number) => http.delete(`/device-models/${id}`),
};
