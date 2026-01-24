import axiosInstance from "@/lib/axiosInstance";

export async function fetchCacheStats() {
    const response = await axiosInstance.get('/admin/cache/stats');
    return response.data;
}

export async function checkCacheHealth() {
    const response = await axiosInstance.get('/admin/cache/health');
    return response.data;
}

export async function clearUserCaches() {
    const response = await axiosInstance.post('/admin/cache/clear/users');
    return response.data;
}

export async function clearProductCaches() {
    const response = await axiosInstance.post('/admin/cache/clear/products');
    return response.data;
}

export async function clearOrderCaches() {
    const response = await axiosInstance.post('/admin/cache/clear/orders');
    return response.data;
}

export async function clearAllAppCaches() {
    const response = await axiosInstance.post('/admin/cache/clear/all');
    return response.data;
}

export async function clearCacheByPattern(pattern: string) {
    const response = await axiosInstance.post('/admin/cache/clear/pattern', { pattern });
    return response.data;
}
