/**
 * Task Detail Page
 * Shows full details of a single task with edit/delete options
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  History,
  AlertTriangle,
} from 'lucide-react';
import { useTask, useUpdateTask, useDeleteTask, useTaskHistory } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { TaskStatus, UpdateTaskInput } from '@/types';
import {
  cn,
  formatDateTime,
  getRelativeTime,
  getPriorityColor,
  getStatusColor,
  isOverdue,
} from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import TaskForm from '@/components/tasks/TaskForm';
import StatusSelect from '@/components/tasks/StatusSelect';

const TaskDetailPage: React.FC = () => {
  // Get task ID from URL params
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch task data
  const { data: task, isLoading, isError } = useTask(id!);
  const { data: history } = useTaskHistory(id!);

  // Mutations
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  /**
   * Handle status change
   * @param status - New status value
   */
  const handleStatusChange = async (status: TaskStatus) => {
    if (!task) return;
    await updateTask.mutateAsync({ id: task._id, data: { status } });
  };

  /**
   * Handle task update from form
   * @param data - Updated task data
   */
  const handleUpdateTask = async (data: UpdateTaskInput) => {
    if (!task) return;
    await updateTask.mutateAsync({ id: task._id, data });
    setIsEditModalOpen(false);
  };

  /**
   * Handle task deletion
   */
  const handleDeleteTask = async () => {
    if (!task) return;
    await deleteTask.mutateAsync(task._id);
    navigate('/tasks');
  };

  // Check if current user is the creator
  const isCreator = task?.creatorId._id === user?._id;

  // Check if current user is the assignee
  const isAssignee = task?.assignedToId?._id === user?._id;

  // Check if task is overdue
  const taskIsOverdue = task && isOverdue(task.dueDate) && task.status !== TaskStatus.COMPLETED;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="card p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Error state or task not found
  if (isError || !task) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Task not found</h2>
        <p className="text-gray-500 mb-4">
          The task you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/tasks">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/tasks"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tasks
      </Link>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
            {taskIsOverdue && (
              <Badge variant="danger" className="bg-red-100 text-red-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<History className="w-4 h-4" />}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'History'}
          </Button>

          {(isCreator || isAssignee) && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
          )}

          {isCreator && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Status Update Card */}
          {(isCreator || isAssignee) && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Update Status
              </h2>
              <StatusSelect
                value={task.status}
                onChange={handleStatusChange}
                disabled={updateTask.isPending}
              />
            </div>
          )}

          {/* History Card */}
          {showHistory && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Activity History
              </h2>
              
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 text-sm border-l-2 border-gray-200 pl-4"
                    >
                      <div className="flex-1">
                        <p className="text-gray-900">
                          <span className="font-medium">
                            {entry.userId?.name || 'Unknown User'}
                          </span>
                          {' '}
                          <span className="text-gray-600">
                            {entry.action.toLowerCase().replace(/_/g, ' ')}
                          </span>

                          {/* Show status change details */}
                          {entry.changes?.status && (
                            <span className="text-gray-600">
                              {' '}from{' '}
                              <span className="font-medium text-gray-900">
                                {entry.changes.status.old}
                              </span>
                              {' '}to{' '}
                              <span className="font-medium text-gray-900">
                                {entry.changes.status.new}
                              </span>
                            </span>
                          )}

                          {/* Show priority change details */}
                          {entry.changes?.priority && (
                            <span className="text-gray-600">
                              {' '}priority from{' '}
                              <span className="font-medium text-gray-900">
                                {entry.changes.priority.old}
                              </span>
                              {' '}to{' '}
                              <span className="font-medium text-gray-900">
                                {entry.changes.priority.new}
                              </span>
                            </span>
                          )}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {getRelativeTime(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No activity recorded yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>

            <div className="space-y-5">
              {/* Due Date */}
              <div className="flex items-start space-x-3">
                <Calendar
                  className={cn(
                    'w-5 h-5 mt-0.5 flex-shrink-0',
                    taskIsOverdue ? 'text-red-500' : 'text-gray-400'
                  )}
                />
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p
                    className={cn(
                      'font-medium',
                      taskIsOverdue ? 'text-red-600' : 'text-gray-900'
                    )}
                  >
                    {formatDateTime(task.dueDate)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getRelativeTime(task.dueDate)}
                  </p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(task.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getRelativeTime(task.createdAt)}
                  </p>
                </div>
              </div>

              {/* Creator */}
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Created by</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar name={task.creatorId.name} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {task.creatorId.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {task.creatorId.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignee */}
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Assigned to</p>
                  {task.assignedToId ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar name={task.assignedToId.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {task.assignedToId.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {task.assignedToId.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">Unassigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated Card */}
          <div className="card p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h2>
            <p className="text-gray-900">{formatDateTime(task.updatedAt)}</p>
            <p className="text-sm text-gray-500">{getRelativeTime(task.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
        size="lg"
      >
        <TaskForm
          task={task}
          onSubmit={handleUpdateTask}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={updateTask.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                Are you sure you want to delete this task?
              </p>
              <p className="text-sm text-red-600 mt-1">
                "{task.title}"
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            This action cannot be undone. The task and all its history will be
            permanently removed.
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteTask.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTask}
              isLoading={deleteTask.isPending}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetailPage;