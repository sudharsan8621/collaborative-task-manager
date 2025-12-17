/**
 * Task Card Component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import {
  cn,
  formatDate,
  getPriorityColor,
  getStatusColor,
  getPriorityDotColor,
  isOverdue,
} from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  showActions?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const taskIsOverdue = isOverdue(task.dueDate) && task.status !== TaskStatus.COMPLETED;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-hover p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn('w-2 h-2 rounded-full', getPriorityDotColor(task.priority))} />
          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
        </div>

        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border py-1 z-20">
                  <Link
                    to={`/tasks/${task._id}`}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit?.(task);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete?.(task);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Title & Description */}
      <Link to={`/tasks/${task._id}`}>
        <h3 className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
          {task.title}
        </h3>
      </Link>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          {task.assignedToId ? (
            <>
              <Avatar name={task.assignedToId.name} size="sm" />
              <span className="text-sm text-gray-600">{task.assignedToId.name}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400 flex items-center">
              <User className="w-4 h-4 mr-1" />
              Unassigned
            </span>
          )}
        </div>

        {/* Due Date */}
        <div
          className={cn(
            'flex items-center text-sm',
            taskIsOverdue ? 'text-red-600' : 'text-gray-500'
          )}
        >
          {taskIsOverdue ? (
            <Clock className="w-4 h-4 mr-1" />
          ) : (
            <Calendar className="w-4 h-4 mr-1" />
          )}
          <span>{taskIsOverdue ? 'Overdue' : formatDate(task.dueDate)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;