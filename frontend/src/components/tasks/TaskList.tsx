/**
 * Task List Component
 */

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import TaskCard from './TaskCard';
import { TaskCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  onCreateTask?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading = false,
  onEdit,
  onDelete,
  emptyMessage = 'No tasks found',
  emptyDescription = 'Create a new task to get started',
  onCreateTask,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={emptyMessage}
        description={emptyDescription}
        actionLabel={onCreateTask ? 'Create Task' : undefined}
        onAction={onCreateTask}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;