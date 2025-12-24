import { apiClient } from "@/lib/axios";

// Submit product for review (DRAFT/REJECTED → PENDING)
export async function submitProductForReview(productId: string) {
    const res = await apiClient.post(`/products/${productId}/submit`);
    return res.data;
}

// Approve product (PENDING → APPROVED)
export async function approveProduct(productId: string) {
    const res = await apiClient.post(`/products/${productId}/approve`);
    return res.data;
}

// Reject product (PENDING → REJECTED)
export async function rejectProduct(productId: string, reason: string) {
    const res = await apiClient.post(`/products/${productId}/reject`, {
        reason
    });
    return res.data;
}

// Publish product (APPROVED/UNPUBLISHED → PUBLISHED)
export async function publishProduct(productId: string) {
    const res = await apiClient.post(`/products/${productId}/publish`);
    return res.data;
}

// Unpublish product (PUBLISHED → UNPUBLISHED)
export async function unpublishProduct(productId: string, reason?: string) {
    const res = await apiClient.post(`/products/${productId}/unpublish`, {
        reason
    });
    return res.data;
}

// Get pending products for reviewers
export async function getPendingProducts({
    page = 1,
    limit = 10,
    signal
}: {
    page?: number;
    limit?: number;
    signal?: AbortSignal;
}) {
    const res = await apiClient.get(`/products/pending/review`, {
        params: { page, limit },
        timeout: 10000,
        signal
    });
    return res.data;
}

// Get product history
export async function getProductHistory(productId: string) {
    const res = await apiClient.get(`/products/${productId}/history`);
    return res.data;
}
