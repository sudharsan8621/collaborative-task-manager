/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request frequency
 * @module middleware/rateLimiter
 */

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // Clean every minute

/**
 * Rate limiter factory
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests per window
 */
export const rateLimiter = (windowMs: number = 900000, maxRequests: number = 100) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', store[key].resetTime);

      return sendError(res, 'Too many requests, please try again later', 429);
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - store[key].count);
    res.setHeader('X-RateLimit-Reset', store[key].resetTime);

    next();
  };
};

/**
 * Strict rate limiter for auth endpoints
 */
export const authRateLimiter = rateLimiter(
  15 * 60 * 1000, // 15 minutes
  10 // 10 attempts
);

/**
 * General API rate limiter
 */
export const apiRateLimiter = rateLimiter(
  15 * 60 * 1000, // 15 minutes
  100 // 100 requests
);