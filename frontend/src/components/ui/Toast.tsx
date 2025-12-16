/**
 * Custom Toast Components for react-hot-toast
 */

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import toast, { Toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CustomToastProps {
  t: Toast;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export const CustomToast: React.FC<CustomToastProps> = ({
  t,
  type,
  title,
  message,
}) => {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        'max-w-md w-full shadow-lg rounded-lg pointer-events-auto border',
        colors[type],
        t.visible ? 'animate-slide-up' : 'animate-fade-out'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconColors[type])} />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{title}</p>
            {message && (
              <p className="mt-1 text-sm opacity-90">{message}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="inline-flex rounded-md hover:opacity-70 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for showing custom toasts
export const showToast = {
  success: (title: string, message?: string) =>
    toast.custom((t) => (
      <CustomToast t={t} type="success" title={title} message={message} />
    )),
  error: (title: string, message?: string) =>
    toast.custom((t) => (
      <CustomToast t={t} type="error" title={title} message={message} />
    )),
  warning: (title: string, message?: string) =>
    toast.custom((t) => (
      <CustomToast t={t} type="warning" title={title} message={message} />
    )),
  info: (title: string, message?: string) =>
    toast.custom((t) => (
      <CustomToast t={t} type="info" title={title} message={message} />
    )),
};