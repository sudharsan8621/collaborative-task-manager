/**
 * Authentication Service
 */

import api from '@/lib/axios';
import { ApiResponse, AuthResponse, LoginInput, RegisterInput, User } from '@/types';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<ApiResponse<User>>('/auth/profile', data);
    return response.data.data!;
  },

  /**
   * Get all users (for task assignment)
   */
  async getUsers(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/auth/users');
    return response.data.data!;
  },
};