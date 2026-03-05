import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export const productionAPI = {
  getAll: (params) => api.get('/productions', { params }),
  getDaily: (date) => api.get('/productions/daily', { params: { date } }),
  getMonthly: (month) => api.get('/productions/monthly', { params: { month } }),
  create: (data) => api.post('/productions', data),
  update: (id, data) => api.put(`/productions/${id}`, data),
  delete: (id) => api.delete(`/productions/${id}`),
  export: (params) => api.get('/productions/export', { params }),
};

export const weeklyAPI = {
  getAll: (params) => api.get('/weekly', { params }),
  create: (data) => api.post('/weekly', data),
};

export const affectationAPI = {
  getAll: (date) => api.get('/affectations', { params: { date } }),
  create: (data) => api.post('/affectations', data),
  update: (id, data) => api.put(`/affectations/${id}`, data),
  delete: (id) => api.delete(`/affectations/${id}`),
  getEngins: () => api.get('/engins'),
  updateEngin: (id, data) => api.put(`/engins/${id}`, data),
};

export const arretAPI = {
  getAll: (params) => api.get('/arrets', { params }),
  create: (data) => api.post('/arrets', data),
  delete: (id) => api.delete(`/arrets/${id}`),
  getDisponibilite: (params) => api.get('/disponibilite', { params }),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getOptimisations: () => api.get('/optimisations'),
};

export default api;
