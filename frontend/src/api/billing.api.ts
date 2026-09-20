import { apiClient } from './client';
import { ApiResponse, Plan, Subscription } from '../types';

export const billingApi = {
  getPlans: async () => {
    const res = await apiClient.get<ApiResponse<Plan[]>>('/billing/plans');
    return res.data.data;
  },

  getSubscription: async (businessId: string) => {
    const res = await apiClient.get<ApiResponse<Subscription>>(`/billing/${businessId}/subscription`);
    return res.data.data;
  },

  subscribe: async (businessId: string, data: { planCode: string; callbackUrl?: string }) => {
    const res = await apiClient.post<ApiResponse<{ authorizationUrl: string; reference: string }>>(`/billing/${businessId}/subscribe`, data);
    return res.data.data;
  },
};
