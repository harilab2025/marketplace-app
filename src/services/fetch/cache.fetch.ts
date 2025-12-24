import { apiClient } from "@/lib/axios";

export async function fetchCacheStats() {
    const response = await apiClient.get('/admin/cache/stats');
    return response.data;
}

export async function checkCacheHealth() {
    const response = await apiClient.get('/admin/cache/health');
    return response.data;
}

export async function clearUserCaches() {
    const response = await apiClient.post('/admin/cache/clear/users');
    return response.data;
}

export async function clearProductCaches() {
    const response = await apiClient.post('/admin/cache/clear/products');
    return response.data;
}

export async function clearOrderCaches() {
    const response = await apiClient.post('/admin/cache/clear/orders');
    return response.data;
}

export async function clearAllAppCaches() {
    const response = await apiClient.post('/admin/cache/clear/all');
    return response.data;
}

export async function clearCacheByPattern(pattern: string) {
    const response = await apiClient.post('/admin/cache/clear/pattern', { pattern });
    return response.data;
}
