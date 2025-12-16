/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 * @module controllers/auth
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import {
  RegisterUserInput,
  LoginUserInput,
  UpdateProfileInput,
  ChangePasswordInput
} from '../dtos/auth.dto';

/**
 * Cookie options for JWT token
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

/**
 * Authentication Controller Class
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData: RegisterUserInput = req.body;
      console.log('📝 Registration attempt for:', userData.email);

      const { user, token } = await authService.register(userData);

      // Set token in cookie
      res.cookie('token', token, cookieOptions);

      console.log('✅ Registration successful for:', userData.email);
      sendSuccess(res, { user, token }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const credentials: LoginUserInput = req.body;
      console.log('🔐 Login attempt for:', credentials.email);

      const { user, token } = await authService.login(credentials);

      // Set token in cookie
      res.cookie('token', token, cookieOptions);

      console.log('✅ Login successful for:', credentials.email);
      sendSuccess(res, { user, token }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Clear the token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/'
      });

      console.log('👋 User logged out');
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PATCH /api/v1/auth/profile
   */
  async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updateData: UpdateProfileInput = req.body;

      const user = await authService.updateProfile(userId, updateData);

      console.log('✅ Profile updated for user:', userId);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   * POST /api/v1/auth/change-password
   */
  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const passwordData: ChangePasswordInput = req.body;

      await authService.changePassword(userId, passwordData);

      console.log('✅ Password changed for user:', userId);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (for task assignment)
   * GET /api/v1/auth/users
   */
  async getUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await authService.getAllUsers();
      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const authController = new AuthController();