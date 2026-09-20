import { apiClient } from './client';
import { ApiResponse, RescueCase, CaseStatus } from '../types';

export const casesApi = {
  createCase: async (data: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    claimAmount: number;
    currency?: string;
    expectedResolution?: string;
    providerId?: string;
    transactionId?: string;
    transactionDetails?: {
      publicReference: string;
      transactionType: string;
      transactionTimestamp: string;
      senderIdentifier?: string;
      recipientIdentifier?: string;
      channel?: string;
    };
  }) => {
    const res = await apiClient.post<ApiResponse<RescueCase>>('/cases', data);
    return res.data.data;
  },

  listCases: async (params?: { page?: number; limit?: number; status?: CaseStatus; category?: string; search?: string }) => {
    const res = await apiClient.get<ApiResponse<{ items: RescueCase[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>>('/cases', { params });
    return res.data.data;
  },

  getCaseById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<RescueCase>>(`/cases/${id}`);
    return res.data.data;
  },

  updateStatus: async (id: string, data: { status: CaseStatus; summary: string; resolutionNotes?: string }) => {
    const res = await apiClient.patch<ApiResponse<RescueCase>>(`/cases/${id}/status`, data);
    return res.data.data;
  },

  escalateCase: async (id: string, data: { reason: string; targetRegulator: string }) => {
    const res = await apiClient.post<ApiResponse<RescueCase>>(`/cases/${id}/escalate`, data);
    return res.data.data;
  },
};
