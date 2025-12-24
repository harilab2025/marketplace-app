import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import axios, { AxiosError } from 'axios';
import { fetchOrders, type OrderSearchParams } from '@/services/fetch/order.fetch';

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
interface ApiErrorResponse {
    message: string;
    status: string;
}
export type Order = {
    publicId: string;
    orderNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    trackingNumber: string | null;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
};

export type OrdersState = {
    items: Order[];
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc' | '';
    statusFilter: string[];
    paymentStatusFilter: string[];
    dateRangeFilter: {
        startDate: string;
        endDate: string;
    };
    total: number;
    totalPages: number;
    isLoading: boolean;
    error?: string | null;
};

const initialState: OrdersState = {
    items: [],
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    statusFilter: ['all'],
    paymentStatusFilter: ['all'],
    dateRangeFilter: {
        startDate: '',
        endDate: '',
    },
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null,
};

// AbortController for cancelling previous requests
let abortController: AbortController | null = null;

export const fetchOrdersThunk = createAsyncThunk(
    'orders/fetchOrders',
    async (params: OrderSearchParams | undefined, { getState, rejectWithValue, fulfillWithValue }) => {
        try {
            // Cancel previous request if exists
            if (abortController) {
                abortController.abort();
            }

            // Create new AbortController for this request
            abortController = new AbortController();

            const state = getState() as RootState;
            const page = params?.page ?? state.orders.page;
            const limit = params?.limit ?? state.orders.limit;
            const search = params?.query ?? state.orders.search;
            const sortBy = params?.sortBy ?? state.orders.sortBy;
            const sortOrder = params?.sortOrder ?? state.orders.sortOrder;

            // Parse filters
            const status = params?.status ?? (state.orders.statusFilter.includes('all') ? undefined : state.orders.statusFilter[0]);
            const paymentStatus = params?.paymentStatus ?? (state.orders.paymentStatusFilter.includes('all') ? undefined : state.orders.paymentStatusFilter[0]);
            const startDate = params?.startDate ?? state.orders.dateRangeFilter.startDate;
            const endDate = params?.endDate ?? state.orders.dateRangeFilter.endDate;

            const result = await fetchOrders({
                query: search,
                page,
                limit,
                sortBy,
                sortOrder,
                status,
                paymentStatus,
                startDate,
                endDate,
                signal: abortController.signal
            });

            return fulfillWithValue(result);

        } catch (error: unknown) {
            // Silently ignore aborted requests
            if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
                const state = getState() as RootState;
                return fulfillWithValue({
                    items: state.orders.items,
                    page: state.orders.page,
                    limit: state.orders.limit,
                    total: state.orders.total,
                    totalPages: state.orders.totalPages,
                });
            }
            return rejectWithValue((error as AxiosError<ApiErrorResponse>)?.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload;
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
            state.page = 1;
        },
        setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' | '' }>) => {
            state.sortBy = action.payload.sortBy;
            state.sortOrder = action.payload.sortOrder;
        },
        setStatusFilter: (state, action: PayloadAction<string[]>) => {
            state.statusFilter = action.payload;
            state.page = 1;
        },
        setPaymentStatusFilter: (state, action: PayloadAction<string[]>) => {
            state.paymentStatusFilter = action.payload;
            state.page = 1;
        },
        setDateRangeFilter: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
            state.dateRangeFilter = action.payload;
            state.page = 1;
        },
        clearFilters: (state) => {
            state.search = '';
            state.statusFilter = ['all'];
            state.paymentStatusFilter = ['all'];
            state.dateRangeFilter = {
                startDate: '',
                endDate: '',
            };
            state.page = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrdersThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.data || [];
                state.total = action.payload.pagination?.total || 0;
                state.totalPages = action.payload.pagination?.totalPages || 0;
                state.page = action.payload.pagination?.page || 1;
                state.limit = action.payload.pagination?.limit || 10;
            })
            .addCase(fetchOrdersThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setPage,
    setLimit,
    setSearch,
    setSorting,
    setStatusFilter,
    setPaymentStatusFilter,
    setDateRangeFilter,
    clearFilters,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state: RootState) => state.orders.items;
export const selectOrdersLoading = (state: RootState) => state.orders.isLoading;
export const selectOrdersError = (state: RootState) => state.orders.error;
export const selectOrdersPagination = createSelector(
    [(state: RootState) => state.orders],
    (orders) => ({
        page: orders.page,
        limit: orders.limit,
        total: orders.total,
        totalPages: orders.totalPages,
    })
);
export const selectOrdersSearch = (state: RootState) => state.orders.search;
export const selectOrdersSorting = createSelector(
    [(state: RootState) => state.orders],
    (orders) => ({
        sortBy: orders.sortBy,
        sortOrder: orders.sortOrder,
    })
);
export const selectOrdersFilters = createSelector(
    [(state: RootState) => state.orders],
    (orders) => ({
        statusFilter: orders.statusFilter,
        paymentStatusFilter: orders.paymentStatusFilter,
        dateRangeFilter: orders.dateRangeFilter,
    })
);

export default ordersSlice.reducer;
