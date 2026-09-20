import { apiClient } from './client';
import { ApiResponse, Provider, Plan } from '../types';

export const publicApi = {
  getPlatformInfo: async () => {
    const res = await apiClient.get<ApiResponse<{
      name: string;
      tagline: string;
      corePromise: string;
      mission: string;
      supportedCurrencies: string[];
      timezone: string;
      regulatoryCompliance: string;
      legalDisclaimer: string;
    }>>('/public/platform');
    return res.data.data;
  },

  getFeatures: async () => {
    const res = await apiClient.get<ApiResponse<{
      consumer: Array<{ title: string; description: string; badge: string }>;
      business: Array<{ title: string; description: string; badge: string }>;
    }>>('/public/features');
    return res.data.data;
  },

  getPricing: async () => {
    const res = await apiClient.get<ApiResponse<Plan[]>>('/public/pricing');
    return res.data.data;
  },

  getFaq: async () => {
    const res = await apiClient.get<ApiResponse<Array<{ category: string; question: string; answer: string }>>>('/public/faq');
    return res.data.data;
  },

  getProviders: async () => {
    const res = await apiClient.get<ApiResponse<Provider[]>>('/public/providers');
    return res.data.data;
  },

  getStatus: async () => {
    const res = await apiClient.get<ApiResponse<{
      status: string;
      timestamp: string;
      uptimeSeconds: number;
      components: Record<string, string>;
      environment: string;
    }>>('/public/status');
    return res.data.data;
  },

  contactSupport: async (data: { name: string; email: string; subject: string; message: string }) => {
    const res = await apiClient.post<ApiResponse<{ ticketReference: string }>>('/public/contact', data);
    return res.data;
  },
};
