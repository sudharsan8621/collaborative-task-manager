/**
 * Database Seeder Script
 * Creates sample users and tasks for development/testing
 * Run with: npm run seed
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.model';
import Task from '../models/Task.model';
import Notification from '../models/Notification.model';
import { Priority, TaskStatus, NotificationType } from '../types';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';

const sampleUsers = [
  {
    email: 'john@example.com',
    password: 'Password123',
    name: 'John Doe',
  },
  {
    email: 'jane@example.com',
    password: 'Password123',
    name: 'Jane Smith',
  },
  {
    email: 'bob@example.com',
    password: 'Password123',
    name: 'Bob Johnson',
  },
  {
    email: 'alice@example.com',
    password: 'Password123',
    name: 'Alice Williams',
  },
];

const generateTasks = (users: any[]) => {
  const now = new Date();
  const tasks = [
    {
      title: 'Design new landing page',
      description: 'Create a modern, responsive landing page design for the marketing campaign. Include hero section, features, testimonials, and CTA.',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      creatorId: users[0]._id,
      assignedToId: users[1]._id,
    },
    {
      title: 'Fix authentication bug',
      description: 'Users are experiencing issues with session timeout. Investigate and fix the JWT refresh token mechanism.',
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
      priority: Priority.URGENT,
      status: TaskStatus.TODO,
      creatorId: users[0]._id,
      assignedToId: users[2]._id,
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST API endpoints using OpenAPI/Swagger specification. Include request/response examples.',
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
      creatorId: users[1]._id,
      assignedToId: users[0]._id,
    },
    {
      title: 'Implement dark mode',
      description: 'Add dark mode support to the frontend application. Should respect system preferences and allow manual toggle.',
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
      priority: Priority.LOW,
      status: TaskStatus.REVIEW,
      creatorId: users[2]._id,
      assignedToId: users[1]._id,
    },
    {
      title: 'Database optimization',
      description: 'Analyze slow queries and add appropriate indexes. Consider implementing query caching for frequently accessed data.',
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      creatorId: users[0]._id,
      assignedToId: users[0]._id,
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment. Include staging and production environments.',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
      priority: Priority.MEDIUM,
      status: TaskStatus.COMPLETED,
      creatorId: users[3]._id,
      assignedToId: users[2]._id,
    },
    {
      title: 'User feedback survey',
      description: 'Create and distribute a user satisfaction survey. Analyze results and compile a report with actionable insights.',
      dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days
      priority: Priority.LOW,
      status: TaskStatus.TODO,
      creatorId: users[1]._id,
      assignedToId: users[3]._id,
    },
    {
      title: 'Security audit',
      description: 'Perform comprehensive security audit of the application. Check for OWASP top 10 vulnerabilities.',
      dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (overdue)
      priority: Priority.URGENT,
      status: TaskStatus.TODO,
      creatorId: users[0]._id,
      assignedToId: users[2]._id,
    },
    {
      title: 'Mobile app research',
      description: 'Research React Native vs Flutter for potential mobile app development. Prepare comparison document.',
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      priority: Priority.LOW,
      status: TaskStatus.TODO,
      creatorId: users[3]._id,
      assignedToId: null,
    },
    {
      title: 'Performance monitoring setup',
      description: 'Integrate application performance monitoring (APM) tool. Configure alerts for critical metrics.',
      dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days
      priority: Priority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      creatorId: users[2]._id,
      assignedToId: users[3]._id,
    },
  ];

  return tasks;
};

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // Create users
    console.log('👥 Creating users...');
    const users = await User.create(sampleUsers);
    console.log(`   Created ${users.length} users`);

    // Create tasks
    console.log('📋 Creating tasks...');
    const tasksData = generateTasks(users);
    const tasks = await Task.create(tasksData);
    console.log(`   Created ${tasks.length} tasks`);

    // Create sample notifications
    console.log('🔔 Creating notifications...');
    const notifications = [];
    for (const task of tasks) {
      if (task.assignedToId) {
        notifications.push({
          userId: task.assignedToId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'Task Assigned',
          message: `You have been assigned to: ${task.title}`,
          taskId: task._id,
          read: Math.random() > 0.5, // Random read status
        });
      }
    }
    await Notification.create(notifications);
    console.log(`   Created ${notifications.length} notifications`);

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📧 Sample login credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: Password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();