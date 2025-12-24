"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    fetchUsersThunk,
    selectUsers,
    selectUsersError,
    selectUsersLoading,
    selectUsersPagination,
    selectUsersSearch,
    selectUsersSorting,
    selectUsersFilters,
    setLimit,
    setPage,
    setSearch,
    setSorting,
    setRoleFilter,
    setIsActiveFilter,
} from '@/store/usersSlice';
import type { SortingState } from '@tanstack/react-table';
import type { User } from '@/store/usersSlice';
import { Eye, Pencil, Trash2, UserCircle, Mail, Phone, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DataTable, DataTableColumnHeader, type FilterConfig } from '@/components/data-table';
import { apiClient } from '@/lib/axios';
import { useConfirm } from '@/context/dashboard/useConfirm';
import { getUserSuggestions } from '@/services/fetch/user.fetch';
import CreateUser from './create';
import EditUser from './edit';
import ViewUser from './view';

export default function ManagementUsersTable() {
    const dispatch = useDispatch<AppDispatch>();
    const users = useSelector(selectUsers);
    const isLoading = useSelector(selectUsersLoading);
    const error = useSelector(selectUsersError);
    const { page, limit, total, totalPages } = useSelector(selectUsersPagination);
    const search = useSelector(selectUsersSearch);
    const { sortBy, sortOrder } = useSelector(selectUsersSorting);
    const { roleFilter, isActiveFilter } = useSelector(selectUsersFilters);
    const [actionContent, setActionContent] = useState('table');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const { confirm } = useConfirm();
    const router = useRouter();
    // Fetch users on mount and when filters change
    useEffect(() => {
        dispatch(fetchUsersThunk({ page, limit, query: search, sortBy, sortOrder }));
    }, [dispatch, page, limit, search, sortBy, sortOrder, roleFilter, isActiveFilter]);

    // Error handling
    useEffect(() => {
        if (error) {
            toast.error(error);
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        }
    }, [error, router]);

    const handlePageChange = useCallback((newPage: number) => {
        dispatch(setPage(newPage));
    }, [dispatch]);

    const handlePageSizeChange = useCallback((newLimit: number) => {
        dispatch(setLimit(newLimit));
        dispatch(setPage(1));
    }, [dispatch]);

    const handleSearch = useCallback((value: string) => {
        dispatch(setSearch(value));
    }, [dispatch]);

    const handleSortingChange = useCallback((sorting: SortingState) => {
        if (sorting.length > 0) {
            const { id, desc } = sorting[0];
            dispatch(setSorting({
                sortBy: id,
                sortOrder: desc ? 'desc' : 'asc'
            }));
        } else {
            dispatch(setSorting({
                sortBy: '',
                sortOrder: ''
            }));
        }
    }, [dispatch]);

    const handleRoleFilterChange = useCallback((filter: string | string[]) => {
        const filterArray = Array.isArray(filter) ? filter : [filter];
        console.log('filter', filterArray);
        dispatch(setRoleFilter(filterArray));
    }, [dispatch]);

    const handleIsActiveFilterChange = useCallback((filter: string | string[]) => {
        const value = Array.isArray(filter) ? filter[0] : filter;
        dispatch(setIsActiveFilter(value));
    }, [dispatch]);

    // Suggestion fetch function for DataTable
    const fetchUserSuggestionsForTable = useCallback(async (query: string, signal: AbortSignal): Promise<string[]> => {
        try {
            const response = await getUserSuggestions({ query, limit: 5, signal });
            if (response.status === 'success' && response.data.suggestions) {
                return response.data.suggestions;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch user suggestions:', error);
            return [];
        }
    }, []);

    const handleRefresh = useCallback(() => {
        dispatch(fetchUsersThunk({ page, limit, query: search, sortBy, sortOrder }));
    }, [dispatch, page, limit, search, sortBy, sortOrder]);

    const handleView = useCallback((userId: string) => {
        setSelectedUserId(userId);
        setActionContent('view');
    }, []);

    const handleEdit = useCallback((userId: string) => {
        setSelectedUserId(userId);
        setActionContent('edit');
    }, []);

    const handleDelete = useCallback(async (userId: string) => {
        await confirm({
            title: "Confirm deletion",
            description: "Are you sure you want to delete this user? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/users/${userId}`);
                    toast.success('User deleted successfully');
                    dispatch(fetchUsersThunk({ page, limit, query: search, sortBy, sortOrder }));
                } catch (error: unknown) {
                    const message = error instanceof Error && 'response' in error
                        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                        : 'Failed to delete user';
                    toast.error(message || 'Failed to delete user');
                }
            },
        });
    }, [confirm, dispatch, page, limit, search, sortBy, sortOrder]);

    const filters: FilterConfig[] = useMemo(() => [
        {
            label: 'Role',
            value: roleFilter,
            onChange: handleRoleFilterChange as (value: string | string[]) => void,
            multiSelect: true,
            options: [
                { label: 'Super Admin', value: 'SUPERADMIN', color: 'purple' },
                { label: 'Product Manager', value: 'PRODUCT_MANAGER', color: 'blue' },
                { label: 'Cashier', value: 'CASHIER', color: 'green' },
                { label: 'Customer', value: 'CUSTOMER', color: 'zinc' },
            ],
        },
        {
            label: 'Status',
            value: isActiveFilter,
            onChange: handleIsActiveFilterChange as (value: string | string[]) => void,
            multiSelect: false,
            options: [
                { label: 'All Status', value: 'all', color: 'zinc' },
                { label: 'Active', value: 'true', color: 'green' },
                { label: 'Inactive', value: 'false', color: 'red' },
            ],
        },
    ], [roleFilter, isActiveFilter, handleRoleFilterChange, handleIsActiveFilterChange]);

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'PRODUCT_MANAGER':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'CASHIER':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'CUSTOMER':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'Super Admin';
            case 'PRODUCT_MANAGER':
                return 'Product Manager';
            case 'CASHIER':
                return 'Cashier';
            case 'CUSTOMER':
                return 'Customer';
            default:
                return role;
        }
    };

    const columns: ColumnDef<User>[] = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'No',
            cell: ({ row }) => {
                const rowNumber = ((page - 1) * limit) + row.index + 1;
                return <div className="text-center">{rowNumber}</div>;
            },
            enableSorting: false,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" sortable />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                    <div>
                        <div className="font-medium">{row.original.name}</div>
                        <div className="text-xs text-gray-500">{row.original.email}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(row.original.role)}`}>
                    <Shield className="h-3 w-3" />
                    {getRoleLabel(row.original.role)}
                </span>
            ),
        },
        {
            accessorKey: 'whatsappNumber',
            header: 'WhatsApp',
            cell: ({ row }) => row.original.whatsappNumber ? (
                <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-4 w-4 text-green-600" />
                    {row.original.whatsappNumber}
                </div>
            ) : (
                <span className="text-gray-400 text-sm">-</span>
            ),
        },
        {
            accessorKey: 'emailVerified',
            header: 'Verified',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className={`text-xs ${row.original.emailVerified ? 'text-green-600' : 'text-gray-400'}`}>
                            {row.original.emailVerified ? 'Email ✓' : 'Email ✗'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span className={`text-xs ${row.original.phoneVerified ? 'text-green-600' : 'text-gray-400'}`}>
                            {row.original.phoneVerified ? 'Phone ✓' : 'Phone ✗'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created At" sortable />
            ),
            cell: ({ row }) => {
                try {
                    const date = new Date(row.original.createdAt);
                    if (isNaN(date.getTime())) return '-';
                    return date.toLocaleString('id-ID');
                } catch {
                    return '-';
                }
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(user.publicId)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user.publicId)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.publicId)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
        },
    ], [page, limit, handleView, handleEdit, handleDelete]);

    return (
        <div className="w-full">
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap justify-between items-center gap-3 h-12">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h1 className="text-lg sm:text-xl font-semibold">
                            {actionContent === 'table' ? 'Users Management' : actionContent === 'create' ? 'Create User' : actionContent === 'edit' ? 'Edit User' : actionContent === 'view' ? 'View User' : ''}
                        </h1>
                    </div>
                    <div className='flex items-center gap-2 sm:gap-3'>
                        {actionContent === 'table' ? (
                            <Button onClick={() => setActionContent('create')} className="w-full sm:w-auto">Create User</Button>
                        ) : (
                            <Button variant="outline" onClick={() => setActionContent('table')} className="w-full sm:w-auto">Back to Table</Button>
                        )}
                    </div>
                </div>
            </div>

            {actionContent === 'table' && (
                <DataTable
                    columns={columns}
                    data={users || []}
                    // Pagination
                    currentPage={page}
                    pageSize={limit}
                    totalPages={totalPages}
                    totalItems={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    manualPagination={true}
                    // Sorting
                    manualSorting={true}
                    onSortingChange={handleSortingChange}
                    // Search with suggestions
                    searchable={true}
                    searchPlaceholder="Type to search users..."
                    onSearch={handleSearch}
                    useSearchSuggestion={true}
                    suggestionFetchFn={fetchUserSuggestionsForTable}
                    onSuggestionSelect={handleSearch}
                    suggestionDebounceMs={300}
                    suggestionMinChars={2}
                    suggestionLimit={5}
                    // Filters
                    filters={filters}
                    // Loading
                    isLoading={isLoading}
                    loadingText="Loading users..."
                    // Empty
                    emptyText="No users found."
                    // Sticky columns (indices 0 and 1)
                    stickyColumns={[0, 1]}
                    // Pagination options
                    showPagination={true}
                    pageSizeOptions={[10, 20, 50]}
                    // Refresh
                    handleRefresh={handleRefresh}
                />
            )}

            {/* Create View */}
            {actionContent === 'create' && (
                <CreateUser setActionContent={setActionContent} onSuccess={handleRefresh} />
            )}

            {/* Edit View */}
            {actionContent === 'edit' && selectedUserId && (
                <EditUser
                    setActionContent={setActionContent}
                    userId={selectedUserId}
                    onSuccess={handleRefresh}
                />
            )}

            {/* View Details */}
            {actionContent === 'view' && selectedUserId && (
                <ViewUser
                    setActionContent={setActionContent}
                    userId={selectedUserId}
                />
            )}
        </div>
    );
}
