/**
 * JWT Utility Functions
 */

import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { UnauthorizedError } from './errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token
 */
export const generateToken = (userId: string, email: string): string => {
  const payload: JWTPayload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
};

/**
 * Extract token from Authorization header or cookies
 */
export const extractToken = (
  authHeader?: string,
  cookies?: { token?: string }
): string | null => {
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (cookies?.token) {
    return cookies.token;
  }
  return null;
};