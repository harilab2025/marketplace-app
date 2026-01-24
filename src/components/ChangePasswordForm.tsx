'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useEncryption } from '@/contexts/EncryptionContext';
import { authService, ChangePasswordRequest } from '@/services/auth.service';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  const { data: session } = useSession();
  const { hybridEncryptJSON, isLoading: encryptionLoading, error: encryptionError } = useEncryption();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('newPassword');
  const currentPassword = watch('currentPassword');

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, message: '', color: '' };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) {
      return { score, message: 'Weak', color: 'text-red-600' };
    } else if (score === 3) {
      return { score, message: 'Fair', color: 'text-yellow-600' };
    } else if (score === 4) {
      return { score, message: 'Good', color: 'text-blue-600' };
    } else {
      return { score, message: 'Strong', color: 'text-green-600' };
    }
  };

  // Update password strength when new password changes
  useState(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    } else {
      setPasswordStrength(null);
    }
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);

      // Get access token from session
      const accessToken = (session as { accessToken?: string })?.accessToken;
      if (!accessToken) {
        toast.error('You must be logged in to change your password');
        setIsLoading(false);
        return;
      }

      // Check encryption status
      if (encryptionLoading) {
        toast.error('Encryption is loading. Please wait...');
        setIsLoading(false);
        return;
      }

      if (encryptionError) {
        toast.error('Encryption error. Please refresh the page.');
        setIsLoading(false);
        return;
      }

      // Client-side validation
      if (data.newPassword === data.currentPassword) {
        toast.error('New password cannot be the same as current password');
        setIsLoading(false);
        return;
      }

      if (data.newPassword !== data.confirmPassword) {
        toast.error('New password and confirmation do not match');
        setIsLoading(false);
        return;
      }

      if (data.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long');
        setIsLoading(false);
        return;
      }

      // Prepare change password request
      const changePasswordData: ChangePasswordRequest = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      // Encrypt request with RSA hybrid encryption
      const encryptedRequest = await hybridEncryptJSON(changePasswordData);

      // Call backend API
      await authService.changePassword(accessToken, encryptedRequest);

      toast.success('Password changed successfully');
      reset();
      setPasswordStrength(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword?.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword || '') },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword || '') },
    { label: 'Contains number', met: /[0-9]/.test(newPassword || '') },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(newPassword || '') },
    {
      label: 'Different from current password',
      met: newPassword && currentPassword && newPassword !== currentPassword,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  validate: (value) => {
                    if (value === currentPassword) {
                      return 'New password must be different from current password';
                    }
                    return true;
                  },
                })}
                className="pr-10"
                onChange={(e) => {
                  setPasswordStrength(calculatePasswordStrength(e.target.value));
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {passwordStrength && passwordStrength.score > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Password Strength:</span>
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.score <= 2
                      ? 'bg-red-500'
                      : passwordStrength.score === 3
                        ? 'bg-yellow-500'
                        : passwordStrength.score === 4
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) => {
                    if (value !== newPassword) {
                      return 'Passwords do not match';
                    }
                    return true;
                  },
                })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="text-sm font-medium mb-2">Password Requirements:</p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {req.met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setPasswordStrength(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
