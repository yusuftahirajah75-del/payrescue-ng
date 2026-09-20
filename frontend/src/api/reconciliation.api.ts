import { apiClient } from './client';
import { ApiResponse, ReconciliationJob } from '../types';

export const reconciliationApi = {
  reconcileCsv: async (businessId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<{ job: ReconciliationJob; summary: any }>>(
      `/reconciliation/${businessId}/csv`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data.data;
  },

  reconcileManual: async (businessId: string, claims: Array<{ claimedReference: string; claimedAmount: number; transactionDate?: string }>) => {
    const res = await apiClient.post<ApiResponse<{ job: ReconciliationJob; summary: any }>>(
      `/reconciliation/${businessId}/manual`,
      { claims }
    );
    return res.data.data;
  },

  getJob: async (businessId: string, jobId: string) => {
    const res = await apiClient.get<ApiResponse<ReconciliationJob>>(`/reconciliation/${businessId}/jobs/${jobId}`);
    return res.data.data;
  },
};
