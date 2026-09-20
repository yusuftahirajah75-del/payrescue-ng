import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
    businessName?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await apiClient.put<ApiResponse<null>>('/auth/change-password', data);
    return res.data;
  },
};
