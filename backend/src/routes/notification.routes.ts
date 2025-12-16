/**
 * Notification Routes
 * @module routes/notification
 */

import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/notifications
 * @desc Get user notifications
 * @access Private
 */
router.get(
  '/',
  notificationController.getNotifications.bind(notificationController)
);

/**
 * @route GET /api/v1/notifications/unread-count
 * @desc Get unread notification count
 * @access Private
 */
router.get(
  '/unread-count',
  notificationController.getUnreadCount.bind(notificationController)
);

/**
 * @route PATCH /api/v1/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.patch(
  '/read-all',
  notificationController.markAllAsRead.bind(notificationController)
);

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Mark a notification as read
 * @access Private
 */
router.patch(
  '/:id/read',
  notificationController.markAsRead.bind(notificationController)
);

/**
 * @route DELETE /api/v1/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete(
  '/:id',
  notificationController.deleteNotification.bind(notificationController)
);

export default router;