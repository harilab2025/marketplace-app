import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import axios, { AxiosError } from 'axios';
import { fetchUsers, type UserSearchParams } from '@/services/fetch/user.fetch';
interface ApiErrorResponse {
    message: string;
    status: string;
}
export type User = {
    publicId: string;
    email: string;
    name: string;
    role: 'SUPERADMIN' | 'PRODUCT_MANAGER' | 'CASHIER' | 'CUSTOMER';
    whatsappNumber: string | null;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
};

export type UsersState = {
    items: User[];
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc' | '';
    roleFilter: string[];
    isActiveFilter: string;
    emailVerifiedFilter: string;
    phoneVerifiedFilter: string;
    total: number;
    totalPages: number;
    isLoading: boolean;
    error?: string | null;
};

const initialState: UsersState = {
    items: [],
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    roleFilter: ['all'],
    isActiveFilter: 'all',
    emailVerifiedFilter: 'all',
    phoneVerifiedFilter: 'all',
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null,
};

// AbortController for cancelling previous requests
let abortController: AbortController | null = null;

export const fetchUsersThunk = createAsyncThunk(
    'users/fetchUsers',
    async (params: UserSearchParams | undefined, { getState, rejectWithValue, fulfillWithValue }) => {
        try {
            // Cancel previous request if exists
            if (abortController) {
                abortController.abort();
            }

            // Create new AbortController for this request
            abortController = new AbortController();

            const state = getState() as RootState;
            const page = params?.page ?? state.users.page;
            const limit = params?.limit ?? state.users.limit;
            const search = params?.query ?? state.users.search;
            const sortBy = params?.sortBy ?? state.users.sortBy;
            const sortOrder = params?.sortOrder ?? state.users.sortOrder;

            // Parse filters
            const role = params?.role ?? (state.users.roleFilter.includes('all') || state.users.roleFilter.length === 4 ? undefined : state.users.roleFilter);
            console.log('role s :', role);

            const isActive = params?.isActive ?? (state.users.isActiveFilter === 'all' ? undefined : state.users.isActiveFilter === 'true');
            const emailVerified = params?.emailVerified ?? (state.users.emailVerifiedFilter === 'all' ? undefined : state.users.emailVerifiedFilter === 'true');
            const phoneVerified = params?.phoneVerified ?? (state.users.phoneVerifiedFilter === 'all' ? undefined : state.users.phoneVerifiedFilter === 'true');

            const result = await fetchUsers({
                query: search,
                page,
                limit,
                sortBy,
                sortOrder,
                role,
                isActive,
                emailVerified,
                phoneVerified,
                signal: abortController.signal
            });

            return fulfillWithValue(result);

        } catch (error: unknown) {
            // Silently ignore aborted requests
            if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
                const state = getState() as RootState;
                return fulfillWithValue({
                    items: state.users.items,
                    page: state.users.page,
                    limit: state.users.limit,
                    total: state.users.total,
                    totalPages: state.users.totalPages,
                });
            }

            return rejectWithValue((error as AxiosError<ApiErrorResponse>)?.response?.data?.message || 'Failed to fetch users');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
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
        setRoleFilter: (state, action: PayloadAction<string[]>) => {
            state.roleFilter = action.payload;
            state.page = 1;
        },
        setIsActiveFilter: (state, action: PayloadAction<string>) => {
            state.isActiveFilter = action.payload;
            state.page = 1;
        },
        setEmailVerifiedFilter: (state, action: PayloadAction<string>) => {
            state.emailVerifiedFilter = action.payload;
            state.page = 1;
        },
        setPhoneVerifiedFilter: (state, action: PayloadAction<string>) => {
            state.phoneVerifiedFilter = action.payload;
            state.page = 1;
        },
        clearFilters: (state) => {
            state.search = '';
            state.roleFilter = ['all'];
            state.isActiveFilter = 'all';
            state.emailVerifiedFilter = 'all';
            state.phoneVerifiedFilter = 'all';
            state.page = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsersThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsersThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.data?.items || [];
                state.total = action.payload.pagination?.total || 0;
                state.totalPages = action.payload.pagination?.totalPages || 0;
                state.page = action.payload.pagination?.page || 1;
                state.limit = action.payload.pagination?.limit || 10;
            })
            .addCase(fetchUsersThunk.rejected, (state, action) => {
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
    setRoleFilter,
    setIsActiveFilter,
    setEmailVerifiedFilter,
    setPhoneVerifiedFilter,
    clearFilters,
} = usersSlice.actions;

// Selectors
export const selectUsers = (state: RootState) => state.users.items;
export const selectUsersLoading = (state: RootState) => state.users.isLoading;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectUsersPagination = createSelector(
    [(state: RootState) => state.users],
    (users) => ({
        page: users.page,
        limit: users.limit,
        total: users.total,
        totalPages: users.totalPages,
    })
);
export const selectUsersSearch = (state: RootState) => state.users.search;
export const selectUsersSorting = createSelector(
    [(state: RootState) => state.users],
    (users) => ({
        sortBy: users.sortBy,
        sortOrder: users.sortOrder,
    })
);
export const selectUsersFilters = createSelector(
    [(state: RootState) => state.users],
    (users) => ({
        roleFilter: users.roleFilter,
        isActiveFilter: users.isActiveFilter,
        emailVerifiedFilter: users.emailVerifiedFilter,
        phoneVerifiedFilter: users.phoneVerifiedFilter,
    })
);

export default usersSlice.reducer;
