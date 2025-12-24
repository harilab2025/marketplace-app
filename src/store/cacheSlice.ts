import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from './index';
import {
    fetchCacheStats,
    clearUserCaches,
    clearProductCaches,
    clearOrderCaches,
    clearAllAppCaches,
    clearCacheByPattern,
    checkCacheHealth
} from '@/services/fetch/cache.fetch';

export type CacheStats = {
    totalKeys: number;
    keysByPattern: {
        pattern: string;
        count: number;
    }[];
    memoryUsage: string;
};

export type CacheState = {
    stats: CacheStats | null;
    isHealthy: boolean;
    isLoadingStats: boolean;
    isLoadingAction: boolean;
    error?: string | null;
    lastAction?: {
        type: string;
        deleted: number;
        timestamp: string;
    } | null;
};

const initialState: CacheState = {
    stats: null,
    isHealthy: false,
    isLoadingStats: false,
    isLoadingAction: false,
    error: null,
    lastAction: null
};

// Async Thunks
export const getCacheStats = createAsyncThunk(
    'cache/getCacheStats',
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchCacheStats();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cache stats');
        }
    }
);

export const checkHealth = createAsyncThunk(
    'cache/checkHealth',
    async (_, { rejectWithValue }) => {
        try {
            const data = await checkCacheHealth();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to check cache health');
        }
    }
);

export const clearUsers = createAsyncThunk(
    'cache/clearUsers',
    async (_, { rejectWithValue }) => {
        try {
            const data = await clearUserCaches();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear user caches');
        }
    }
);

export const clearProducts = createAsyncThunk(
    'cache/clearProducts',
    async (_, { rejectWithValue }) => {
        try {
            const data = await clearProductCaches();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear product caches');
        }
    }
);

export const clearOrders = createAsyncThunk(
    'cache/clearOrders',
    async (_, { rejectWithValue }) => {
        try {
            const data = await clearOrderCaches();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear order caches');
        }
    }
);

export const clearAll = createAsyncThunk(
    'cache/clearAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await clearAllAppCaches();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear all caches');
        }
    }
);

export const clearByPattern = createAsyncThunk(
    'cache/clearByPattern',
    async (pattern: string, { rejectWithValue }) => {
        try {
            const data = await clearCacheByPattern(pattern);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cache by pattern');
        }
    }
);

const cacheSlice = createSlice({
    name: 'cache',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearLastAction: (state) => {
            state.lastAction = null;
        }
    },
    extraReducers: (builder) => {
        // Get Cache Stats
        builder
            .addCase(getCacheStats.pending, (state) => {
                state.isLoadingStats = true;
                state.error = null;
            })
            .addCase(getCacheStats.fulfilled, (state, action) => {
                state.isLoadingStats = false;
                state.stats = action.payload.data;
            })
            .addCase(getCacheStats.rejected, (state, action) => {
                state.isLoadingStats = false;
                state.error = action.payload as string;
            });

        // Check Health
        builder
            .addCase(checkHealth.pending, (state) => {
                state.error = null;
            })
            .addCase(checkHealth.fulfilled, (state, action) => {
                state.isHealthy = action.payload.data.healthy;
            })
            .addCase(checkHealth.rejected, (state, action) => {
                state.isHealthy = false;
                state.error = action.payload as string;
            });

        // Clear Users
        builder
            .addCase(clearUsers.pending, (state) => {
                state.isLoadingAction = true;
                state.error = null;
            })
            .addCase(clearUsers.fulfilled, (state, action) => {
                state.isLoadingAction = false;
                state.lastAction = {
                    type: 'users',
                    deleted: action.payload.data.deleted,
                    timestamp: new Date().toISOString()
                };
            })
            .addCase(clearUsers.rejected, (state, action) => {
                state.isLoadingAction = false;
                state.error = action.payload as string;
            });

        // Clear Products
        builder
            .addCase(clearProducts.pending, (state) => {
                state.isLoadingAction = true;
                state.error = null;
            })
            .addCase(clearProducts.fulfilled, (state, action) => {
                state.isLoadingAction = false;
                state.lastAction = {
                    type: 'products',
                    deleted: action.payload.data.deleted,
                    timestamp: new Date().toISOString()
                };
            })
            .addCase(clearProducts.rejected, (state, action) => {
                state.isLoadingAction = false;
                state.error = action.payload as string;
            });

        // Clear Orders
        builder
            .addCase(clearOrders.pending, (state) => {
                state.isLoadingAction = true;
                state.error = null;
            })
            .addCase(clearOrders.fulfilled, (state, action) => {
                state.isLoadingAction = false;
                state.lastAction = {
                    type: 'orders',
                    deleted: action.payload.data.deleted,
                    timestamp: new Date().toISOString()
                };
            })
            .addCase(clearOrders.rejected, (state, action) => {
                state.isLoadingAction = false;
                state.error = action.payload as string;
            });

        // Clear All
        builder
            .addCase(clearAll.pending, (state) => {
                state.isLoadingAction = true;
                state.error = null;
            })
            .addCase(clearAll.fulfilled, (state, action) => {
                state.isLoadingAction = false;
                state.lastAction = {
                    type: 'all',
                    deleted: action.payload.data.deleted,
                    timestamp: new Date().toISOString()
                };
            })
            .addCase(clearAll.rejected, (state, action) => {
                state.isLoadingAction = false;
                state.error = action.payload as string;
            });

        // Clear By Pattern
        builder
            .addCase(clearByPattern.pending, (state) => {
                state.isLoadingAction = true;
                state.error = null;
            })
            .addCase(clearByPattern.fulfilled, (state, action) => {
                state.isLoadingAction = false;
                state.lastAction = {
                    type: 'pattern',
                    deleted: action.payload.data.deleted,
                    timestamp: new Date().toISOString()
                };
            })
            .addCase(clearByPattern.rejected, (state, action) => {
                state.isLoadingAction = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearLastAction } = cacheSlice.actions;

// Selectors
export const selectCacheStats = (state: RootState) => state.cache.stats;
export const selectIsHealthy = (state: RootState) => state.cache.isHealthy;
export const selectIsLoadingStats = (state: RootState) => state.cache.isLoadingStats;
export const selectIsLoadingAction = (state: RootState) => state.cache.isLoadingAction;
export const selectCacheError = (state: RootState) => state.cache.error;
export const selectLastAction = (state: RootState) => state.cache.lastAction;

export default cacheSlice.reducer;
