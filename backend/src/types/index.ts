/**
 * Core type definitions for the Task Manager application
 * @module types
 */

import { Request } from 'express';
import { Document, Types } from 'mongoose';

/**
 * ===================
 * ENUMS
 * ===================
 */

/**
 * Priority levels for tasks
 */
export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

/**
 * Status options for tasks
 */
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed'
}

/**
 * Notification types
 */
export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_OVERDUE = 'TASK_OVERDUE'
}

/**
 * ===================
 * USER INTERFACES
 * ===================
 */

/**
 * User interface
 */
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User document with Mongoose methods
 */
export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * ===================
 * TASK INTERFACES
 * ===================
 */

/**
 * Task interface
 */
export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  status: TaskStatus;
  creatorId: Types.ObjectId;
  assignedToId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task document with Mongoose methods
 */
export interface ITaskDocument extends ITask, Document {
  _id: Types.ObjectId;
}

/**
 * ===================
 * NOTIFICATION INTERFACES
 * ===================
 */

/**
 * Notification interface
 */
export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

/**
 * Notification document
 */
export interface INotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
}

/**
 * ===================
 * AUDIT LOG INTERFACES
 * ===================
 */

/**
 * Audit log entry interface
 */
export interface IAuditLog {
  _id: Types.ObjectId;
  entityType: 'Task' | 'User';
  entityId: Types.ObjectId;
  action: string;
  userId: Types.ObjectId;
  changes: Record<string, { old: unknown; new: unknown }>;
  timestamp: Date;
}

/**
 * Audit log document
 */
export interface IAuditLogDocument extends IAuditLog, Document {
  _id: Types.ObjectId;
}

/**
 * ===================
 * AUTH INTERFACES
 * ===================
 */

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Authenticated request with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * ===================
 * API INTERFACES
 * ===================
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Task filter options
 */
export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: Priority;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
  search?: string;
}

/**
 * ===================
 * SOCKET INTERFACES
 * ===================
 */

/**
 * Socket user mapping
 */
export interface SocketUser {
visibleUserId: string;
  socketId: string;
}