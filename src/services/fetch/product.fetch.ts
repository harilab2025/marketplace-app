import { apiClient } from "@/lib/axios";

export async function fetchProductsServer({ page, limit }: { page: number; limit: number }) {
    const res = await apiClient.get(`/products`, {
        params: { page, limit },
        timeout: 10000,
    });
    return res.data;
}