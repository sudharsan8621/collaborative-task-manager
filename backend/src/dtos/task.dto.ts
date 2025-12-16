/**
 * Task Data Transfer Objects
 * Validation schemas for task endpoints
 * @module dtos/task
 */

import { z } from 'zod';
import { Priority, TaskStatus } from '../types';

/**
 * Create Task DTO
 */
export const CreateTaskDto = z.object({
  title: z
    .string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be a string'
    })
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string'
    })
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters')
    .trim(),
  
  dueDate: z
    .string({
      required_error: 'Due date is required'
    })
    .min(1, 'Due date is required'),
  
  priority: z.nativeEnum(Priority, {
    errorMap: () => ({ message: 'Invalid priority value. Must be Low, Medium, High, or Urgent' })
  }),
  
  assignedToId: z
    .string()
    .min(1)
    .optional()
    .nullable()
});

/**
 * Update Task DTO
 */
export const UpdateTaskDto = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be less than 100 characters')
    .trim()
    .optional(),
  
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .max(5000, 'Description must be less than 5000 characters')
    .trim()
    .optional(),
  
  dueDate: z
    .string()
    .optional(),
  
  priority: z
    .nativeEnum(Priority)
    .optional(),
  
  status: z
    .nativeEnum(TaskStatus)
    .optional(),
  
  assignedToId: z
    .string()
    .nullable()
    .optional()
});

/**
 * Task Query DTO (for filtering and pagination)
 */
export const TaskQueryDto = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1)),
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100).default(10)),
  
  status: z
    .nativeEnum(TaskStatus)
    .optional(),
  
  priority: z
    .nativeEnum(Priority)
    .optional(),
  
  sortBy: z
    .enum(['dueDate', 'createdAt', 'priority', 'status'])
    .optional()
    .default('dueDate'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc'),
  
  search: z
    .string()
    .max(100)
    .optional(),
  
  assignedToMe: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  
  createdByMe: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  
  overdue: z
    .string()
    .optional()
    .transform((val) => val === 'true')
});

/**
 * Task ID DTO
 */
export const TaskIdDto = z.object({
  id: z
    .string({
      required_error: 'Task ID is required'
    })
    .min(1, 'Task ID is required')
});

/**
 * Type exports
 */
export type CreateTaskInput = z.infer<typeof CreateTaskDto>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskDto>;
export type TaskQueryInput = z.infer<typeof TaskQueryDto>;
export type TaskIdInput = z.infer<typeof TaskIdDto>;