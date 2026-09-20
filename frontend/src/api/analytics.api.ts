import { apiClient } from './client';
import { ApiResponse } from '../types';

export const analyticsApi = {
  getOverview: async (businessId?: string) => {
    const res = await apiClient.get<ApiResponse<{
      transactions: { total: number; failed: number };
      cases: { total: number; active: number; resolved: number; escalated: number; resolutionRate: string };
      financialRecovery: { totalRecoveredNgn: number; currency: string };
      reconciliation: { totalRecordsProcessed: number; matchedRecords: number; unmatchedRecords: number; mismatchRecords: number; reconciliationRate: string };
    }>>('/analytics/overview', {
      headers: businessId ? { 'X-Business-Id': businessId } : undefined,
    });
    return res.data.data;
  },

  getProviderMetrics: async () => {
    const res = await apiClient.get<ApiResponse<Array<{
      providerId: string;
      code: string;
      name: string;
      category: string;
      totalDisputesFiled: number;
      statutorySlaHours: number;
    }>>>('/analytics/providers');
    return res.data.data;
  },
};
