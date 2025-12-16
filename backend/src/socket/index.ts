/**
 * Socket.io Configuration and Event Handlers
 * @module socket
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

let io: Server;

/**
 * User socket mapping for tracking connected users
 */
const userSockets = new Map<string, Set<string>>();

/**
 * Initialize Socket.io server
 * @param httpServer - HTTP server instance
 * @returns Socket.io server instance
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for socket connections
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} (Socket: ${socket.id})`);

    // Track user's socket connections
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    // Join user's personal room for targeted notifications
    socket.join(`user:${userId}`);

    // Handle joining task rooms (for task-specific updates)
    socket.on('task:join', (taskId: string) => {
      socket.join(`task:${taskId}`);
      console.log(`User ${userId} joined task room: ${taskId}`);
    });

    // Handle leaving task rooms
    socket.on('task:leave', (taskId: string) => {
      socket.leave(`task:${taskId}`);
      console.log(`User ${userId} left task room: ${taskId}`);
    });

    // Handle typing indicator for task comments (future feature)
    socket.on('task:typing', (data: { taskId: string; isTyping: boolean }) => {
      socket.to(`task:${data.taskId}`).emit('task:userTyping', {
        userId,
        isTyping: data.isTyping
      });
    });

    // Handle presence updates
    socket.on('presence:update', (status: 'online' | 'away' | 'busy') => {
      socket.broadcast.emit('presence:changed', { userId, status });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${userId} (Reason: ${reason})`);
      
      // Remove socket from user's set
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          // Notify others that user is offline
          socket.broadcast.emit('presence:changed', { userId, status: 'offline' });
        }
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

/**
 * Get the Socket.io server instance
 * @returns Socket.io server instance
 */
export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

/**
 * Check if a user is currently connected
 * @param userId - User ID to check
 * @returns Boolean indicating if user is online
 */
export const isUserOnline = (userId: string): boolean => {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0;
};

/**
 * Get all connected user IDs
 * @returns Array of connected user IDs
 */
export const getConnectedUsers = (): string[] => {
  return Array.from(userSockets.keys());
};

/**
 * Send a notification to a specific user
 * @param userId - Target user ID
 * @param event - Event name
 * @param data - Event data
 */
export const emitToUser = (userId: string, event: string, data: unknown): void => {
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Broadcast to all connected users
 * @param event - Event name
 * @param data - Event data
 */
export const broadcastToAll = (event: string, data: unknown): void => {
  io.emit(event, data);
};