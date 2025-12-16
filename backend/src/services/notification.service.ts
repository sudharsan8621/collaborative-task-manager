/**
 * Notification Service
 * Business logic for notification operations
 * @module services/notification
 */

import { notificationRepository } from '../repositories/notification.repository';
import { INotificationDocument } from '../types';

/**
 * Notification Service Class
 */
export class NotificationService {
  /**
   * Get notifications for a user
   * @param userId - User ID
   * @param limit - Number of notifications to return
   * @returns Array of notifications
   */
  async getNotifications(
    userId: string,
    limit = 20
  ): Promise<INotificationDocument[]> {
    console.log('🔔 Getting notifications for user:', userId);
    return notificationRepository.findByUser(userId, limit);
  }

  /**
   * Get unread notifications for a user
   * @param userId - User ID
   * @returns Array of unread notifications
   */
  async getUnreadNotifications(
    userId: string
  ): Promise<INotificationDocument[]> {
    return notificationRepository.findUnreadByUser(userId);
  }

  /**
   * Mark a notification as read
   * @param notificationId - Notification ID
   * @param userId - User ID
   * @returns Updated notification
   */
  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotificationDocument | null> {
    console.log('✅ Marking notification as read:', notificationId);
    return notificationRepository.markAsRead(notificationId, userId);
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   * @returns Number of updated notifications
   */
  async markAllAsRead(userId: string): Promise<number> {
    console.log('✅ Marking all notifications as read for user:', userId);
    return notificationRepository.markAllAsRead(userId);
  }

  /**
   * Get unread notification count
   * @param userId - User ID
   * @returns Number of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    return notificationRepository.getUnreadCount(userId);
  }

  /**
   * Delete a notification
   * @param notificationId - Notification ID
   * @param userId - User ID
   * @returns Deleted notification or null
   */
  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<INotificationDocument | null> {
    console.log('🗑️ Deleting notification:', notificationId);
    return notificationRepository.delete(notificationId, userId);
  }

  /**
   * Delete all notifications for a user
   * @param userId - User ID
   * @returns Number of deleted notifications
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    console.log('🗑️ Deleting all notifications for user:', userId);
    return notificationRepository.deleteAllForUser(userId);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();