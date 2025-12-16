/**
 * User Repository
 */

import User from '../models/User.model';
import { IUserDocument } from '../types';
import { RegisterUserInput, UpdateProfileInput } from '../dtos/auth.dto';

/**
 * User Repository Class
 */
export class UserRepository {
  /**
   * Find a user by email
   */
  async findByEmail(
    email: string,
    includePassword = false
  ): Promise<IUserDocument | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    
    if (includePassword) {
      query.select('+password');
    }
    
    return query.exec();
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).exec();
  }

  /**
   * Create a new user
   */
  async create(userData: RegisterUserInput): Promise<IUserDocument> {
    const user = new User(userData);
    return user.save();
  }

  /**
   * Update user profile
   */
  async updateProfile(
    id: string,
    updateData: UpdateProfileInput
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).exec();
  }

  /**
   * Update user password
   */
  async updatePassword(
    id: string,
    newPassword: string
  ): Promise<IUserDocument | null> {
    const user = await User.findById(id).select('+password');
    if (!user) return null;
    
    user.password = newPassword;
    return user.save();
  }

  /**
   * Find all users
   */
  async findAll(): Promise<Pick<IUserDocument, '_id' | 'name' | 'email'>[]> {
    return User.find()
      .select('_id name email avatar')
      .sort({ name: 1 })
      .exec();
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
}

export const userRepository = new UserRepository();