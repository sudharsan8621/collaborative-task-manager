/**
 * Audit Log Model
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IAuditLogDocument } from '../types';

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    entityType: {
      type: String,
      enum: ['Task', 'User'],
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'ASSIGNMENT_CHANGE']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changes: {
      type: Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

const AuditLog: Model<IAuditLogDocument> = mongoose.model<IAuditLogDocument>(
  'AuditLog',
  auditLogSchema
);

export default AuditLog;