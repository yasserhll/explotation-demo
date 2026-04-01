import axios from 'axios';
import { cacheInvalidateAll } from '../utils/reportCache';

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

// Wrapper qui invalide le cache après toute mutation réussie
function withCacheInvalidation(fn) {
  return async (...args) => {
    const result = await fn(...args);
    cacheInvalidateAll();
    return result;
  };
}

export const productionAPI = {
  getAll:    (params) => api.get('/productions', { params }),
  getDaily:  (date) => api.get('/productions/daily', { params: { date } }),
  getMonthly:(month) => api.get('/productions/monthly', { params: { month } }),
  create:    withCacheInvalidation((data) => api.post('/productions', data)),
  update:    withCacheInvalidation((id, data) => api.put(`/productions/${id}`, data)),
  delete:    withCacheInvalidation((id) => api.delete(`/productions/${id}`)),
};

export const affectationAPI = {
  getAll:      (params) => api.get('/affectations', { params: params || {} }),
  create:      withCacheInvalidation((data) => api.post('/affectations', data)),
  update:      withCacheInvalidation((id, data) => api.put(`/affectations/${id}`, data)),
  delete:      withCacheInvalidation((id) => api.delete(`/affectations/${id}`)),
  getEngins:   () => api.get('/engins'),
  updateEngin: withCacheInvalidation((id, data) => api.put(`/engins/${id}`, data)),
};

export const arretAPI = {
  getAll:          (params) => api.get('/arrets', { params }),
  create:          withCacheInvalidation((data) => api.post('/arrets', data)),
  delete:          withCacheInvalidation((id) => api.delete(`/arrets/${id}`)),
  getDisponibilite:(params) => api.get('/disponibilite', { params }),
};

export const dashboardAPI = {
  get:              () => api.get('/dashboard'),
  getOptimisations: () => api.get('/optimisations'),
};

export const rotationAPI = {
  getByDate:         (date)      => api.get('/rotations', { params: { date } }),
  getDates:          ()          => api.get('/rotations/dates'),
  getMonthly:        (month)     => api.get('/rotations/monthly', { params: { month } }),
  rapportJournalier: (date)      => api.get('/rotations/rapport-journalier', { params: { date } }),
  create:     withCacheInvalidation((data) => api.post('/rotations', data)),
  update:     withCacheInvalidation((id, data) => api.put(`/rotations/${id}`, data)),
  delete:     withCacheInvalidation((id) => api.delete(`/rotations/${id}`)),
};

export default api;
