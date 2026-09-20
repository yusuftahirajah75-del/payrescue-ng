import { apiClient } from './client';
import { ApiResponse, Transaction } from '../types';

export const transactionsApi = {
  createTransaction: async (data: any) => {
    const res = await apiClient.post<ApiResponse<Transaction>>('/transactions', data);
    return res.data.data;
  },

  listTransactions: async (params?: { page?: number; limit?: number; status?: string; providerId?: string; reference?: string }) => {
    const res = await apiClient.get<ApiResponse<{ items: Transaction[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>>('/transactions', { params });
    return res.data.data;
  },

  getTransactionById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return res.data.data;
  },
};
