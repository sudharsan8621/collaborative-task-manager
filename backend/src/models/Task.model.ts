/**
 * Task Model
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ITaskDocument, Priority, TaskStatus } from '../types';

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
taskSchema.index({ creatorId: 1, status: 1 });
taskSchema.index({ assignedToId: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

const Task: Model<ITaskDocument> = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;