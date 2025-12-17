/**
 * Tasks Page
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { Task, TaskFilters, CreateTaskInput, Priority, TaskStatus } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TaskList from '@/components/tasks/TaskList';
import TaskFiltersComponent from '@/components/tasks/TaskFilters';
import TaskForm from '@/components/tasks/TaskForm';

const TasksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Parse URL params into filters
  const filters: TaskFilters = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12'),
    status: searchParams.get('status') as TaskStatus | undefined,
    priority: searchParams.get('priority') as Priority | undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as TaskFilters['sortBy']) || 'dueDate',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    assignedToMe: searchParams.get('assignedToMe') === 'true',
    createdByMe: searchParams.get('createdByMe') === 'true',
    overdue: searchParams.get('overdue') === 'true',
  };

  const { data, isLoading } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Update URL when filters change
  const handleFilterChange = (newFilters: TaskFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  const handleCreateTask = async (taskData: CreateTaskInput) => {
    await createTask.mutateAsync(taskData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateTask = async (taskData: CreateTaskInput) => {
    if (!editingTask) return;
    await updateTask.mutateAsync({ id: editingTask._id, data: taskData });
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    await deleteTask.mutateAsync(deletingTask._id);
    setDeletingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your tasks
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Task List */}
      <TaskList
        tasks={data?.tasks || []}
        isLoading={isLoading}
        onEdit={setEditingTask}
        onDelete={setDeletingTask}
        onCreateTask={() => setIsCreateModalOpen(true)}
      />

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={filters.page === 1}
            onClick={() =>
              handleFilterChange({ ...filters, page: (filters.page || 1) - 1 })
            }
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={filters.page === data.meta.totalPages}
            onClick={() =>
              handleFilterChange({ ...filters, page: (filters.page || 1) + 1 })
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createTask.isPending}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        size="lg"
      >
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            isLoading={updateTask.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deletingTask?.title}"? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeletingTask(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTask}
              isLoading={deleteTask.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TasksPage;