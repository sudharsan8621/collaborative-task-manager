/**
 * Skeleton Loading Component
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
}) => {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1rem' : undefined),
      }}
    />
  );
};

// Skeleton presets for common use cases
export const TaskCardSkeleton: React.FC = () => (
  <div className="card p-4 space-y-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-6 w-16" variant="rectangular" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-8 w-8" variant="circular" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

export const DashboardStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card p-4 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

export default Skeleton;