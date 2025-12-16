/**
 * Authentication Service
 */

import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { generateToken } from '../utils/jwt';
import {
  RegisterUserInput,
  LoginUserInput,
  UpdateProfileInput,
  ChangePasswordInput
} from '../dtos/auth.dto';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError
} from '../utils/errors';
import { IUserDocument } from '../types';

/**
 * Authentication Service Class
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(
    userData: RegisterUserInput
  ): Promise<{ user: IUserDocument; token: string }> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user
    const user = await userRepository.create(userData);

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    console.log('✅ User registered successfully:', user.email);

    return { user, token };
  }

  /**
   * Login a user
   */
  async login(
    credentials: LoginUserInput
  ): Promise<{ user: IUserDocument; token: string }> {
    console.log('🔐 Login attempt for:', credentials.email);

    // Find user with password field included
    const user = await userRepository.findByEmail(credentials.email, true);
    
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found in database');
      throw new UnauthorizedError('Invalid email or password');
    }

    console.log('🔑 Password in DB exists:', !!user.password);
    console.log('🔑 Password in DB (first 20 chars):', user.password?.substring(0, 20));
    console.log('🔑 Password provided:', credentials.password);

    // Check if password exists
    if (!user.password) {
      console.log('❌ No password stored for user');
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password using bcrypt directly
    console.log('🔄 Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    
    console.log('✅ Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password comparison failed');
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    console.log('✅ Login successful for:', user.email);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return { user: userResponse as IUserDocument, token };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateData: UpdateProfileInput
  ): Promise<IUserDocument> {
    const user = await userRepository.updateProfile(userId, updateData);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    passwordData: ChangePasswordInput
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userWithPassword = await userRepository.findByEmail(user.email, true);
    if (!userWithPassword || !userWithPassword.password) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      passwordData.currentPassword,
      userWithPassword.password
    );
    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    await userRepository.updatePassword(userId, passwordData.newPassword);
  }

  /**
   * Get all users (for task assignment)
   */
  async getAllUsers(): Promise<Pick<IUserDocument, '_id' | 'name' | 'email'>[]> {
    return userRepository.findAll();
  }
}

export const authService = new AuthService();