/**
 * Notification Repository
 * Data access layer for notification operations
 * @module repositories/notification
 */

import Notification from '../models/Notification.model';
import { INotificationDocument, NotificationType } from '../types';
import { Types } from 'mongoose';

/**
 * Notification Repository Class
 */
export class NotificationRepository {
  /**
   * Create a new notification
   * @param data - Notification data
   * @returns Created notification document
   */
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    taskId?: string;
  }): Promise<INotificationDocument> {
    const notification = new Notification({
      userId: new Types.ObjectId(data.userId),
      type: data.type,
      title: data.title,
      message: data.message,
      taskId: data.taskId ? new Types.ObjectId(data.taskId) : null,
      read: false
    });

    const savedNotification = await notification.save();
    console.log('🔔 Notification created for user:', data.userId);
    
    return savedNotification;
  }

  /**
   * Find notifications for a user
   * @param userId - User ID
   * @param limit - Number of notifications to return
   * @returns Array of notification documents
   */
  async findByUser(
    userId: string,
    limit = 20
  ): Promise<INotificationDocument[]> {
    return Notification.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Find unread notifications for a user
   * @param userId - User ID
   * @returns Array of unread notification documents
   */
  async findUnreadByUser(userId: string): Promise<INotificationDocument[]> {
    return Notification.find({
      userId: new Types.ObjectId(userId),
      read: false
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Mark notification as read
   * @param id - Notification ID
   * @param userId - User ID (for authorization)
   * @returns Updated notification or null
   */
  async markAsRead(
    id: string,
    userId: string
  ): Promise<INotificationDocument | null> {
    return Notification.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId)
      },
      { read: true },
      { new: true }
    ).exec();
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   * @returns Number of updated notifications
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      {
        userId: new Types.ObjectId(userId),
        read: false
      },
      { read: true }
    );
    return result.modifiedCount;
  }

  /**
   * Get unread count for a user
   * @param userId - User ID
   * @returns Number of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false
    });
  }

  /**
   * Delete a notification
   * @param id - Notification ID
   * @param userId - User ID (for authorization)
   * @returns Deleted notification or null
   */
  async delete(
    id: string,
    userId: string
  ): Promise<INotificationDocument | null> {
    return Notification.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId)
    }).exec();
  }

  /**
   * Delete all notifications for a user
   * @param userId - User ID
   * @returns Number of deleted notifications
   */
  async deleteAllForUser(userId: string): Promise<number> {
    const result = await Notification.deleteMany({
      userId: new Types.ObjectId(userId)
    });
    return result.deletedCount;
  }
}

// Export singleton instance
export const notificationRepository = new NotificationRepository();