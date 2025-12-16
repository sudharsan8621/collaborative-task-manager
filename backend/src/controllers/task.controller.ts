/**
 * Task Controller
 * Handles HTTP requests for task operations
 * @module controllers/task
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { taskService } from '../services/task.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../dtos/task.dto';
import { getSocketIO } from '../socket';

/**
 * Controller class for task endpoints
 */
export class TaskController {
  /**
   * Create a new task
   * POST /api/v1/tasks
   */
  async createTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskData: CreateTaskInput = req.body;
      const userId = req.user!.userId;

      const task = await taskService.createTask(taskData, userId);

      // Emit real-time event to all connected clients
      const io = getSocketIO();
      io.emit('task:created', task);

      // Notify assigned user if task is assigned to someone else
      if (task.assignedToId && task.assignedToId._id.toString() !== userId) {
        io.to(`user:${task.assignedToId._id}`).emit('notification:new', {
          type: 'TASK_ASSIGNED',
          task
        });
      }

      sendSuccess(res, task, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tasks with filters and pagination
   * GET /api/v1/tasks
   */
  async getTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query: TaskQueryInput = req.query as unknown as TaskQueryInput;
      const userId = req.user!.userId;

      const { tasks, total, page, limit } = await taskService.getTasks(query, userId);

      sendPaginated(res, tasks, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single task by ID
   * GET /api/v1/tasks/:id
   */
  async getTaskById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a task
   * PATCH /api/v1/tasks/:id
   */
  async updateTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTaskInput = req.body;
      const userId = req.user!.userId;

      const { task, changes } = await taskService.updateTask(id, updateData, userId);

      // Emit real-time event to all connected clients
      const io = getSocketIO();
      io.emit('task:updated', { task, changes, updatedBy: userId });

      // Notify assigned user if assignment changed
      if (changes.assignedToId && updateData.assignedToId) {
        io.to(`user:${updateData.assignedToId}`).emit('notification:new', {
          type: 'TASK_ASSIGNED',
          task
        });
      }

      sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a task
   * DELETE /api/v1/tasks/:id
   */
  async deleteTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await taskService.deleteTask(id, userId);

      // Emit real-time event to all connected clients
      const io = getSocketIO();
      io.emit('task:deleted', { taskId: id, deletedBy: userId });

      sendSuccess(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard data for current user
   * GET /api/v1/tasks/dashboard
   */
  async getDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dashboardData = await taskService.getDashboardData(userId);
      sendSuccess(res, dashboardData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task audit history
   * GET /api/v1/tasks/:id/history
   */
  async getTaskHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const history = await taskService.getTaskHistory(id);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const taskController = new TaskController();