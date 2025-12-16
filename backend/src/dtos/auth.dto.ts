/**
 * Authentication Data Transfer Objects
 * Validation schemas for auth endpoints
 * @module dtos/auth
 */

import { z } from 'zod';

/**
 * Register User DTO
 */
export const RegisterUserDto = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string'
    })
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string'
    })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
  
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string'
    })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
});

/**
 * Login User DTO
 */
export const LoginUserDto = z.object({
  email: z
    .string({
      required_error: 'Email is required'
    })
    .email('Invalid email format')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),
  
  password: z
    .string({
      required_error: 'Password is required'
    })
    .min(1, 'Password is required')
});

/**
 * Update Profile DTO
 */
export const UpdateProfileDto = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  
  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable()
});

/**
 * Change Password DTO
 */
export const ChangePasswordDto = z.object({
  currentPassword: z
    .string({
      required_error: 'Current password is required'
    })
    .min(1, 'Current password is required'),
  
  newPassword: z
    .string({
      required_error: 'New password is required'
    })
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must be less than 128 characters')
});

/**
 * Type exports
 */
export type RegisterUserInput = z.infer<typeof RegisterUserDto>;
export type LoginUserInput = z.infer<typeof LoginUserDto>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileDto>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordDto>;