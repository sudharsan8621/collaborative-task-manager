/**
 * Task Routes
 * @module routes/task
 */

import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto
} from '../dtos/task.dto';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/tasks/dashboard
 * @desc Get dashboard data for current user
 * @access Private
 */
router.get(
  '/dashboard',
  taskController.getDashboard.bind(taskController)
);

/**
 * @route GET /api/v1/tasks
 * @desc Get all tasks with filters and pagination
 * @access Private
 */
router.get(
  '/',
  validate(TaskQueryDto, 'query'),
  taskController.getTasks.bind(taskController)
);

/**
 * @route POST /api/v1/tasks
 * @desc Create a new task
 * @access Private
 */
router.post(
  '/',
  validate(CreateTaskDto),
  taskController.createTask.bind(taskController)
);

/**
 * @route GET /api/v1/tasks/:id
 * @desc Get a task by ID
 * @access Private
 */
router.get(
  '/:id',
  taskController.getTaskById.bind(taskController)
);

/**
 * @route PATCH /api/v1/tasks/:id
 * @desc Update a task
 * @access Private
 */
router.patch(
  '/:id',
  validate(UpdateTaskDto),
  taskController.updateTask.bind(taskController)
);

/**
 * @route DELETE /api/v1/tasks/:id
 * @desc Delete a task
 * @access Private
 */
router.delete(
  '/:id',
  taskController.deleteTask.bind(taskController)
);

/**
 * @route GET /api/v1/tasks/:id/history
 * @desc Get task audit history
 * @access Private
 */
router.get(
  '/:id/history',
  taskController.getTaskHistory.bind(taskController)
);

export default router;