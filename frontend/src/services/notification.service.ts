/**
 * Notification Service
 */

import api from '@/lib/axios';
import { ApiResponse, Notification } from '@/types';

export const notificationService = {
  /**
   * Get notifications
   */
  async getNotifications(limit = 20): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>(
      `/notifications?limit=${limit}`
    );
    return response.data.data!;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data!.count;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return response.data.data!;
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};