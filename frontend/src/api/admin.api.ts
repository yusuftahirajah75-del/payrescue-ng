import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export const adminApi = {
  listUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const res = await apiClient.get<ApiResponse<{ items: User[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>>('/admin/users', { params });
    return res.data.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, { status });
    return res.data.data;
  },

  listAuditLogs: async (limit: number = 50) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/admin/audit-logs', { params: { limit } });
    return res.data.data;
  },

  listSettings: async () => {
    const res = await apiClient.get<ApiResponse<Array<{ id: string; key: string; value: string; description?: string }>>>('/admin/settings');
    return res.data.data;
  },

  updateSetting: async (key: string, value: string) => {
    const res = await apiClient.put<ApiResponse<any>>(`/admin/settings/${key}`, { value });
    return res.data.data;
  },

  listFeatureFlags: async () => {
    const res = await apiClient.get<ApiResponse<Array<{ id: string; name: string; isEnabled: boolean; description?: string }>>>('/admin/feature-flags');
    return res.data.data;
  },

  updateFeatureFlag: async (name: string, isEnabled: boolean) => {
    const res = await apiClient.put<ApiResponse<any>>(`/admin/feature-flags/${name}`, { isEnabled });
    return res.data.data;
  },
};
