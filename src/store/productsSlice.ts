import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import axios from 'axios';
import { fetchProductsServer } from '@/services/fetch/product.fetch';

export type Product = {
    productId: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    isActive: boolean;
    updatedAt: string;
};

export type ProductsState = {
    items: Product[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    isLoading: boolean;
    error?: string | null;
};

const initialState: ProductsState = {
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null
};

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params: { page?: number; limit?: number } | undefined, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const page = params?.page ?? state.products.page;
            const limit = params?.limit ?? state.products.limit;

            return fetchProductsServer({ page, limit });

        } catch (error: unknown) {
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

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        setLimit(state, action: PayloadAction<number>) {
            state.limit = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
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
            });
    }
});

export const { setPage, setLimit } = productsSlice.actions;

export const selectProducts = (state: RootState) => state.products.items;
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


