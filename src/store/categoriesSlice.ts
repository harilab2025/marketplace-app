import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import axios, { AxiosError } from 'axios';
import { fetchCategoriesServer } from '@/services/fetch/category.fetch';
interface ApiErrorResponse {
    message: string;
    status: string;
}
export type Category = {
    publicId: string;
    name: string;
    slug: string;
    isActive: boolean;
    updatedAt: string;
};

export type CategoriesState = {
    items: Category[];
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc' | '';
    total: number;
    totalPages: number;
    isLoading: boolean;
    error?: string | null;
};

const initialState: CategoriesState = {
    items: [],
    page: 1,
    limit: 10,
    search: '',
    sortBy: '',
    sortOrder: '',
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null
};

// AbortController for cancelling previous requests
let abortController: AbortController | null = null;

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (params: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' | '' } | undefined, { getState, rejectWithValue }) => {
        try {
            // Cancel previous request if exists
            if (abortController) {
                abortController.abort();
            }

            // Create new AbortController for this request
            abortController = new AbortController();

            const state = getState() as RootState;
            const page = params?.page ?? state.categories.page;
            const limit = params?.limit ?? state.categories.limit;
            const search = params?.search ?? state.categories.search;
            const sortBy = params?.sortBy ?? state.categories.sortBy;
            const sortOrder = params?.sortOrder ?? state.categories.sortOrder;

            return fetchCategoriesServer({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                signal: abortController.signal
            });

        } catch (error: unknown) {
            // Ignore aborted requests
            if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
                return rejectWithValue('Request cancelled');
            }

            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    return rejectWithValue('Request timeout - API tidak merespons');
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

            const message = (error as AxiosError<ApiErrorResponse>)?.response?.data?.message || 'Unknown error';
            return rejectWithValue(message);
        }
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.total = action.payload.total;
                state.totalPages = Math.ceil(action.payload.total / action.payload.limit);
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.isLoading = false;
                // Don't show error for cancelled requests
                if (action.payload !== 'Request cancelled') {
                    state.error = (action.payload as string) || 'Gagal memuat data';
                }
            });
    }
});

export const { setPage, setLimit, setSearch, setSorting } = categoriesSlice.actions;

// Selectors - using simple selectors for non-transforming cases
export const selectCategories = (state: RootState) => state.categories.items;

export const selectCategoriesLoading = (state: RootState) => state.categories.isLoading;

export const selectCategoriesError = (state: RootState) => state.categories.error;

export const selectCategoriesSearch = (state: RootState) => state.categories.search;

export const selectCategoriesSorting = createSelector(
    (state: RootState) => state.categories.sortBy,
    (state: RootState) => state.categories.sortOrder,
    (sortBy, sortOrder) => ({
        sortBy,
        sortOrder
    })
);

// Using createSelector only for computed/derived state to avoid recreating objects
export const selectCategoriesPagination = createSelector(
    (state: RootState) => state.categories.page,
    (state: RootState) => state.categories.limit,
    (state: RootState) => state.categories.total,
    (state: RootState) => state.categories.totalPages,
    (page, limit, total, totalPages) => ({
        page,
        limit,
        total,
        totalPages
    })
);

export default categoriesSlice.reducer;
