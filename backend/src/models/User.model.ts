/**
 * User Model
 */

import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from '../types';

// Define the schema
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    avatar: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Hash password before saving
 */
userSchema.pre('save', async function () {
  // 'this' refers to the document being saved
  if (!this.isModified('password')) {
    return;
  }

  console.log('🔐 Hashing password for:', this.email);
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  console.log('✅ Password hashed successfully');
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;