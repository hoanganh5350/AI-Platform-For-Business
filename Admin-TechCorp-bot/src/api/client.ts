import axios from 'axios';
import type { BusinessConfig, UIFlowNode } from './types';

// For customer admin, ideally they have an auth token. But here we'll use the platform API key.
const API_KEY = 'admin-secret-key-change-me';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

export const AdminAPI = {
  getConfigs: async () => {
    const res = await api.get('/config');
    return res.data;
  },
  getConfig: async (businessId: string) => {
    const res = await api.get(`/config/${businessId}`);
    return res.data;
  },
  createConfig: async (config: Partial<BusinessConfig>) => {
    const res = await api.post('/config', config);
    return res.data;
  },
  updateBusinessInfo: async (businessId: string, data: Partial<BusinessConfig>) => {
    const res = await api.patch(`/config/${businessId}/business-info`, data);
    return res.data;
  },
  updateDescription: async (businessId: string, description: string) => {
    const res = await api.patch(`/config/${businessId}/description`, { description });
    return res.data;
  },
  updateUIFlow: async (businessId: string, uiFlowTree: UIFlowNode[]) => {
    const res = await api.patch(`/config/${businessId}/ui-flow`, { uiFlowTree });
    return res.data;
  },
};
