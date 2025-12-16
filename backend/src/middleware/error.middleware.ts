/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

/**
 * Global error handler
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Handle known application errors
  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode, error.errors);
  }

  // Handle MongoDB duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    return sendError(res, 'Duplicate entry found', 409);
  }

  // Handle MongoDB validation error
  if (error.name === 'ValidationError') {
    return sendError(res, 'Validation failed', 400);
  }

  // Handle MongoDB CastError
  if (error.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  // Default error
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    500
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  return sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};