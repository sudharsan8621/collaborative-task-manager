/**
 * Task Filters Component
 */

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { TaskFilters as ITaskFilters, Priority, TaskStatus } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface TaskFiltersProps {
  filters: ITaskFilters;
  onFilterChange: (filters: ITaskFilters) => void;
}

const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.values(TaskStatus).map((s) => ({ value: s, label: s })),
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    ...Object.values(Priority).map((p) => ({ value: p, label: p })),
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
  ];

  const sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];

  const hasActiveFilters =
    filters.status || filters.priority || filters.search || filters.overdue;

  const clearFilters = () => {
    onFilterChange({
      page: 1,
      limit: 10,
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
  };

  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="input pl-10"
          value={filters.search || ''}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value, page: 1 })
          }
        />
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          options={statusOptions}
          value={filters.status || ''}
          onChange={(value) =>
            onFilterChange({
              ...filters,
              status: value as TaskStatus | undefined,
              page: 1,
            })
          }
          placeholder="Filter by Status"
        />

        <Select
          options={priorityOptions}
          value={filters.priority || ''}
          onChange={(value) =>
            onFilterChange({
              ...filters,
              priority: value as Priority | undefined,
              page: 1,
            })
          }
          placeholder="Filter by Priority"
        />

        <Select
          options={sortOptions}
          value={filters.sortBy || 'dueDate'}
          onChange={(value) =>
            onFilterChange({
              ...filters,
              sortBy: value as ITaskFilters['sortBy'],
            })
          }
        />

        <Select
          options={sortOrderOptions}
          value={filters.sortOrder || 'asc'}
          onChange={(value) =>
            onFilterChange({
              ...filters,
              sortOrder: value as 'asc' | 'desc',
            })
          }
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Quick filters:</span>
        <button
          onClick={() =>
            onFilterChange({ ...filters, assignedToMe: !filters.assignedToMe, page: 1 })
          }
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.assignedToMe
              ? 'bg-primary-100 border-primary-300 text-primary-700'
              : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Assigned to me
        </button>
        <button
          onClick={() =>
            onFilterChange({ ...filters, createdByMe: !filters.createdByMe, page: 1 })
          }
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.createdByMe
              ? 'bg-primary-100 border-primary-300 text-primary-700'
              : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Created by me
        </button>
        <button
          onClick={() =>
            onFilterChange({ ...filters, overdue: !filters.overdue, page: 1 })
          }
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.overdue
              ? 'bg-red-100 border-red-300 text-red-700'
              : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Overdue
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFiltersComponent;