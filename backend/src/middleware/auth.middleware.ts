/**
 * Authentication Middleware
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken, extractToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

/**
 * Authenticate requests using JWT
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractToken(req.headers.authorization, req.cookies);

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractToken(req.headers.authorization, req.cookies);

    if (token) {
      const payload = verifyToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email
      };
    }

    next();
  } catch {
    next();
  }
};