import axios from 'axios';

/**
 * API Service - Handles all communication with backend
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API] Response error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Logs API
 */
export const logsAPI = {
  // Get logs with filters
  getLogs: (params = {}) => api.get('/logs', { params }),
  
  // Get log statistics
  getStats: () => api.get('/logs/stats'),
  
  // Send logs (used by agent)
  sendLogs: (data) => api.post('/logs', data)
};

/**
 * Endpoints API
 */
export const endpointsAPI = {
  // Get all endpoints
  getEndpoints: () => api.get('/endpoints'),
  
  // Get specific endpoint
  getEndpoint: (deviceId) => api.get(`/endpoints/${deviceId}`),
  
  // Register endpoint
  registerEndpoint: (data) => api.post('/endpoints', data),
  
  // Update endpoint status
  updateStatus: (deviceId, status) => 
    api.put(`/endpoints/${deviceId}/status`, { status })
};

/**
 * Policies API
 */
export const policiesAPI = {
  // Get all policies
  getPolicies: (params = {}) => api.get('/policies', { params }),
  
  // Get policies for device
  getPoliciesByDevice: (deviceId) => api.get(`/policies/${deviceId}`),
  
  // Create/update policy
  createPolicy: (data) => api.post('/policies', data),
  
  // Delete policy
  deletePolicy: (id) => api.delete(`/policies/${id}`)
};

export default api;
