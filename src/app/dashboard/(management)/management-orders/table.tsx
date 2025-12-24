"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    fetchOrdersThunk,
    selectOrders,
    selectOrdersError,
    selectOrdersLoading,
    selectOrdersPagination,
    selectOrdersSearch,
    selectOrdersSorting,
    selectOrdersFilters,
    setLimit,
    setPage,
    setSearch,
    setSorting,
    setStatusFilter,
    setPaymentStatusFilter,
} from '@/store/ordersSlice';
import type { SortingState } from '@tanstack/react-table';
import type { Order, OrderStatus, PaymentStatus } from '@/store/ordersSlice';
import { Eye, Package, DollarSign, Calendar, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DataTable, DataTableColumnHeader, type FilterConfig } from '@/components/data-table';
import { getOrderSuggestions } from '@/services/fetch/order.fetch';
import ViewOrder from './view';

export default function ManagementOrdersTable() {
    const dispatch = useDispatch<AppDispatch>();
    const orders = useSelector(selectOrders);
    const isLoading = useSelector(selectOrdersLoading);
    const error = useSelector(selectOrdersError);
    const { page, limit, total, totalPages } = useSelector(selectOrdersPagination);
    const search = useSelector(selectOrdersSearch);
    const { sortBy, sortOrder } = useSelector(selectOrdersSorting);
    const { statusFilter, paymentStatusFilter } = useSelector(selectOrdersFilters);
    const [actionContent, setActionContent] = useState('table');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const router = useRouter();

    // Fetch orders on mount and when filters change
    useEffect(() => {
        dispatch(fetchOrdersThunk({ page, limit, query: search, sortBy, sortOrder }));
    }, [dispatch, page, limit, search, sortBy, sortOrder, statusFilter, paymentStatusFilter]);

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

    const handleStatusFilterChange = useCallback((filter: string | string[]) => {
        const filterArray = Array.isArray(filter) ? filter : [filter];
        dispatch(setStatusFilter(filterArray));
    }, [dispatch]);

    const handlePaymentStatusFilterChange = useCallback((filter: string | string[]) => {
        const filterArray = Array.isArray(filter) ? filter : [filter];
        dispatch(setPaymentStatusFilter(filterArray));
    }, [dispatch]);

    // Suggestion fetch function for DataTable
    const fetchOrderSuggestionsForTable = useCallback(async (query: string, signal: AbortSignal): Promise<string[]> => {
        try {
            const response = await getOrderSuggestions({ query, limit: 5, signal });
            if (response.status === 'success' && response.data.suggestions) {
                return response.data.suggestions;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch order suggestions:', error);
            return [];
        }
    }, []);

    const handleView = useCallback((orderId: string) => {
        setSelectedOrderId(orderId);
        setActionContent('view');
    }, []);

    const filters: FilterConfig[] = useMemo(() => [
        {
            label: 'Order Status',
            value: statusFilter,
            onChange: handleStatusFilterChange as (value: string | string[]) => void,
            multiSelect: true,
            options: [
                { label: 'Pending', value: 'PENDING', color: 'yellow' },
                { label: 'Paid', value: 'PAID', color: 'green' },
                { label: 'Processing', value: 'PROCESSING', color: 'blue' },
                { label: 'Ready to Ship', value: 'READY_TO_SHIP', color: 'purple' },
                { label: 'Shipped', value: 'SHIPPED', color: 'blue' },
                { label: 'Delivered', value: 'DELIVERED', color: 'green' },
                { label: 'Cancelled', value: 'CANCELLED', color: 'red' },
                { label: 'Refunded', value: 'REFUNDED', color: 'zinc' },
            ],
        },
        {
            label: 'Payment Status',
            value: paymentStatusFilter,
            onChange: handlePaymentStatusFilterChange as (value: string | string[]) => void,
            multiSelect: true,
            options: [
                { label: 'Pending', value: 'PENDING', color: 'yellow' },
                { label: 'Paid', value: 'PAID', color: 'green' },
                { label: 'Failed', value: 'FAILED', color: 'red' },
                { label: 'Refunded', value: 'REFUNDED', color: 'zinc' },
                { label: 'Partially Refunded', value: 'PARTIALLY_REFUNDED', color: 'zinc' },
            ],
        },
    ], [statusFilter, paymentStatusFilter, handleStatusFilterChange, handlePaymentStatusFilterChange]);

    const getStatusBadgeColor = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'PAID':
            case 'DELIVERED':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'PROCESSING':
            case 'SHIPPED':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'READY_TO_SHIP':
                return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'REFUNDED':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getPaymentStatusBadgeColor = (status: PaymentStatus) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700';
            case 'PAID':
                return 'bg-green-100 text-green-700';
            case 'FAILED':
                return 'bg-red-100 text-red-700';
            case 'REFUNDED':
            case 'PARTIALLY_REFUNDED':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const columns: ColumnDef<Order>[] = useMemo(() => [
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
            accessorKey: 'orderNumber',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Order #" sortable />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div>
                        <div className="font-medium">{row.original.orderNumber}</div>
                        <div className="text-xs text-gray-500">{row.original.itemCount} item(s)</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'userName',
            header: 'Customer',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.userName}</div>
                    <div className="text-xs text-gray-500">{row.original.userEmail}</div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Order Status',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(row.original.status)}`}>
                    {row.original.status.replace(/_/g, ' ')}
                </span>
            ),
        },
        {
            accessorKey: 'paymentStatus',
            header: 'Payment',
            cell: ({ row }) => (
                <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeColor(row.original.paymentStatus)}`}>
                        {row.original.paymentStatus.replace(/_/g, ' ')}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{row.original.paymentMethod}</div>
                </div>
            ),
        },
        {
            accessorKey: 'total',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Total" sortable />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{formatCurrency(row.original.total)}</span>
                </div>
            ),
        },
        {
            accessorKey: 'trackingNumber',
            header: 'Tracking',
            cell: ({ row }) => row.original.trackingNumber ? (
                <div className="flex items-center gap-1 text-sm">
                    <Truck className="h-4 w-4 text-blue-600" />
                    {row.original.trackingNumber}
                </div>
            ) : (
                <span className="text-gray-400 text-sm">-</span>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Order Date" sortable />
            ),
            cell: ({ row }) => {
                try {
                    const date = new Date(row.original.createdAt);
                    if (isNaN(date.getTime())) return '-';
                    return (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{date.toLocaleString('id-ID')}</span>
                        </div>
                    );
                } catch {
                    return '-';
                }
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const order = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(order.publicId)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
        },
    ], [page, limit, handleView]);

    return (
        <div className="w-full">
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap justify-between items-center gap-3 h-12">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h1 className="text-lg sm:text-xl font-semibold">
                            {actionContent === 'table' ? 'Orders Management' : actionContent === 'view' ? 'View Order' : ''}
                        </h1>
                    </div>
                    <div className='flex items-center gap-2 sm:gap-3 '>
                        {actionContent !== 'table' && (
                            <Button variant="outline" onClick={() => setActionContent('table')} className="w-full sm:w-auto">Back to Table</Button>
                        )}
                    </div>
                </div>
            </div>

            {actionContent === 'table' && (
                <DataTable
                    columns={columns}
                    data={orders}
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
                    searchPlaceholder="Type to search orders..."
                    onSearch={handleSearch}
                    useSearchSuggestion={true}
                    suggestionFetchFn={fetchOrderSuggestionsForTable}
                    onSuggestionSelect={handleSearch}
                    suggestionDebounceMs={300}
                    suggestionMinChars={2}
                    suggestionLimit={5}
                    // Filters
                    filters={filters}
                    // Loading
                    isLoading={isLoading}
                    loadingText="Loading orders..."
                    // Empty
                    emptyText="No orders found."
                    // Sticky columns (indices 0 and 1)
                    stickyColumns={[0, 1]}
                    // Pagination options
                    showPagination={true}
                    pageSizeOptions={[10, 20, 50]}
                    // Refresh
                    handleRefresh={() => {
                        dispatch(fetchOrdersThunk({ page, limit, query: search, sortBy, sortOrder }));
                    }}
                />
            )}

            {/* View Details */}
            {actionContent === 'view' && selectedOrderId && (
                <ViewOrder
                    setActionContent={setActionContent}
                    orderId={selectedOrderId}
                />
            )}
        </div>
    );
}
