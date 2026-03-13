import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const productionAPI = {
  getAll:    (params) => api.get('/productions', { params }),
  getDaily:  (date) => api.get('/productions/daily', { params: { date } }),
  getMonthly:(month) => api.get('/productions/monthly', { params: { month } }),
  create:    (data) => api.post('/productions', data),
  update:    (id, data) => api.put(`/productions/${id}`, data),
  delete:    (id) => api.delete(`/productions/${id}`),
};

export const affectationAPI = {
  getAll:      (params) => api.get('/affectations', { params: params || {} }),
  create:      (data) => api.post('/affectations', data),
  update:      (id, data) => api.put(`/affectations/${id}`, data),
  delete:      (id) => api.delete(`/affectations/${id}`),
  getEngins:   () => api.get('/engins'),
  updateEngin: (id, data) => api.put(`/engins/${id}`, data),
};

export const arretAPI = {
  getAll:          (params) => api.get('/arrets', { params }),
  create:          (data) => api.post('/arrets', data),
  delete:          (id) => api.delete(`/arrets/${id}`),
  getDisponibilite:(params) => api.get('/disponibilite', { params }),
};

export const dashboardAPI = {
  get:              () => api.get('/dashboard'),
  getOptimisations: () => api.get('/optimisations'),
};

export const rotationAPI = {
  getByDate:  (date)      => api.get('/rotations', { params: { date } }),
  getDates:   ()          => api.get('/rotations/dates'),
  getMonthly: (month)     => api.get('/rotations/monthly', { params: { month } }),
  create:     (data)      => api.post('/rotations', data),
  update:     (id, data)  => api.put(`/rotations/${id}`, data),
  delete:     (id)        => api.delete(`/rotations/${id}`),
};

export default api;
