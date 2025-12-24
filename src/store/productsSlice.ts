import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import axios from 'axios';
import { fetchProductsServer, searchProductsElasticsearch } from '@/services/fetch/product.fetch';

export type VerificationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'UNPUBLISHED';

export type Product = {
    publicId: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    isActive: boolean;
    updatedAt: string;
    verificationStatus?: VerificationStatus;
    rejectionReason?: string | null;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    publishedAt?: string | null;
    submittedBy?: {
        publicId: string;
        name: string;
        email?: string;
    } | null;
    reviewedBy?: {
        publicId: string;
        name: string;
        role?: string;
    } | null;
    category?: {
        publicId: string;
        name: string;
    };
    images?: string[];
    description?: string;
};

export type ProductsState = {
    items: Product[];
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc' | '';
    statusFilter: string[];
    verificationStatusFilter: VerificationStatus[];
    total: number;
    totalPages: number;
    isLoading: boolean;
    error?: string | null;
    // Elasticsearch filters
    useElasticsearch: boolean;
    categoryFilter?: string;
    minPrice?: number;
    maxPrice?: number;
    tagsFilter: string[];
};

const initialState: ProductsState = {
    items: [],
    page: 1,
    limit: 10,
    search: '',
    sortBy: '',
    sortOrder: '',
    statusFilter: ['all'],
    verificationStatusFilter: [],
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null,
    // Elasticsearch filters
    useElasticsearch: true, // Enable Elasticsearch by default
    categoryFilter: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    tagsFilter: []
};

// AbortController for cancelling previous requests
let abortController: AbortController | null = null;

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' | ''; statusFilter?: string[]; verificationStatusFilter?: VerificationStatus[] } | undefined, { getState, rejectWithValue, fulfillWithValue }) => {
        try {
            // Cancel previous request if exists
            if (abortController) {
                abortController.abort();
            }

            // Create new AbortController for this request
            abortController = new AbortController();

            const state = getState() as RootState;
            const page = params?.page ?? state.products.page;
            const limit = params?.limit ?? state.products.limit;
            const search = params?.search ?? state.products.search;
            const sortBy = params?.sortBy ?? state.products.sortBy;
            const sortOrder = params?.sortOrder ?? state.products.sortOrder;
            const statusFilter = params?.statusFilter ?? state.products.statusFilter;
            const verificationStatusFilter = params?.verificationStatusFilter ?? state.products.verificationStatusFilter;

            const result = await fetchProductsServer({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                statusFilter,
                verificationStatusFilter,
                signal: abortController.signal
            });

            return fulfillWithValue(result);

        } catch (error: unknown) {
            // Silently ignore aborted requests - don't trigger rejected state
            // Return current state data to avoid "rejected" action in Redux DevTools
            if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
                const state = getState() as RootState;
                return fulfillWithValue({
                    items: state.products.items,
                    page: state.products.page,
                    limit: state.products.limit,
                    total: state.products.total,
                });
            }

            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    return rejectWithValue('Request timeout - API tidak merespons');
                } else if (error.response) {
                    // Server responded with error status
                    const status = error.response.status;
                    const message = error.response.data?.message ||
                        error.response.data?.error ||
                        `Server error: ${status}`;
                    return rejectWithValue(message);
                } else if (error.request) {
                    // Network error
                    return rejectWithValue('Tidak dapat terhubung ke server API');
                }
            }

            const message = error instanceof Error ? error.message : 'Unknown error';
            return rejectWithValue(message);
        }
    }
);

// Elasticsearch search thunk
export const searchProductsES = createAsyncThunk(
    'products/searchProductsES',
    async (params: {
        query?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        tags?: string[];
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } | undefined, { getState, rejectWithValue, fulfillWithValue }) => {
        try {
            // Cancel previous request if exists
            if (abortController) {
                abortController.abort();
            }

            // Create new AbortController for this request
            abortController = new AbortController();

            const state = getState() as RootState;
            const query = params?.query ?? state.products.search;
            const category = params?.category ?? state.products.categoryFilter;
            const minPrice = params?.minPrice ?? state.products.minPrice;
            const maxPrice = params?.maxPrice ?? state.products.maxPrice;
            const tags = params?.tags ?? state.products.tagsFilter;
            const page = params?.page ?? state.products.page;
            const limit = params?.limit ?? state.products.limit;
            const sortBy = (params?.sortBy ?? state.products.sortBy) || '_score';
            const sortOrder = (params?.sortOrder ?? state.products.sortOrder) || 'desc';

            const result = await searchProductsElasticsearch({
                query,
                category,
                minPrice,
                maxPrice,
                tags,
                isActive: true,
                page,
                limit,
                sortBy,
                sortOrder,
                signal: abortController.signal
            });

            return fulfillWithValue(result.data);

        } catch (error: unknown) {
            // Silently ignore aborted requests
            if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
                const state = getState() as RootState;
                return fulfillWithValue({
                    items: state.products.items,
                    page: state.products.page,
                    limit: state.products.limit,
                    total: state.products.total,
                });
            }

            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    return rejectWithValue('Request timeout - Elasticsearch tidak merespons');
                } else if (error.response) {
                    const status = error.response.status;
                    const message = error.response.data?.message ||
                        error.response.data?.error ||
                        `Server error: ${status}`;
                    return rejectWithValue(message);
                } else if (error.request) {
                    return rejectWithValue('Tidak dapat terhubung ke server API');
                }
            }

            const message = error instanceof Error ? error.message : 'Unknown error';
            return rejectWithValue(message);
        }
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        setLimit(state, action: PayloadAction<number>) {
            state.limit = action.payload;
        },
        setSearch(state, action: PayloadAction<string>) {
            state.search = action.payload;
            state.page = 1; // Reset to first page when searching
        },
        setSorting(state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' | '' }>) {
            state.sortBy = action.payload.sortBy;
            state.sortOrder = action.payload.sortOrder;
        },
        setStatusFilter(state, action: PayloadAction<string[]>) {
            state.statusFilter = action.payload;
            state.page = 1; // Reset to first page when filtering
        },
        setVerificationStatusFilter(state, action: PayloadAction<VerificationStatus[]>) {
            state.verificationStatusFilter = action.payload;
            state.page = 1; // Reset to first page when filtering
        },
        // Elasticsearch-specific actions
        setUseElasticsearch(state, action: PayloadAction<boolean>) {
            state.useElasticsearch = action.payload;
        },
        setCategoryFilter(state, action: PayloadAction<string | undefined>) {
            state.categoryFilter = action.payload;
            state.page = 1; // Reset to first page when filtering
        },
        setPriceRange(state, action: PayloadAction<{ minPrice?: number; maxPrice?: number }>) {
            state.minPrice = action.payload.minPrice;
            state.maxPrice = action.payload.maxPrice;
            state.page = 1; // Reset to first page when filtering
        },
        setTagsFilter(state, action: PayloadAction<string[]>) {
            state.tagsFilter = action.payload;
            state.page = 1; // Reset to first page when filtering
        },
        clearFilters(state) {
            state.categoryFilter = undefined;
            state.minPrice = undefined;
            state.maxPrice = undefined;
            state.tagsFilter = [];
            state.page = 1;
        }
    },
    extraReducers: (builder) => {
        builder
            // Regular fetch products
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.total = action.payload.total;
                state.totalPages = Math.ceil(action.payload.total / action.payload.limit);
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) || 'Gagal memuat data';
            })
            // Elasticsearch search
            .addCase(searchProductsES.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchProductsES.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.total = action.payload.total;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(searchProductsES.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) || 'Gagal mencari produk';
            });
    }
});

export const {
    setPage,
    setLimit,
    setSearch,
    setSorting,
    setStatusFilter,
    setVerificationStatusFilter,
    setUseElasticsearch,
    setCategoryFilter,
    setPriceRange,
    setTagsFilter,
    clearFilters
} = productsSlice.actions;

export const selectProducts = (state: RootState) => state.products.items;
export const selectProductsSearch = (state: RootState) => state.products.search;
export const selectProductsSorting = createSelector(
    (state: RootState) => state.products.sortBy,
    (state: RootState) => state.products.sortOrder,
    (sortBy, sortOrder) => ({ sortBy, sortOrder })
);
export const selectProductsStatusFilter = (state: RootState) => state.products.statusFilter;
export const selectProductsVerificationStatusFilter = (state: RootState) => state.products.verificationStatusFilter;
export const selectProductsPagination = createSelector(
    (state: RootState) => state.products,
    (products) => ({
        page: products.page,
        limit: products.limit,
        total: products.total,
        totalPages: products.totalPages,
    })
);
export const selectProductsLoading = (state: RootState) => state.products.isLoading;
export const selectProductsError = (state: RootState) => state.products.error;

export default productsSlice.reducer;


