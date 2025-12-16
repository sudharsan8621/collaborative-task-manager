/**
 * Task Service
 * Business logic for task operations
 * @module services/task
 */

import { taskRepository } from '../repositories/task.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { userRepository } from '../repositories/user.repository';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryInput
} from '../dtos/task.dto';
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError
} from '../utils/errors';
import {
  ITaskDocument,
  NotificationType,
  TaskFilterOptions,
  PaginationOptions
} from '../types';

/**
 * Task Service Class
 */
export class TaskService {
  /**
   * Create a new task
   * @param taskData - Task creation data
   * @param creatorId - ID of the user creating the task
   * @returns Created task document
   */
  async createTask(
    taskData: CreateTaskInput,
    creatorId: string
  ): Promise<ITaskDocument> {
    console.log('📋 Creating task:', taskData.title);

    // Validate assignee exists if provided
    if (taskData.assignedToId) {
      const assignee = await userRepository.findById(taskData.assignedToId);
      if (!assignee) {
        throw new BadRequestError('Assigned user not found');
      }
    }

    // Create task
    const task = await taskRepository.create(taskData, creatorId);

    // Create audit log
    await auditLogRepository.create({
      entityType: 'Task',
      entityId: task._id.toString(),
      action: 'CREATE',
      userId: creatorId,
      changes: {}
    });

    // Send notification if task is assigned to someone else
    if (taskData.assignedToId && taskData.assignedToId !== creatorId) {
      const creator = await userRepository.findById(creatorId);
      await notificationRepository.create({
        userId: taskData.assignedToId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assigned',
        message: `${creator?.name || 'Someone'} assigned you a task: "${task.title}"`,
        taskId: task._id.toString()
      });
    }

    // Return populated task
    const populatedTask = await taskRepository.findById(task._id.toString());
    return populatedTask as ITaskDocument;
  }

  /**
   * Get task by ID
   * @param taskId - Task ID
   * @returns Task document
   */
  async getTaskById(taskId: string): Promise<ITaskDocument> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  /**
   * Update a task
   * @param taskId - Task ID
   * @param updateData - Task update data
   * @param userId - ID of the user updating the task
   * @returns Updated task and changes
   */
  async updateTask(
    taskId: string,
    updateData: UpdateTaskInput,
    userId: string
  ): Promise<{
    task: ITaskDocument;
    changes: Record<string, { old: unknown; new: unknown }>;
  }> {
    console.log('📝 Updating task:', taskId);

    // Get existing task
    const existingTask = await taskRepository.findById(taskId);
    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    // Check permission (creator or assignee can update)
    const creatorId = existingTask.creatorId._id?.toString() || existingTask.creatorId.toString();
    const assigneeId = existingTask.assignedToId?._id?.toString() || existingTask.assignedToId?.toString();
    
    const isCreator = creatorId === userId;
    const isAssignee = assigneeId === userId;

    if (!isCreator && !isAssignee) {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    // Validate new assignee if being changed
    if (updateData.assignedToId) {
      const newAssignee = await userRepository.findById(updateData.assignedToId);
      if (!newAssignee) {
        throw new BadRequestError('Assigned user not found');
      }
    }

    // Track changes for audit log
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (updateData.status && updateData.status !== existingTask.status) {
      changes.status = { old: existingTask.status, new: updateData.status };
    }
    if (updateData.priority && updateData.priority !== existingTask.priority) {
      changes.priority = { old: existingTask.priority, new: updateData.priority };
    }
    if (updateData.title && updateData.title !== existingTask.title) {
      changes.title = { old: existingTask.title, new: updateData.title };
    }
    if (updateData.assignedToId !== undefined) {
      const oldAssignee = assigneeId || null;
      if (updateData.assignedToId !== oldAssignee) {
        changes.assignedToId = { old: oldAssignee, new: updateData.assignedToId };
      }
    }

    // Update task
    const updatedTask = await taskRepository.update(taskId, updateData);
    if (!updatedTask) {
      throw new NotFoundError('Task not found');
    }

    // Create audit log if there were changes
    if (Object.keys(changes).length > 0) {
      const action = changes.status
        ? 'STATUS_CHANGE'
        : changes.assignedToId
        ? 'ASSIGNMENT_CHANGE'
        : 'UPDATE';

      await auditLogRepository.create({
        entityType: 'Task',
        entityId: taskId,
        action,
        userId,
        changes
      });
    }

    // Send notification for assignment change
    if (changes.assignedToId && updateData.assignedToId) {
      const updater = await userRepository.findById(userId);
      await notificationRepository.create({
        userId: updateData.assignedToId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'Task Assigned to You',
        message: `${updater?.name || 'Someone'} assigned you a task: "${updatedTask.title}"`,
        taskId
      });
    }

    return { task: updatedTask, changes };
  }

  /**
   * Delete a task
   * @param taskId - Task ID
   * @param userId - ID of the user deleting the task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    console.log('🗑️ Deleting task:', taskId);

    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Only creator can delete
    const creatorId = task.creatorId._id?.toString() || task.creatorId.toString();
    if (creatorId !== userId) {
      throw new ForbiddenError('Only the task creator can delete this task');
    }

    await taskRepository.delete(taskId);

    // Create audit log
    await auditLogRepository.create({
      entityType: 'Task',
      entityId: taskId,
      action: 'DELETE',
      userId,
      changes: {}
    });
  }

  /**
   * Get tasks with filters and pagination
   * @param query - Query parameters
   * @param userId - Current user ID
   * @returns Paginated tasks
   */
  async getTasks(
    query: TaskQueryInput,
    userId: string
  ): Promise<{
    tasks: ITaskDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const filters: TaskFilterOptions = {};
    const pagination: PaginationOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy || 'dueDate',
      sortOrder: query.sortOrder || 'asc'
    };

    // Apply filters
    if (query.status) filters.status = query.status;
    if (query.priority) filters.priority = query.priority;
    if (query.search) filters.search = query.search;
    if (query.assignedToMe) filters.assignedToId = userId;
    if (query.createdByMe) filters.creatorId = userId;
    if (query.overdue) filters.overdue = true;

    const { tasks, total } = await taskRepository.findWithFilters(
      filters,
      pagination
    );

    return {
      tasks,
      total,
      page: pagination.page,
      limit: pagination.limit
    };
  }

  /**
   * Get dashboard data for a user
   * @param userId - User ID
   * @returns Dashboard data
   */
  async getDashboardData(userId: string): Promise<{
    assignedTasks: ITaskDocument[];
    createdTasks: ITaskDocument[];
    overdueTasks: ITaskDocument[];
    stats: {
      total: number;
      byStatus: Record<string, number>;
      byPriority: Record<string, number>;
      overdue: number;
    };
  }> {
    console.log('📊 Getting dashboard data for user:', userId);

    const [assignedTasks, createdTasks, overdueTasks, stats] = await Promise.all([
      taskRepository.findAssignedToUser(userId),
      taskRepository.findCreatedByUser(userId),
      taskRepository.findOverdueForUser(userId),
      taskRepository.getStatsForUser(userId)
    ]);

    return {
      assignedTasks,
      createdTasks,
      overdueTasks,
      stats
    };
  }

  /**
   * Get task audit history
   * @param taskId - Task ID
   * @returns Audit log entries
   */
  async getTaskHistory(taskId: string): Promise<IAuditLogDocument[]> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return auditLogRepository.findByEntity('Task', taskId);
  }
}

// Export singleton instance
export const taskService = new TaskService();

// Import at the end to avoid circular dependency issues
import { IAuditLogDocument } from '../types';