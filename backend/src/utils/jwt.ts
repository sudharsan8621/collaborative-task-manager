/**
 * JWT Utility Functions
 */

import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { UnauthorizedError } from './errors';

/**
 * Get JWT secret from environment
 */
const getJwtSecret = (): Secret => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

/**
 * Get JWT expiration time
 */
const getJwtExpiresIn = (): number => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  // Convert string like '7d' to seconds
  if (expiresIn.endsWith('d')) {
    return parseInt(expiresIn) * 24 * 60 * 60;
  }
  if (expiresIn.endsWith('h')) {
    return parseInt(expiresIn) * 60 * 60;
  }
  if (expiresIn.endsWith('m')) {
    return parseInt(expiresIn) * 60;
  }
  
  return 7 * 24 * 60 * 60; // Default 7 days in seconds
};

/**
 * Generate a JWT token
 * @param userId - User ID
 * @param email - User email
 * @returns Signed JWT token
 */
export const generateToken = (userId: string, email: string): string => {
  const payload: JWTPayload = { userId, email };
  const secret = getJwtSecret();
  const options: SignOptions = {
    expiresIn: getJwtExpiresIn()
  };
  
  return jwt.sign(payload, secret, options);
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
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
 * @param authHeader - Authorization header value
 * @param cookies - Request cookies
 * @returns Token string or null
 */
export const extractToken = (
  authHeader?: string,
  cookies?: { token?: string }
): string | null => {
  // Check Authorization header first (Bearer token)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  if (cookies && cookies.token) {
    return cookies.token;
  }

  return null;
};