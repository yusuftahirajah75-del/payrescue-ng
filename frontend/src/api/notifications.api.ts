import { apiClient } from './client';
import { ApiResponse, NotificationItem } from '../types';

export const notificationsApi = {
  listNotifications: async (unreadOnly: boolean = false) => {
    const res = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications', {
      params: { unread: unreadOnly ? 'true' : undefined },
    });
    return res.data.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<null>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/notifications/read-all');
    return res.data;
  },
};
