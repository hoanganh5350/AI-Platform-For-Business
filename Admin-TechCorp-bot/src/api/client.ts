import axios from 'axios';
import type { BusinessConfig, UIFlowNode } from './types';

// Create base instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('currentBusinessId');
      
      // Do not force reload if already on the login page, so that login error messages can be shown
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const AdminAPI = {
  // ─── AUTH ───
  login: async (credentials: Record<string, unknown>) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  registerBusiness: async (data: { userName: string; password: string; businessName: string }) => {
    const res = await api.post('/auth/register-business', data);
    return res.data;
  },
  createAdminRequest: async (data: { userName: string; password: string }) => {
    const res = await api.post('/users-management/create-admin', data);
    return res.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // ─── BUSINESS CONFIG ───
  getConfigs: async () => {
    const res = await api.get('/admin/config');
    return res.data;
  },
  getConfig: async (businessId: string) => {
    const res = await api.get(`/admin/config/${businessId}`);
    return res.data;
  },
  // JWT-auth versions for BUSINESS users (no API key needed)
  getMyConfig: async () => {
    const res = await api.get('/business/my-config');
    return res.data;
  },
  getBusinessConfig: async (businessId: string) => {
    const res = await api.get(`/business/config/${businessId}`);
    return res.data;
  },
  // Create initial config for BUSINESS user (JWT-authed, no API key needed)
  createBusinessConfig: async (config: Partial<BusinessConfig>) => {
    const res = await api.post('/business/setup', config);
    return res.data;
  },
  updateBusinessInfoJwt: async (businessId: string, data: Partial<BusinessConfig>) => {
    const res = await api.patch(`/business/config/${businessId}/business-info`, data);
    return res.data;
  },
  updateDescriptionJwt: async (businessId: string, description: string) => {
    const res = await api.patch(`/business/config/${businessId}/description`, { description });
    return res.data;
  },
  updateUIFlowJwt: async (businessId: string, uiFlowTree: UIFlowNode[]) => {
    const res = await api.patch(`/business/config/${businessId}/ui-flow`, { uiFlowTree });
    return res.data;
  },
  createConfig: async (config: Partial<BusinessConfig>) => {
    const res = await api.post('/admin/config', config);
    return res.data;
  },
  updateBusinessInfo: async (businessId: string, data: Partial<BusinessConfig>) => {
    const res = await api.patch(`/admin/config/${businessId}/business-info`, data);
    return res.data;
  },
  updateDescription: async (businessId: string, description: string) => {
    const res = await api.patch(`/admin/config/${businessId}/description`, { description });
    return res.data;
  },
  updateUIFlow: async (businessId: string, uiFlowTree: UIFlowNode[]) => {
    const res = await api.patch(`/admin/config/${businessId}/ui-flow`, { uiFlowTree });
    return res.data;
  },

  // ─── USER MANAGEMENT (ADMIN_SYSTEM & ADMIN) ───
  getDashboardStats: async (period: string = 'month') => {
    const res = await api.get('/users-management/dashboard', { params: { period } });
    return res.data;
  },
  getBusinesses: async () => {
    const res = await api.get('/users-management/businesses');
    return res.data;
  },
  getAdmins: async () => {
    const res = await api.get('/users-management/admins');
    return res.data;
  },
  requestUpdateUser: async (targetId: string, payload: Record<string, unknown>) => {
    const res = await api.put(`/users-management/users/${targetId}/request-update`, payload);
    return res.data;
  },
  getApprovalRequests: async () => {
    const res = await api.get('/users-management/requests');
    return res.data;
  },
  handleRequest: async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    const res = await api.post(`/users-management/requests/${requestId}/handle`, { action });
    return res.data;
  },

  // ─── DOCUMENT MANAGEMENT ───
  uploadDocument: async (businessId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/business/config/${businessId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deleteDocument: async (businessId: string, docIndex: number) => {
    const res = await api.delete(`/business/config/${businessId}/documents/${docIndex}`);
    return res.data;
  },
};
