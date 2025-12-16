/**
 * Profile Page
 * Allows users to view and update their profile information
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Save, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

/**
 * Validation schema for profile form
 */
const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with user data
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  /**
   * Handle profile form submission
   * @param data - Form data
   */
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      reset({ name: updatedUser.name }); // Reset form with new values
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
          <Avatar
            name={user?.name || 'User'}
            size="lg"
            className="w-20 h-20 text-2xl"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.name}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <Input
                label="Full Name"
                placeholder="Enter your name"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={isLoading}
              disabled={!isDirty || isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Account Information Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Account Information
        </h2>

        <div className="space-y-4">
          {/* User ID */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">User ID</span>
            </div>
            <span className="text-gray-900 font-mono text-sm">
              {user?._id || 'N/A'}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Email</span>
            </div>
            <span className="text-gray-900">{user?.email || 'N/A'}</span>
          </div>

          {/* Account Created */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Account Created</span>
            </div>
            <span className="text-gray-900">
              {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
            </span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Last Updated</span>
            </div>
            <span className="text-gray-900">
              {user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Security
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Password</p>
            <p className="text-sm text-gray-500">
              Change your password to keep your account secure
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              // Navigate to settings page for password change
              window.location.href = '/settings';
            }}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Stats
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">-</p>
            <p className="text-sm text-gray-500">Tasks Created</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">-</p>
            <p className="text-sm text-gray-500">Tasks Assigned</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">-</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">-</p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Visit the <a href="/dashboard" className="text-primary-600 hover:underline">Dashboard</a> for detailed statistics
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;