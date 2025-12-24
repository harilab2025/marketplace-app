import { apiClient } from "@/lib/axios";

export async function fetchProductsServer({
    page,
    limit,
    search = '',
    sortBy = '',
    sortOrder = '',
    statusFilter = ['all'],
    verificationStatusFilter = [],
    signal
}: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | '';
    statusFilter?: string[];
    verificationStatusFilter?: string[];
    signal?: AbortSignal;
}) {
    const params: Record<string, string | number | string[]> = { page, limit };

    // Only add search param if it has a value
    if (search && search.trim()) {
        params.search = search.trim();
    }

    // Only add sorting params if they have values
    if (sortBy && sortBy.trim()) {
        params.sortBy = sortBy.trim();
    }
    if (sortOrder && sortOrder.trim()) {
        params.sortOrder = sortOrder.trim();
    }

    // Only add status filter if not 'all' and not all 3 options selected
    if (statusFilter && statusFilter.includes('all') === false && statusFilter.length < 3) {
        // Convert array to comma-separated string for backend
        params.status = Array.isArray(statusFilter) ? statusFilter.join(',') : statusFilter;
    }

    // Add verification status filter if provided
    if (verificationStatusFilter && verificationStatusFilter.length > 0) {
        params.verificationStatus = Array.isArray(verificationStatusFilter)
            ? verificationStatusFilter.join(',')
            : verificationStatusFilter;
    }

    const res = await apiClient.get(`/products`, {
        params,
        timeout: 10000,
        signal, // Pass AbortController signal
    });
    return res.data;
}

// Elasticsearch full-text search with advanced filters
export async function searchProductsElasticsearch({
    query = '',
    category,
    minPrice,
    maxPrice,
    tags,
    isActive = true,
    page = 1,
    limit = 10,
    sortBy = '_score',
    sortOrder = 'desc',
    signal
}: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    signal?: AbortSignal;
}) {
    const params: Record<string, string | number | boolean | string[]> = {
        page,
        limit,
        sortBy,
        sortOrder,
        isActive
    };

    // Add optional filters
    if (query && query.trim()) {
        params.query = query.trim();
    }
    if (category) {
        params.category = category;
    }
    if (minPrice !== undefined) {
        params.minPrice = minPrice;
    }
    if (maxPrice !== undefined) {
        params.maxPrice = maxPrice;
    }
    if (tags && tags.length > 0) {
        params.tags = tags.join(',');
    }

    const res = await apiClient.get(`/products/search`, {
        params,
        timeout: 10000,
        signal,
    });
    return res.data;
}

// Elasticsearch autocomplete suggestions
export async function getProductSuggestions({
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

    const res = await apiClient.get(`/products/suggest`, {
        params: {
            query: query.trim(),
            limit
        },
        timeout: 5000,
        signal,
    });
    return res.data;
}