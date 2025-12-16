/**
 * Authentication Routes
 * @module routes/auth
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  RegisterUserDto,
  LoginUserDto,
  UpdateProfileDto,
  ChangePasswordDto
} from '../dtos/auth.dto';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validate(RegisterUserDto),
  authController.register.bind(authController)
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  validate(LoginUserDto),
  authController.login.bind(authController)
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/me',
  authenticate,
  authController.getProfile.bind(authController)
);

/**
 * @route PATCH /api/v1/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.patch(
  '/profile',
  authenticate,
  validate(UpdateProfileDto),
  authController.updateProfile.bind(authController)
);

/**
 * @route POST /api/v1/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post(
  '/change-password',
  authenticate,
  validate(ChangePasswordDto),
  authController.changePassword.bind(authController)
);

/**
 * @route GET /api/v1/auth/users
 * @desc Get all users (for task assignment)
 * @access Private
 */
router.get(
  '/users',
  authenticate,
  authController.getUsers.bind(authController)
);

export default router;