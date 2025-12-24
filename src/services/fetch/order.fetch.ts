import { apiClient } from "@/lib/axios";

export interface OrderSearchParams {
    query?: string;
    userId?: string;
    status?: string;
    paymentStatus?: string;
    minTotal?: number;
    maxTotal?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | '';
    signal?: AbortSignal;
}

export async function fetchOrders(params: OrderSearchParams) {
    const cleanParams: Record<string, string | number> = {
        page: params.page || 1,
        limit: params.limit || 10,
    };

    if (params.query && params.query.trim()) {
        cleanParams.query = params.query.trim();
    }

    if (params.userId) {
        cleanParams.userId = params.userId;
    }

    if (params.status) {
        cleanParams.status = params.status;
    }

    if (params.paymentStatus) {
        cleanParams.paymentStatus = params.paymentStatus;
    }

    if (params.minTotal !== undefined) {
        cleanParams.minTotal = params.minTotal;
    }

    if (params.maxTotal !== undefined) {
        cleanParams.maxTotal = params.maxTotal;
    }

    if (params.startDate) {
        cleanParams.startDate = params.startDate;
    }

    if (params.endDate) {
        cleanParams.endDate = params.endDate;
    }

    if (params.sortBy && params.sortBy.trim()) {
        cleanParams.sortBy = params.sortBy.trim();
    }

    if (params.sortOrder && params.sortOrder.trim()) {
        cleanParams.sortOrder = params.sortOrder.trim();
    }

    const res = await apiClient.get(`/orders`, {
        params: cleanParams,
        timeout: 10000,
        signal: params.signal,
    });
    return res.data;
}

export async function getOrderSuggestions({
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

    const res = await apiClient.get(`/orders/suggestions`, {
        params: { query: query.trim(), limit },
        timeout: 5000,
        signal,
    });

    return res.data;
}

export async function getOrderStats(userId?: string, signal?: AbortSignal) {
    const params: Record<string, string> = {};
    if (userId) {
        params.userId = userId;
    }

    const res = await apiClient.get(`/orders/stats`, {
        params,
        timeout: 10000,
        signal,
    });
    return res.data;
}
