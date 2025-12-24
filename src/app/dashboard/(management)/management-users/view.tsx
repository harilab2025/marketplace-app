"use client";

import { useState, useEffect } from 'react';
import { UserCircle, Mail, Phone, Shield, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';

interface ViewUserProps {
    setActionContent: (action: string) => void;
    userId: string;
}

interface UserData {
    publicId: string;
    email: string;
    name: string;
    role: string;
    whatsappNumber: string | null;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function ViewUser({ setActionContent, userId }: ViewUserProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get<{ status: string; data: UserData }>(`/users/${userId}`);

                if (response.data.status === 'success') {
                    setUser(response.data.data);
                }
            } catch (error: unknown) {
                const message = error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : 'Failed to fetch user data';
                toast.error(message || 'Failed to fetch user data');
                setActionContent('table');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [userId, setActionContent]);

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

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="space-y-6">
                    <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-center text-gray-500">User not found</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Header with Avatar */}
            <div className="p-6 border-b bg-linear-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col items-center text-center">
                    {user.avatar ? (
                        <Image
                            src={user.avatar}
                            alt={user.name}
                            className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="h-32 w-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                            <UserCircle className="h-20 w-20 text-white" />
                        </div>
                    )}
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                            <Shield className="h-4 w-4" />
                            {getRoleLabel(user.role)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* User Details */}
            <div className="p-6 space-y-6">
                {/* Account Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <UserCircle className="h-5 w-5" />
                        Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </label>
                            <p className="text-base text-gray-900">{user.email}</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                                <Phone className="h-4 w-4" />
                                WhatsApp Number
                            </label>
                            <p className="text-base text-gray-900">{user.whatsappNumber || '-'}</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                                <Shield className="h-4 w-4" />
                                Role
                            </label>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                                {getRoleLabel(user.role)}
                            </span>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">
                                Account ID
                            </label>
                            <p className="text-gray-900 font-mono text-xs">{user.publicId}</p>
                        </div>
                    </div>
                </div>

                {/* Verification Status */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Verification Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                                {user.isActive ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <span className="font-medium text-gray-900">Account Status</span>
                            </div>
                            <p className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                                {user.emailVerified ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-gray-400" />
                                )}
                                <span className="font-medium text-gray-900">Email Verified</span>
                            </div>
                            <p className={`text-sm ${user.emailVerified ? 'text-green-600' : 'text-gray-500'}`}>
                                {user.emailVerified ? 'Verified' : 'Not Verified'}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                                {user.phoneVerified ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-gray-400" />
                                )}
                                <span className="font-medium text-gray-900">Phone Verified</span>
                            </div>
                            <p className={`text-sm ${user.phoneVerified ? 'text-green-600' : 'text-gray-500'}`}>
                                {user.phoneVerified ? 'Verified' : 'Not Verified'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-500">Created At</span>
                            </div>
                            <p className="text-base text-gray-900">{formatDate(user.createdAt)}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                            </div>
                            <p className="text-base text-gray-900">{formatDate(user.updatedAt)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
