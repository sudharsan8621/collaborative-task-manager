/**
 * Notification Dropdown Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { getRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {unreadNotifications.length > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            <CheckCheck className="w-3 h-3 mr-1" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={cn(
                'px-4 py-3 border-b hover:bg-gray-50 transition-colors cursor-pointer',
                !notification.read && 'bg-primary-50/50'
              )}
              onClick={() => {
                if (!notification.read) {
                  markAsRead.mutate(notification._id);
                }
                if (notification.taskId) {
                  onClose();
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getRelativeTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 ml-2 flex-shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all notifications
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationDropdown;