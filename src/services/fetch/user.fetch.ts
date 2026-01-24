import axiosInstance from "@/lib/axiosInstance";


export interface UserSearchParams {
    query?: string;
    role?: string | string[];
    isActive?: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | '';
    signal?: AbortSignal;
}

export async function fetchUsers(params: UserSearchParams) {
    try {
        const cleanParams: Record<string, string | number | boolean> = {
            page: params.page || 1,
            limit: params.limit || 10,
        };

        if (params.query && params.query.trim()) {
            cleanParams.query = params.query.trim();
        }

        if (params.role) {
            // Support both single role and multiple roles (comma-separated)
            cleanParams.role = Array.isArray(params.role) ? params.role.join(',') : params.role;
        }

        if (params.isActive !== undefined) {
            cleanParams.isActive = params.isActive;
        }

        if (params.emailVerified !== undefined) {
            cleanParams.emailVerified = params.emailVerified;
        }

        if (params.phoneVerified !== undefined) {
            cleanParams.phoneVerified = params.phoneVerified;
        }

        if (params.sortBy && params.sortBy.trim()) {
            cleanParams.sortBy = params.sortBy.trim();
        }

        if (params.sortOrder && params.sortOrder.trim()) {
            cleanParams.sortOrder = params.sortOrder.trim();
        }

        const res = await axiosInstance.get(`/users`, {
            params: cleanParams,
            timeout: 10000,
            signal: params.signal,
        });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { users: [], total: 0, page: 1, limit: params.limit || 10, totalPages: 0 },
            message: error instanceof Error ? error.message : 'Failed to fetch users'
        };
    }
}

export async function getUserSuggestions({
    query,
    limit = 5,
    signal
}: {
    query: string;
    limit?: number;
    signal?: AbortSignal;
}) {
    if (!query || !query.trim()) {
        return { status: 'success', data: { suggestions: [] } };
    }

    try {
        const res = await axiosInstance.get(`/users/suggestions`, {
            params: { query: query.trim(), limit },
            timeout: 5000,
            signal,
        });

        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { suggestions: [] },
            message: error instanceof Error ? error.message : 'Failed to fetch suggestions'
        };
    }
}

export async function getUserStats(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.get(`/users/stats`, {
            timeout: 10000,
            signal,
        });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { totalUsers: 0, activeUsers: 0, verifiedUsers: 0 },
            message: error instanceof Error ? error.message : 'Failed to fetch user stats'
        };
    }
}

// =============================================
// Profile API Functions
// =============================================

export interface UserProfile {
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

export interface UpdateProfileData {
    name?: string;
    bio?: string;
    whatsappNumber?: string;
}

/**
 * Get current user's profile
 * GET /api/user/profile
 */
export async function getUserProfile(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.get('/user/profile', {
            timeout: 10000,
            signal,
        });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: null,
            message: error instanceof Error ? error.message : 'Failed to fetch profile'
        };
    }
}

/**
 * Update current user's profile (name, bio, whatsappNumber)
 * PATCH /api/user/profile
 */
export async function updateUserProfile(data: UpdateProfileData, signal?: AbortSignal) {
    try {
        const res = await axiosInstance.patch('/user/profile', data, {
            timeout: 10000,
            signal,
        });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        const axiosError = error as { response?: { data?: { message?: string } } };
        return {
            status: 'error',
            data: null,
            message: axiosError.response?.data?.message || (error instanceof Error ? error.message : 'Failed to update profile')
        };
    }
}

/**
 * Upload/replace avatar
 * POST /api/user/profile/avatar
 */
export async function uploadAvatar(file: File, signal?: AbortSignal) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axiosInstance.post('/user/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // Longer timeout for file upload
            signal,
        });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        const axiosError = error as { response?: { data?: { message?: string } } };
        return {
            status: 'error',
            data: null,
            message: axiosError.response?.data?.message || (error instanceof Error ? error.message : 'Failed to upload avatar')
        };
    }
}

/**
 * Delete avatar
 * DELETE /api/user/profile/avatar
 */
export async function deleteAvatar(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.delete('/user/profile/avatar', {
            timeout: 10000,
            signal,
        });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        const axiosError = error as { response?: { data?: { message?: string } } };
        return {
            status: 'error',
            data: null,
            message: axiosError.response?.data?.message || (error instanceof Error ? error.message : 'Failed to delete avatar')
        };
    }
}
