import { apiClient } from "@/lib/axios";

/**
 * Elasticsearch Monitoring & Management Service
 * SUPERADMIN ONLY - All endpoints require SUPERADMIN role
 */

// ============================================================================
// MONITORING ENDPOINTS
// ============================================================================

/**
 * Get Elasticsearch cluster health
 * @returns Cluster health data with status (green/yellow/red)
 */
export async function getClusterHealth(signal?: AbortSignal) {
    const res = await apiClient.get(`/elasticsearch/health`, {
        timeout: 10000,
        signal,
    });
    return res.data;
}

/**
 * Get all indices statistics
 * @returns Total documents and size across all indices
 */
export async function getAllIndicesStats(signal?: AbortSignal) {
    const res = await apiClient.get(`/elasticsearch/stats`, {
        timeout: 10000,
        signal,
    });
    return res.data;
}

/**
 * Get products index statistics
 * @returns Products index documents count, size, search/indexing metrics
 */
export async function getProductsIndexStats(signal?: AbortSignal) {
    const res = await apiClient.get(`/elasticsearch/products/stats`, {
        timeout: 10000,
        signal,
    });
    return res.data;
}

/**
 * Check sync status between Database and Elasticsearch
 * @returns Sync status with database vs elasticsearch counts
 */
export async function checkSyncStatus(signal?: AbortSignal) {
    const res = await apiClient.get(`/elasticsearch/products/sync-check`, {
        timeout: 10000,
        signal,
    });
    return res.data;
}

// ============================================================================
// MANAGEMENT ENDPOINTS (DESTRUCTIVE OPERATIONS)
// ============================================================================

/**
 * Delete products index (DESTRUCTIVE)
 * WARNING: Deletes index without reindexing
 */
export async function deleteProductsIndex(signal?: AbortSignal) {
    const res = await apiClient.delete(`/elasticsearch/products`, {
        timeout: 30000,
        signal,
    });
    return res.data;
}

/**
 * Reset products index (DESTRUCTIVE)
 * Deletes and recreates index (empty)
 */
export async function resetProductsIndex(dryRun: boolean = true, signal?: AbortSignal) {
    const res = await apiClient.post(
        `/elasticsearch/products/reset`,
        { dryRun },
        {
            timeout: 30000,
            signal,
        }
    );
    return res.data;
}

/**
 * Reindex all products from database to Elasticsearch
 * Does not delete index, just reindexes data
 */
export async function reindexProducts(dryRun: boolean = true, signal?: AbortSignal) {
    const res = await apiClient.post(
        `/elasticsearch/products/reindex`,
        { dryRun },
        {
            timeout: 60000, // 60s for large datasets
            signal,
        }
    );
    return res.data;
}

/**
 * Reset and reindex products (RECOMMENDED)
 * Full refresh: Delete, recreate, and reindex all data
 */
export async function resetAndReindexProducts(dryRun: boolean = true, signal?: AbortSignal) {
    const res = await apiClient.post(
        `/elasticsearch/products/reset-and-reindex`,
        { dryRun },
        {
            timeout: 90000, // 90s for full operation
            signal,
        }
    );
    return res.data;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ClusterStatus = 'green' | 'yellow' | 'red';

export interface ClusterHealth {
    status: ClusterStatus;
    clusterName: string;
    numberOfNodes: number;
    numberOfDataNodes: number;
    activePrimaryShards: number;
    activeShards: number;
    relocatingShards: number;
    initializingShards: number;
    unassignedShards: number;
    version: string;
    isHealthy: boolean;
}

export interface IndexStats {
    documents: number;
    size: number;
    sizeInMB: string;
}

export interface AllIndicesStats {
    total: IndexStats;
    indices: {
        [indexName: string]: IndexStats;
    };
}

export interface ProductsIndexStats {
    exists: boolean;
    documents: number;
    deleted: number;
    sizeInBytes: number;
    sizeInMB: string;
    indexingTotal: number;
    searchTotal: number;
}

export interface SyncStatus {
    inSync: boolean;
    database: {
        count: number;
    };
    elasticsearch: {
        count: number;
        exists: boolean;
    };
    difference: number;
    status: 'synced' | 'out-of-sync';
    message: string;
}

export interface ResetResult {
    success: boolean;
    message: string;
    dryRun?: boolean;
}

export interface ReindexResult {
    success: boolean;
    indexed: number;
    errors: number;
    duration: string;
    dryRun: boolean;
}

export interface ResetAndReindexResult {
    success: boolean;
    deleted: boolean;
    created: boolean;
    indexed: number;
    errors: number;
    duration: string;
    dryRun: boolean;
}
