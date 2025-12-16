/**
 * Task Service
 */

import api from '@/lib/axios';
import {
  ApiResponse,
  Task,
  TaskFilters,
  CreateTaskInput,
  UpdateTaskInput,
  DashboardData,
  PaginationMeta,
} from '@/types';

export const taskService = {
  /**
   * Get tasks with filters
   */
  async getTasks(
    filters: TaskFilters = {}
  ): Promise<{ tasks: Task[]; meta: PaginationMeta }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<Task[]>>(`/tasks?${params.toString()}`);
    return {
      tasks: response.data.data!,
      meta: response.data.meta!,
    };
  },

  /**
   * Get single task by ID
   */
  async getTask(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data!;
  },

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskInput): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data!;
  },

  /**
   * Update a task
   */
  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<ApiResponse<DashboardData>>('/tasks/dashboard');
    return response.data.data!;
  },

  /**
   * Get task history
   */
  async getTaskHistory(id: string): Promise<unknown[]> {
    const response = await api.get<ApiResponse<unknown[]>>(`/tasks/${id}/history`);
    return response.data.data!;
  },
};