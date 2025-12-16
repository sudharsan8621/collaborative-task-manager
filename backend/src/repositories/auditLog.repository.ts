/**
 * Audit Log Repository
 * Data access layer for audit log operations
 * @module repositories/auditLog
 */

import AuditLog from '../models/AuditLog.model';
import { IAuditLogDocument } from '../types';
import { Types } from 'mongoose';

/**
 * Audit Log Repository Class
 */
export class AuditLogRepository {
  /**
   * Create a new audit log entry
   * @param data - Audit log data
   * @returns Created audit log document
   */
  async create(data: {
    entityType: 'Task' | 'User';
    entityId: string;
    action: string;
    userId: string;
    changes?: Record<string, { old: unknown; new: unknown }>;
  }): Promise<IAuditLogDocument> {
    const auditLog = new AuditLog({
      entityType: data.entityType,
      entityId: new Types.ObjectId(data.entityId),
      action: data.action,
      userId: new Types.ObjectId(data.userId),
      changes: data.changes || {},
      timestamp: new Date()
    });

    const savedLog = await auditLog.save();
    console.log('📝 Audit log created:', data.action, 'on', data.entityType);
    
    return savedLog;
  }

  /**
   * Find audit logs for an entity
   * @param entityType - Type of entity
   * @param entityId - Entity ID
   * @param limit - Number of logs to return
   * @returns Array of audit log documents
   */
  async findByEntity(
    entityType: 'Task' | 'User',
    entityId: string,
    limit = 50
  ): Promise<IAuditLogDocument[]> {
    return AuditLog.find({
      entityType,
      entityId: new Types.ObjectId(entityId)
    })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Find audit logs by user
   * @param userId - User ID
   * @param limit - Number of logs to return
   * @returns Array of audit log documents
   */
  async findByUser(
    userId: string,
    limit = 50
  ): Promise<IAuditLogDocument[]> {
    return AuditLog.find({ userId: new Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Find recent audit logs
   * @param limit - Number of logs to return
   * @returns Array of audit log documents
   */
  async findRecent(limit = 100): Promise<IAuditLogDocument[]> {
    return AuditLog.find()
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Delete old audit logs
   * @param olderThan - Date threshold
   * @returns Number of deleted logs
   */
  async deleteOlderThan(olderThan: Date): Promise<number> {
    const result = await AuditLog.deleteMany({
      timestamp: { $lt: olderThan }
    });
    return result.deletedCount;
  }
}

// Export singleton instance
export const auditLogRepository = new AuditLogRepository();