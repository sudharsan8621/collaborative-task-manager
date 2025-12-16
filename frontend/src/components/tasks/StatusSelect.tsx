/**
 * Status Select Component for Quick Status Updates
 */

import React from 'react';
import { TaskStatus } from '@/types';
import { cn, getStatusColor } from '@/lib/utils';

interface StatusSelectProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
}

const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const statuses = Object.values(TaskStatus);

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          disabled={disabled}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            value === status
              ? cn(getStatusColor(status), 'ring-2 ring-offset-2 ring-current')
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default StatusSelect;