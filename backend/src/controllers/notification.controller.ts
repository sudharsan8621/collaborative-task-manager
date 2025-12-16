/**
 * Notification Controller
 * Handles HTTP requests for notification operations
 * @module controllers/notification
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';

/**
 * Controller class for notification endpoints
 */
export class NotificationController {
  /**
   * Get user notifications
   * GET /api/v1/notifications
   */
  async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const notifications = await notificationService.getNotifications(userId, limit);
      
      sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      
      const count = await notificationService.getUnreadCount(userId);
      
      sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a single notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      
      const notification = await notificationService.markAsRead(id, userId);
      
      sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      
      const count = await notificationService.markAllAsRead(userId);
      
      sendSuccess(res, { updatedCount: count }, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/:id
   */
  async deleteNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      
      await notificationService.deleteNotification(id, userId);
      
      sendSuccess(res, null, 'Notification deleted');
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const notificationController = new NotificationController();