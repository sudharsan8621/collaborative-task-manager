/**
 * Dashboard Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import TaskList from '@/components/tasks/TaskList';
import { DashboardStatsSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { TaskStatus, Priority } from '@/types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();

  const stats = [
    {
      name: 'Total Tasks',
      value: data?.stats.total || 0,
      icon: ClipboardList,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'In Progress',
      value: data?.stats.byStatus[TaskStatus.IN_PROGRESS] || 0,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Completed',
      value: data?.stats.byStatus[TaskStatus.COMPLETED] || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Overdue',
      value: data?.stats.overdue || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your tasks and activities.
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('w-6 h-6', stat.color.replace('bg-', 'text-'))} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Priority Distribution */}
      {data && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tasks by Priority
          </h2>
          <div className="flex items-center space-x-4">
            {Object.values(Priority).map((priority) => {
              const count = data.stats.byPriority[priority] || 0;
              const percentage = data.stats.total > 0
                ? Math.round((count / data.stats.total) * 100)
                : 0;
              
              const colors: Record<string, string> = {
                [Priority.LOW]: 'bg-gray-400',
                [Priority.MEDIUM]: 'bg-blue-500',
                [Priority.HIGH]: 'bg-orange-500',
                [Priority.URGENT]: 'bg-red-500',
              };

              return (
                <div key={priority} className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{priority}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', colors[priority])}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned to Me */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Assigned to Me
            </h2>
            <Link
              to="/tasks?assignedToMe=true"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <TaskList
              tasks={data?.assignedTasks?.slice(0, 3) || []}
              isLoading={isLoading}
              emptyMessage="No tasks assigned to you"
              emptyDescription="Tasks assigned to you will appear here"
            />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Overdue Tasks
            </h2>
            <Link
              to="/tasks?overdue=true"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <TaskList
              tasks={data?.overdueTasks?.slice(0, 3) || []}
              isLoading={isLoading}
              emptyMessage="No overdue tasks"
              emptyDescription="Great job! You're on top of everything"
            />
          </div>
        </div>
      </div>

      {/* Created by Me */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Created by Me
          </h2>
          <Link
            to="/tasks?createdByMe=true"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <TaskList
          tasks={data?.createdTasks?.slice(0, 6) || []}
          isLoading={isLoading}
          emptyMessage="No tasks created by you"
          emptyDescription="Create your first task to get started"
        />
      </div>
    </div>
  );
};

export default DashboardPage;