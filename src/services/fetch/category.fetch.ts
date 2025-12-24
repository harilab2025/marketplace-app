import { apiClient } from "@/lib/axios";

export async function fetchCategoriesServer({
    page,
    limit,
    search = '',
    sortBy = '',
    sortOrder = '',
    signal
}: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | '';
    signal?: AbortSignal;
}) {
    const params: Record<string, string | number> = { page, limit };

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

    const res = await apiClient.get(`/categories`, {
        params,
        timeout: 10000,
        signal, // Pass AbortController signal
    });
    return res.data;
}
