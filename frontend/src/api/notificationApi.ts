import client from './client';

export interface AppNotification {
  id: string;
  recipient_id?: string;
  recipient_role: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  getMyNotifications: async (limit = 50): Promise<AppNotification[]> => {
    const res = await client.get<AppNotification[]>('/notifications/my-notifications', {
      params: { limit },
    });
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await client.get<{ unread_count: number }>('/notifications/unread-count');
    return res.data.unread_count;
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    const res = await client.post<AppNotification>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await client.post('/notifications/mark-all-read');
  },
};
