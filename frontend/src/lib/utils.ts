/**
 * Utility Functions
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { Priority, TaskStatus } from '@/types';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Check if date is past
 */
export function isOverdue(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isPast(d);
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: Priority): string {
  const colors = {
    [Priority.LOW]: 'bg-gray-100 text-gray-700',
    [Priority.MEDIUM]: 'bg-blue-100 text-blue-700',
    [Priority.HIGH]: 'bg-orange-100 text-orange-700',
    [Priority.URGENT]: 'bg-red-100 text-red-700',
  };
  return colors[priority];
}

/**
 * Get status color classes
 */
export function getStatusColor(status: TaskStatus): string {
  const colors = {
    [TaskStatus.TODO]: 'bg-gray-100 text-gray-700',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [TaskStatus.REVIEW]: 'bg-purple-100 text-purple-700',
    [TaskStatus.COMPLETED]: 'bg-green-100 text-green-700',
  };
  return colors[status];
}

/**
 * Get priority badge dot color
 */
export function getPriorityDotColor(priority: Priority): string {
  const colors = {
    [Priority.LOW]: 'bg-gray-400',
    [Priority.MEDIUM]: 'bg-blue-500',
    [Priority.HIGH]: 'bg-orange-500',
    [Priority.URGENT]: 'bg-red-500',
  };
  return colors[priority];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate avatar color from string
 */
export function getAvatarColor(str: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}