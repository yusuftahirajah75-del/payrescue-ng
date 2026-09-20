import { apiClient } from './client';
import { ApiResponse, ApiKey, Webhook } from '../types';

export const developerApi = {
  createKey: async (businessId: string, data: { name: string; environment: 'live' | 'test'; scopes: string[]; rateLimit?: number }) => {
    const res = await apiClient.post<ApiResponse<ApiKey>>(`/developer/${businessId}/keys`, data);
    return res.data.data;
  },

  listKeys: async (businessId: string) => {
    const res = await apiClient.get<ApiResponse<ApiKey[]>>(`/developer/${businessId}/keys`);
    return res.data.data;
  },

  revokeKey: async (businessId: string, keyId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/developer/${businessId}/keys/${keyId}`);
    return res.data;
  },

  createWebhook: async (businessId: string, data: { targetUrl: string; subscribedEvents: string[] }) => {
    const res = await apiClient.post<ApiResponse<Webhook>>(`/developer/${businessId}/webhooks`, data);
    return res.data.data;
  },

  listWebhooks: async (businessId: string) => {
    const res = await apiClient.get<ApiResponse<Webhook[]>>(`/developer/${businessId}/webhooks`);
    return res.data.data;
  },

  testWebhook: async (businessId: string, webhookId: string) => {
    const res = await apiClient.post<ApiResponse<any>>(`/developer/${businessId}/webhooks/${webhookId}/test`);
    return res.data.data;
  },

  getLogs: async (businessId: string) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/developer/${businessId}/logs`);
    return res.data.data;
  },
};
