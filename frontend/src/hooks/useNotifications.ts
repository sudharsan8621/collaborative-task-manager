/**
 * Notification Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';

/**
 * Hook to fetch notifications
 */
export const useNotifications = (limit = 20) => {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: () => notificationService.getNotifications(limit),
  });
};

/**
 * Hook to fetch unread count
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to mark notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
};

/**
 * Hook to mark all as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
};

/**
 * Hook to fetch users for assignment
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => {
      const { authService } = require('@/services/auth.service');
      return authService.getUsers();
    },
  });
};