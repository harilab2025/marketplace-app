"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCircle, Mail, Phone, Shield, Calendar, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';
import AvatarUpload from '@/components/profile/AvatarUpload';
import Image from 'next/image';

interface UserProfile {
    publicId: string;
    email: string;
    name: string;
    role: string;
    whatsappNumber: string | null;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    avatar: string | null;
    bio: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        whatsappNumber: '',
        bio: '',
    });

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get('/auth/profile');
                if (response.data.status === 'success') {
                    const userData = response.data.data;
                    setProfile(userData.user);
                    setFormData({
                        name: userData.user?.name || '',
                        whatsappNumber: userData.user?.whatsappNumber || '',
                        bio: userData.user?.bio || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const response = await apiClient.put(`/users/${profile?.publicId}`, formData);

            if (response.data.status === 'success') {
                setProfile(response.data.data);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            }
        } catch (error: unknown) {
            const message = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Failed to update profile';
            toast.error(message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                whatsappNumber: profile.whatsappNumber || '',
                bio: profile.bio || '',
            });
        }
        setIsEditing(false);
    };

    const handleAvatarUpload = (newAvatarUrl: string) => {
        if (profile) {
            setProfile({
                ...profile,
                avatar: newAvatarUrl || null
            });
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'PRODUCT_MANAGER':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'CASHIER':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'CUSTOMER':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'Super Admin';
            case 'PRODUCT_MANAGER':
                return 'Product Manager';
            case 'CASHIER':
                return 'Cashier';
            case 'CUSTOMER':
                return 'Customer';
            default:
                return role;
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-full px-2 sm:px-4 lg:px-6">
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="w-full max-w-full px-2 sm:px-4 lg:px-6">
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Profile not found</div>
                </div>
            </div>
        );
    }
    console.log(profile);

    return (
        <div className="w-full max-w-full px-2 sm:px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h1 className="text-2xl font-semibold">Profile</h1>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={isSaving}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="w-full sm:w-auto"
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Profile Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Avatar & Basic Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex flex-col items-center">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                                    {profile.avatar ? (
                                        <Image
                                            src={profile.avatar}
                                            alt={profile.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                {isEditing && (
                                    <AvatarUpload
                                        currentAvatar={profile.avatar}
                                        userName={profile.name}
                                        onUploadSuccess={handleAvatarUpload}
                                    />
                                )}
                            </div>

                            {/* Name & Role */}
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">{profile.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">{profile.email}</p>

                            <div className="mt-3">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(profile.role)}`}>
                                    <Shield className="h-4 w-4" />
                                    {getRoleLabel(profile.role)}
                                </span>
                            </div>

                            {/* Status Badges */}
                            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {profile.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {profile.emailVerified && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        Email Verified
                                    </span>
                                )}
                                {profile.phoneVerified && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        Phone Verified
                                    </span>
                                )}
                            </div>

                            {/* Join Date */}
                            <div className="mt-6 w-full pt-6 border-t">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {new Date(profile.createdAt).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-6">Account Information</h3>

                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <UserCircle className="h-4 w-4" />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <Input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profile.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </label>
                                <p className="text-gray-900">{profile.email}</p>
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>

                            {/* WhatsApp Number */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="h-4 w-4" />
                                    WhatsApp Number
                                </label>
                                {isEditing ? (
                                    <Input
                                        type="text"
                                        name="whatsappNumber"
                                        value={formData.whatsappNumber}
                                        onChange={handleInputChange}
                                        placeholder="e.g., +62812345678"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profile.whatsappNumber || '-'}</p>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Bio
                                </label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        placeholder="Tell us about yourself..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profile.bio || 'No bio added yet'}</p>
                                )}
                            </div>

                            {/* Account Details */}
                            <div className="pt-6 border-t">
                                <h4 className="text-sm font-semibold text-gray-700 mb-4">Account Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Account ID</p>
                                        <p className="text-gray-900 font-mono text-xs mt-1">{profile.publicId}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Last Updated</p>
                                        <p className="text-gray-900 mt-1">{new Date(profile.updatedAt).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">Security</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Password</p>
                                <p className="text-xs text-gray-500 mt-1">Change your password regularly to keep your account secure</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsChangePasswordOpen(true)}
                            >
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Dialog */}
            <ChangePasswordDialog
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}
