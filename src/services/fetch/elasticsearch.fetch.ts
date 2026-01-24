import axiosInstance from "@/lib/axiosInstance";

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
    try {
        const res = await axiosInstance.get(`/elasticsearch/health`, {
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
            data: { status: 'red', clusterName: '', numberOfNodes: 0, isHealthy: false },
            message: error instanceof Error ? error.message : 'Failed to fetch cluster health'
        };
    }
}

/**
 * Get all indices statistics
 * @returns Total documents and size across all indices
 */
export async function getAllIndicesStats(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.get(`/elasticsearch/stats`, {
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
            data: { total: { documents: 0, size: 0, sizeInMB: '0' }, indices: {} },
            message: error instanceof Error ? error.message : 'Failed to fetch indices stats'
        };
    }
}

/**
 * Get products index statistics
 * @returns Products index documents count, size, search/indexing metrics
 */
export async function getProductsIndexStats(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.get(`/elasticsearch/products/stats`, {
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
            data: { exists: false, documents: 0, deleted: 0, sizeInBytes: 0, sizeInMB: '0', indexingTotal: 0, searchTotal: 0 },
            message: error instanceof Error ? error.message : 'Failed to fetch products index stats'
        };
    }
}

/**
 * Check sync status between Database and Elasticsearch
 * @returns Sync status with database vs elasticsearch counts
 */
export async function checkSyncStatus(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.get(`/elasticsearch/products/sync-check`, {
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
            data: {
                inSync: false,
                database: { count: 0 },
                elasticsearch: { count: 0, exists: false },
                difference: 0,
                status: 'out-of-sync',
                message: 'Failed to check sync status'
            },
            message: error instanceof Error ? error.message : 'Failed to check products sync status'
        };
    }
}

// ============================================================================
// MANAGEMENT ENDPOINTS (DESTRUCTIVE OPERATIONS)
// ============================================================================

/**
 * Delete products index (DESTRUCTIVE)
 * WARNING: Deletes index without reindexing
 */
export async function deleteProductsIndex(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.delete(`/elasticsearch/products`, {
            timeout: 30000,
            signal,
        });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { success: false },
            message: error instanceof Error ? error.message : 'Failed to delete products index'
        };
    }
}

/**
 * Reset products index (DESTRUCTIVE)
 * Deletes and recreates index (empty)
 */
export async function resetProductsIndex(dryRun: boolean = true, signal?: AbortSignal) {
    try {
        const res = await axiosInstance.post(
            `/elasticsearch/products/reset`,
            { dryRun },
            {
                timeout: 30000,
                signal,
            }
        );
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { success: false, dryRun },
            message: error instanceof Error ? error.message : 'Failed to reset products index'
        };
    }
}

/**
 * Reindex all products from database to Elasticsearch
 * Does not delete index, just reindexes data
 */
export async function reindexProducts(dryRun: boolean = true, signal?: AbortSignal) {
    try {
        const res = await axiosInstance.post(
            `/elasticsearch/products/reindex`,
            { dryRun },
            {
                timeout: 60000,
                signal,
            }
        );
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { success: false, indexed: 0, errors: 0, duration: '0ms', dryRun },
            message: error instanceof Error ? error.message : 'Failed to reindex products'
        };
    }
}

/**
 * Reset and reindex products (RECOMMENDED)
 * Full refresh: Delete, recreate, and reindex all data
 */
export async function resetAndReindexProducts(dryRun: boolean = true, signal?: AbortSignal) {
    try {
        const res = await axiosInstance.post(
            `/elasticsearch/products/reset-and-reindex`,
            { dryRun },
            {
                timeout: 90000,
                signal,
            }
        );
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { success: false, deleted: false, created: false, indexed: 0, errors: 0, duration: '0ms', dryRun },
            message: error instanceof Error ? error.message : 'Failed to reset and reindex products'
        };
    }
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

// ============================================================================
// USERS ELASTICSEARCH ENDPOINTS
// ============================================================================

/**
 * Get users index statistics
 * @returns Users index documents count, size, search/indexing metrics
 */
export async function getUsersIndexStats(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.get(`/elasticsearch/users/stats`, {
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
            data: { exists: false, documents: 0, deleted: 0, sizeInBytes: 0, sizeInMB: '0', indexingTotal: 0, searchTotal: 0 },
            message: error instanceof Error ? error.message : 'Failed to fetch users index stats'
        };
    }
}

/**
 * Check sync status between Database and Elasticsearch for users
 * @returns Sync status with database vs elasticsearch counts
 */
export async function checkUsersSyncStatus(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.get(`/elasticsearch/users/sync-check`, {
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
            data: {
                inSync: false,
                database: { count: 0 },
                elasticsearch: { count: 0, exists: false },
                difference: 0,
                status: 'out-of-sync',
                message: 'Failed to check sync status'
            },
            message: error instanceof Error ? error.message : 'Failed to check users sync status'
        };
    }
}

/**
 * Delete users index (DESTRUCTIVE)
 * WARNING: Deletes index without reindexing
 */
export async function deleteUsersIndex(signal?: AbortSignal) {
    try {
        const res = await axiosInstance.delete(`/elasticsearch/users`, {
            timeout: 30000,
            signal,
        });
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { success: false },
            message: error instanceof Error ? error.message : 'Failed to delete users index'
        };
    }
}

/**
 * Reset users index (DESTRUCTIVE)
 * Deletes and recreates index (empty)
 */
export async function resetUsersIndex(dryRun: boolean = true, signal?: AbortSignal) {
    try {
        const res = await axiosInstance.post(
            `/elasticsearch/users/reset`,
            { dryRun },
            {
                timeout: 30000,
                signal,
            }
        );
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { success: false, dryRun },
            message: error instanceof Error ? error.message : 'Failed to reset users index'
        };
    }
}

/**
 * Reindex all users from database to Elasticsearch
 * Does not delete index, just reindexes data
 */
export async function reindexUsers(dryRun: boolean = true, signal?: AbortSignal) {
    try {
        const res = await axiosInstance.post(
            `/elasticsearch/users/reindex`,
            { dryRun },
            {
                timeout: 60000,
                signal,
            }
        );
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { success: false, indexed: 0, errors: 0, duration: '0ms', dryRun },
            message: error instanceof Error ? error.message : 'Failed to reindex users'
        };
    }
}

/**
 * Reset and reindex users (RECOMMENDED)
 * Full refresh: Delete, recreate, and reindex all data
 */
export async function resetAndReindexUsers(dryRun: boolean = true, signal?: AbortSignal) {
    try {
        const res = await axiosInstance.post(
            `/elasticsearch/users/reset-and-reindex`,
            { dryRun },
            {
                timeout: 90000,
                signal,
            }
        );
        return res.data;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') {
            throw error;
        }
        return {
            status: 'error',
            data: { success: false, deleted: false, created: false, indexed: 0, errors: 0, duration: '0ms', dryRun },
            message: error instanceof Error ? error.message : 'Failed to reset and reindex users'
        };
    }
}

// ============================================================================
// USERS TYPE DEFINITIONS
// ============================================================================

export interface UsersIndexStats {
    exists: boolean;
    documents: number;
    deleted: number;
    sizeInBytes: number;
    sizeInMB: string;
    indexingTotal: number;
    searchTotal: number;
}

export interface UsersSyncStatus {
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
