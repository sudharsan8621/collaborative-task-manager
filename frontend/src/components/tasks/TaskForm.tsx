/**
 * @fileoverview Task creation/editing form component
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Search, X } from 'lucide-react';
import { Priority, TaskStatus, Task, User } from '@/types';
import { useSearchUsers } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(TaskStatus).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData & { assignedToId?: string | null }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const { data: searchResults } = useSearchUsers(searchQuery);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate
        ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm")
        : '',
      priority: task?.priority || Priority.MEDIUM,
      status: task?.status,
    },
  });

  useEffect(() => {
    if (task?.assignedToId && typeof task.assignedToId !== 'string') {
      setSelectedUser(task.assignedToId as User);
    }
  }, [task]);

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({
      ...data,
      assignedToId: selectedUser?._id || null,
    });
  };

  const priorityOptions = Object.values(Priority).map((p) => ({
    value: p,
    label: p,
  }));

  const statusOptions = Object.values(TaskStatus).map((s) => ({
    value: s,
    label: s,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="Enter task title"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Enter task description"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Due Date"
          type="datetime-local"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <Select
          label="Priority"
          options={priorityOptions}
          error={errors.priority?.message}
          {...register('priority')}
        />
      </div>

      {task && (
        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />
      )}

      {/* Assignee Selection */}
      <div>
        <label className="label">Assign To</label>
        {selectedUser ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Avatar name={selectedUser.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowUserSearch(true);
                }}
                onFocus={() => setShowUserSearch(true)}
                className="input pl-10"
              />
            </div>
            
            {showUserSearch && searchResults && searchResults.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserSearch(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery('');
                        setShowUserSearch(false);
                      }}
                      className="flex items-center gap-2 w-full p-3 hover:bg-gray-50 text-left"
                    >
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};