import { apiClient } from "@/lib/axios";

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

    const res = await apiClient.get(`/users`, {
        params: cleanParams,
        timeout: 10000,
        signal: params.signal,
    });
    return res.data;
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

    const res = await apiClient.get(`/users/suggestions`, {
        params: { query: query.trim(), limit },
        timeout: 5000,
        signal,
    });

    return res.data;
}

export async function getUserStats(signal?: AbortSignal) {
    const res = await apiClient.get(`/users/stats`, {
        timeout: 10000,
        signal,
    });
    return res.data;
}
