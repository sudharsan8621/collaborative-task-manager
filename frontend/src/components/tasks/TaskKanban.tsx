/**
 * Task Kanban Board Component
 * Alternative view for tasks organized by status
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import { cn, getStatusColor } from '@/lib/utils';

interface TaskKanbanProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const columns: { status: TaskStatus; label: string }[] = [
  { status: TaskStatus.TODO, label: 'To Do' },
  { status: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { status: TaskStatus.REVIEW, label: 'Review' },
  { status: TaskStatus.COMPLETED, label: 'Completed' },
];

const TaskKanban: React.FC<TaskKanbanProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);

        return (
          <div
            key={column.status}
            className="bg-gray-50 rounded-xl p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    'w-3 h-3 rounded-full',
                    column.status === TaskStatus.TODO && 'bg-gray-400',
                    column.status === TaskStatus.IN_PROGRESS && 'bg-blue-500',
                    column.status === TaskStatus.REVIEW && 'bg-purple-500',
                    column.status === TaskStatus.COMPLETED && 'bg-green-500'
                  )}
                />
                <h3 className="font-semibold text-gray-900">{column.label}</h3>
              </div>
              <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </motion.div>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanban;