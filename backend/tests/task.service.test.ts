/**
 * Task Service Unit Tests
 * @module tests/task.service
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { TaskService } from '../src/services/task.service';
import { taskRepository } from '../src/repositories/task.repository';
import { userRepository } from '../src/repositories/user.repository';
import User from '../src/models/User.model';
import Task from '../src/models/Task.model';
import { Priority, TaskStatus } from '../src/types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../src/utils/errors';

describe('TaskService', () => {
  let mongoServer: MongoMemoryServer;
  let taskService: TaskService;
  let testUserId: string;
  let testUser2Id: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    taskService = new TaskService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Task.deleteMany({});

    // Create test users
    const user1 = await User.create({
      email: 'test1@example.com',
      password: 'Password123',
      name: 'Test User 1'
    });
    testUserId = user1._id.toString();

    const user2 = await User.create({
      email: 'test2@example.com',
      password: 'Password123',
      name: 'Test User 2'
    });
    testUser2Id = user2._id.toString();
  });

  describe('createTask', () => {
    it('should create a task successfully with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        priority: Priority.HIGH
      };

      const task = await taskService.createTask(taskData, testUserId);

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.priority).toBe(Priority.HIGH);
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.creatorId._id.toString()).toBe(testUserId);
    });

    it('should create a task with assignee', async () => {
      const taskData = {
        title: 'Assigned Task',
        description: 'Test Description',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: Priority.MEDIUM,
        assignedToId: testUser2Id
      };

      const task = await taskService.createTask(taskData, testUserId);

      expect(task.assignedToId).toBeDefined();
      expect(task.assignedToId!._id.toString()).toBe(testUser2Id);
    });

    it('should throw BadRequestError for past due date', async () => {
      const taskData = {
        title: 'Past Task',
        description: 'Test Description',
        dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        priority: Priority.LOW
      };

      await expect(taskService.createTask(taskData, testUserId))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should throw BadRequestError for non-existent assignee', async () => {
      const taskData = {
        title: 'Invalid Assignee Task',
        description: 'Test Description',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: Priority.LOW,
        assignedToId: '507f1f77bcf86cd799439011' // Non-existent ID
      };

      await expect(taskService.createTask(taskData, testUserId))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe('updateTask', () => {
    let testTaskId: string;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Original Task',
        description: 'Original Description',
        dueDate: new Date(Date.now() + 86400000),
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        creatorId: testUserId
      });
      testTaskId = task._id.toString();
    });

    it('should update task status successfully', async () => {
      const { task, changes } = await taskService.updateTask(
        testTaskId,
        { status: TaskStatus.IN_PROGRESS },
        testUserId
      );

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(changes.status).toBeDefined();
      expect(changes.status.old).toBe(TaskStatus.TODO);
      expect(changes.status.new).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should update task priority', async () => {
      const { task, changes } = await taskService.updateTask(
        testTaskId,
        { priority: Priority.URGENT },
        testUserId
      );

      expect(task.priority).toBe(Priority.URGENT);
      expect(changes.priority).toBeDefined();
    });

    it('should throw NotFoundError for non-existent task', async () => {
      await expect(
        taskService.updateTask(
          '507f1f77bcf86cd799439011',
          { status: TaskStatus.COMPLETED },
          testUserId
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when non-owner tries to update', async () => {
      // Create a third user who is not creator or assignee
      const user3 = await User.create({
        email: 'test3@example.com',
        password: 'Password123',
        name: 'Test User 3'
      });

      await expect(
        taskService.updateTask(
          testTaskId,
          { status: TaskStatus.COMPLETED },
          user3._id.toString()
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteTask', () => {
    let testTaskId: string;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Task to Delete',
        description: 'Will be deleted',
        dueDate: new Date(Date.now() + 86400000),
        priority: Priority.LOW,
        status: TaskStatus.TODO,
        creatorId: testUserId
      });
      testTaskId = task._id.toString();
    });

    it('should delete task successfully as creator', async () => {
      await taskService.deleteTask(testTaskId, testUserId);
      
      const deletedTask = await Task.findById(testTaskId);
      expect(deletedTask).toBeNull();
    });

    it('should throw ForbiddenError when non-creator tries to delete', async () => {
      await expect(
        taskService.deleteTask(testTaskId, testUser2Id)
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError for non-existent task', async () => {
      await expect(
        taskService.deleteTask('507f1f77bcf86cd799439011', testUserId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});