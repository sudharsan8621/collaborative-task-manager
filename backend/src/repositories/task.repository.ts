/**
 * Task Repository
 * Data access layer for task operations
 * @module repositories/task
 */

import Task from '../models/Task.model';
import {
  ITaskDocument,
  TaskStatus,
  Priority,
  PaginationOptions,
  TaskFilterOptions
} from '../types';
import { CreateTaskInput, UpdateTaskInput } from '../dtos/task.dto';
import { Types, FilterQuery } from 'mongoose';

/**
 * Task Repository Class
 */
export class TaskRepository {
  /**
   * Create a new task
   * @param taskData - Task creation data
   * @param creatorId - ID of the user creating the task
   * @returns Created task document
   */
  async create(
    taskData: CreateTaskInput,
    creatorId: string
  ): Promise<ITaskDocument> {
    const task = new Task({
      title: taskData.title,
      description: taskData.description,
      dueDate: new Date(taskData.dueDate),
      priority: taskData.priority,
      status: TaskStatus.TODO,
      creatorId: new Types.ObjectId(creatorId),
      assignedToId: taskData.assignedToId
        ? new Types.ObjectId(taskData.assignedToId)
        : null
    });

    const savedTask = await task.save();
    console.log('✅ Task created:', savedTask.title);
    
    return savedTask;
  }

  /**
   * Find task by ID
   * @param id - Task ID
   * @returns Task document or null
   */
  async findById(id: string): Promise<ITaskDocument | null> {
    try {
      return await Task.findById(id)
        .populate('creatorId', 'name email avatar')
        .populate('assignedToId', 'name email avatar')
        .exec();
    } catch (error) {
      console.error('Error finding task by ID:', error);
      return null;
    }
  }

  /**
   * Update task
   * @param id - Task ID
   * @param updateData - Task update data
   * @returns Updated task document or null
   */
  async update(
    id: string,
    updateData: UpdateTaskInput
  ): Promise<ITaskDocument | null> {
    const updatePayload: Record<string, unknown> = {};

    if (updateData.title !== undefined) {
      updatePayload.title = updateData.title;
    }
    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description;
    }
    if (updateData.dueDate !== undefined) {
      updatePayload.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.priority !== undefined) {
      updatePayload.priority = updateData.priority;
    }
    if (updateData.status !== undefined) {
      updatePayload.status = updateData.status;
    }
    if (updateData.assignedToId !== undefined) {
      updatePayload.assignedToId = updateData.assignedToId
        ? new Types.ObjectId(updateData.assignedToId)
        : null;
    }

    return Task.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true
    })
      .populate('creatorId', 'name email avatar')
      .populate('assignedToId', 'name email avatar')
      .exec();
  }

  /**
   * Delete task
   * @param id - Task ID
   * @returns Deleted task document or null
   */
  async delete(id: string): Promise<ITaskDocument | null> {
    return Task.findByIdAndDelete(id).exec();
  }

  /**
   * Find tasks with filters and pagination
   * @param filters - Filter options
   * @param pagination - Pagination options
   * @returns Object containing tasks and total count
   */
  async findWithFilters(
    filters: TaskFilterOptions,
    pagination: PaginationOptions
  ): Promise<{ tasks: ITaskDocument[]; total: number }> {
    const query: FilterQuery<ITaskDocument> = {};

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.assignedToId) {
      query.assignedToId = new Types.ObjectId(filters.assignedToId);
    }
    if (filters.creatorId) {
      query.creatorId = new Types.ObjectId(filters.creatorId);
    }
    if (filters.overdue) {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: TaskStatus.COMPLETED };
    }
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;
    const sortField = pagination.sortBy || 'dueDate';
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

    // Calculate skip
    const skip = (pagination.page - 1) * pagination.limit;

    // Execute queries
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('creatorId', 'name email avatar')
        .populate('assignedToId', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      Task.countDocuments(query).exec()
    ]);

    return { tasks, total };
  }

  /**
   * Find tasks assigned to a specific user
   * @param userId - User ID
   * @returns Array of task documents
   */
  async findAssignedToUser(userId: string): Promise<ITaskDocument[]> {
    return Task.find({ assignedToId: new Types.ObjectId(userId) })
      .populate('creatorId', 'name email avatar')
      .populate('assignedToId', 'name email avatar')
      .sort({ dueDate: 1 })
      .limit(50)
      .exec();
  }

  /**
   * Find tasks created by a specific user
   * @param userId - User ID
   * @returns Array of task documents
   */
  async findCreatedByUser(userId: string): Promise<ITaskDocument[]> {
    return Task.find({ creatorId: new Types.ObjectId(userId) })
      .populate('creatorId', 'name email avatar')
      .populate('assignedToId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  /**
   * Find overdue tasks for a user
   * @param userId - User ID
   * @returns Array of overdue task documents
   */
  async findOverdueForUser(userId: string): Promise<ITaskDocument[]> {
    return Task.find({
      $or: [
        { assignedToId: new Types.ObjectId(userId) },
        { creatorId: new Types.ObjectId(userId) }
      ],
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatus.COMPLETED }
    })
      .populate('creatorId', 'name email avatar')
      .populate('assignedToId', 'name email avatar')
      .sort({ dueDate: 1 })
      .limit(50)
      .exec();
  }

  /**
   * Get task statistics for dashboard
   * @param userId - User ID
   * @returns Task statistics
   */
  async getStatsForUser(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    overdue: number;
  }> {
    const userObjectId = new Types.ObjectId(userId);

    const [statusStats, priorityStats, overdueCount, totalCount] = await Promise.all([
      // Group by status
      Task.aggregate([
        {
          $match: {
            $or: [{ assignedToId: userObjectId }, { creatorId: userObjectId }]
          }
        },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Group by priority
      Task.aggregate([
        {
          $match: {
            $or: [{ assignedToId: userObjectId }, { creatorId: userObjectId }]
          }
        },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),

      // Count overdue
      Task.countDocuments({
        $or: [{ assignedToId: userObjectId }, { creatorId: userObjectId }],
        dueDate: { $lt: new Date() },
        status: { $ne: TaskStatus.COMPLETED }
      }),

      // Count total
      Task.countDocuments({
        $or: [{ assignedToId: userObjectId }, { creatorId: userObjectId }]
      })
    ]);

    // Transform results
    const byStatus: Record<string, number> = {};
    statusStats.forEach((stat: { _id: string; count: number }) => {
      byStatus[stat._id] = stat.count;
    });

    const byPriority: Record<string, number> = {};
    priorityStats.forEach((stat: { _id: string; count: number }) => {
      byPriority[stat._id] = stat.count;
    });

    return {
      total: totalCount,
      byStatus,
      byPriority,
      overdue: overdueCount
    };
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();