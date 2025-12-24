"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    fetchProducts,
    searchProductsES,
    selectProducts,
    selectProductsError,
    selectProductsLoading,
    selectProductsPagination,
    selectProductsSearch,
    selectProductsSorting,
    selectProductsStatusFilter,
    selectProductsVerificationStatusFilter,
    setLimit,
    setPage,
    setSearch,
    setSorting,
    setStatusFilter,
    setVerificationStatusFilter
} from '@/store/productsSlice';
import type { SortingState } from '@tanstack/react-table';
import type { Product, VerificationStatus } from '@/store/productsSlice';
import { Eye, Pencil, Trash2, History } from 'lucide-react';
import Create from './create';
import Edit from './edit';
import View from './view';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DataTable, DataTableColumnHeader, type FilterConfig } from '@/components/data-table';
import { apiClient } from '@/lib/axios';
import { useConfirm } from '@/context/dashboard/useConfirm';
import { getProductSuggestions } from '@/services/fetch/product.fetch';
import ProductStatusBadge from '@/components/product/ProductStatusBadge';
import VerificationActionButtons from '@/components/product/VerificationActionButtons';
import ProductHistoryViewer from '@/components/product/ProductHistoryViewer';
import RejectProductModal from '@/components/product/RejectProductModal';
import { useSession } from 'next-auth/react';
import { useDebounce } from '@/hooks/useDebounce';

export default function ManagementProductsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const products = useSelector(selectProducts);
    const isLoading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);
    const { page, limit, total, totalPages } = useSelector(selectProductsPagination);
    const search = useSelector(selectProductsSearch);
    const { sortBy, sortOrder } = useSelector(selectProductsSorting);
    const statusFilter = useSelector(selectProductsStatusFilter);
    const verificationStatusFilter = useSelector(selectProductsVerificationStatusFilter);

    // UI State
    const [actionContent, setActionContent] = useState('table');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [showHistoryViewer, setShowHistoryViewer] = useState(false);
    const [historyProductId, setHistoryProductId] = useState<string>('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectProduct, setRejectProduct] = useState<Product | null>(null);

    const { confirm } = useConfirm();
    const router = useRouter();
    const { data: session } = useSession();

    // 🚀 OPTIMIZATION 1: Debounced search (500ms delay to reduce API calls)
    const debouncedSearch = useDebounce(search, 500);

    // 🚀 OPTIMIZATION 2: Track if initial load is done to prevent double fetching
    const isInitialMount = useRef(true);

    // 🚀 OPTIMIZATION 3: Memoized query complexity analyzer
    const analyzeQueryComplexity = useMemo(() => {
        return (query: string) => {
            if (!query || query.trim().length < 2) {
                return { method: 'database', reason: 'empty_or_short' };
            }

            const trimmed = query.trim();
            const length = trimmed.length;
            const hasMultipleWords = trimmed.split(/\s+/).length > 1;
            const isExactMatch = /^".*"$/.test(trimmed);

            // Exact match query - better in Database
            if (isExactMatch) {
                return {
                    method: 'database',
                    reason: 'exact_match',
                    query: trimmed.replace(/"/g, '')
                };
            }

            // Multi-word search - Elasticsearch (better relevance)
            if (hasMultipleWords && length > 5) {
                return { method: 'elasticsearch', reason: 'multi_word' };
            }

            // Long query - Elasticsearch
            if (length > 10) {
                return { method: 'elasticsearch', reason: 'long_query' };
            }

            // Medium query - Elasticsearch
            if (length > 2) {
                return { method: 'elasticsearch', reason: 'standard_search' };
            }

            // Short query - Database
            return { method: 'database', reason: 'short_query' };
        };
    }, []);

    // 🚀 OPTIMIZATION 4: Memoized fetch function with fallback
    const fetchDataWithFallback = useCallback(async () => {
        const analysis = analyzeQueryComplexity(debouncedSearch);

        console.log(`🎯 Query Analysis:`, {
            query: debouncedSearch,
            method: analysis.method,
            reason: analysis.reason
        });

        try {
            if (analysis.method === 'elasticsearch') {
                // TRY ELASTICSEARCH FIRST
                console.log('🔍 Trying Elasticsearch search...');
                await dispatch(searchProductsES({
                    query: debouncedSearch,
                    page,
                    limit,
                    sortBy: sortBy || '_score',
                    sortOrder: sortOrder || 'desc'
                })).unwrap();
                console.log('✅ Elasticsearch success');
            } else {
                // USE DATABASE
                console.log('📊 Using Database query...');
                await dispatch(fetchProducts({
                    page,
                    limit,
                    search: debouncedSearch,
                    sortBy,
                    sortOrder,
                    statusFilter,
                    verificationStatusFilter
                })).unwrap();
                console.log('✅ Database success');
            }
        } catch (error) {
            // FALLBACK MECHANISM
            if (analysis.method === 'elasticsearch') {
                console.warn('⚠️ Elasticsearch failed, falling back to Database', error);
                toast.warning('Search engine unavailable, using database search');

                try {
                    await dispatch(fetchProducts({
                        page,
                        limit,
                        search: debouncedSearch,
                        sortBy,
                        sortOrder,
                        statusFilter,
                        verificationStatusFilter
                    })).unwrap();
                    console.log('✅ Database fallback success');
                } catch (dbError) {
                    console.error('❌ Both methods failed', dbError);
                    toast.error('Failed to fetch products');
                }
            } else {
                console.error('❌ Database query failed', error);
                toast.error('Failed to fetch products');
            }
        }
    }, [dispatch, page, limit, debouncedSearch, sortBy, sortOrder, statusFilter, verificationStatusFilter, analyzeQueryComplexity]);

    // 🚀 OPTIMIZATION 5: Single optimized useEffect with debounced search
    useEffect(() => {
        // Skip initial mount to prevent double fetching
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchDataWithFallback();
            return;
        }

        fetchDataWithFallback();
    }, [fetchDataWithFallback]);

    // Error handling effect
    useEffect(() => {
        if (error) {
            toast.error(error);
            const timer = setTimeout(() => {
                router.refresh();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, router]);

    // 🚀 OPTIMIZATION 6: Memoized callbacks with minimal dependencies
    const handlePageChange = useCallback((newPage: number) => {
        dispatch(setPage(newPage));
    }, [dispatch]);

    const handlePageSizeChange = useCallback((newLimit: number) => {
        dispatch(setLimit(newLimit));
        dispatch(setPage(1));
    }, [dispatch]);

    const handleSearch = useCallback((value: string) => {
        dispatch(setSearch(value));
        dispatch(setPage(1)); // Reset to page 1 on search
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
        dispatch(setPage(1)); // Reset to page 1 on filter change
    }, [dispatch]);

    const handleVerificationStatusFilterChange = useCallback((filter: string | string[]) => {
        const filterArray = Array.isArray(filter) ? filter : [filter];
        dispatch(setVerificationStatusFilter(filterArray as VerificationStatus[]));
        dispatch(setPage(1)); // Reset to page 1 on filter change
    }, [dispatch]);

    // 🚀 OPTIMIZATION 7: Memoized suggestion fetch with AbortController
    const fetchProductSuggestionsForTable = useCallback(async (query: string, signal: AbortSignal): Promise<string[]> => {
        try {
            const response = await getProductSuggestions({ query, limit: 5, signal });
            if (response.status === 'success' && response.data.suggestions) {
                return response.data.suggestions;
            }
            return [];
        } catch (error) {
            // Silently ignore aborted requests
            if (error instanceof Error && error.name === 'AbortError') {
                return [];
            }
            console.error('Failed to fetch product suggestions:', error);
            return [];
        }
    }, []);

    const handleRefresh = useCallback(() => {
        fetchDataWithFallback();
    }, [fetchDataWithFallback]);

    const handleView = useCallback((productId: string) => {
        setSelectedProductId(productId);
        setActionContent('view');
    }, []);

    const handleEdit = useCallback((productId: string) => {
        setSelectedProductId(productId);
        setActionContent('edit');
    }, []);

    const handleDelete = useCallback(async (productId: string) => {
        await confirm({
            title: "Confirm deletion",
            description: "Are you sure you want to delete this product? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/products/${productId}`);
                    toast.success('Product deleted successfully');
                    handleRefresh();
                } catch (error: unknown) {
                    const message = error instanceof Error && 'response' in error
                        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                        : 'Failed to delete product';
                    toast.error(message || 'Failed to delete product');
                }
            },
        });
    }, [confirm, handleRefresh]);

    // 🚀 OPTIMIZATION 8: Memoized filters config
    const filters: FilterConfig[] = useMemo(() => [
        {
            label: 'Status',
            value: statusFilter,
            onChange: handleStatusFilterChange as (value: string | string[]) => void,
            multiSelect: true,
            options: [
                { label: 'Live', value: 'live', color: 'green', count: 0 },
                { label: 'Not Live', value: 'not-live', color: 'red', count: 0 },
                { label: 'Verification', value: 'verification', color: 'zinc', count: 0 },
            ],
        },
        {
            label: 'Verification',
            value: verificationStatusFilter,
            onChange: handleVerificationStatusFilterChange as (value: string | string[]) => void,
            multiSelect: true,
            options: [
                { label: 'Draft', value: 'DRAFT', color: 'zinc', count: 0 },
                { label: 'Pending', value: 'PENDING', color: 'yellow', count: 0 },
                { label: 'Approved', value: 'APPROVED', color: 'green', count: 0 },
                { label: 'Rejected', value: 'REJECTED', color: 'red', count: 0 },
                { label: 'Published', value: 'PUBLISHED', color: 'blue', count: 0 },
                { label: 'Unpublished', value: 'UNPUBLISHED', color: 'zinc', count: 0 },
            ],
        },
    ], [statusFilter, verificationStatusFilter, handleStatusFilterChange, handleVerificationStatusFilterChange]);

    // 🚀 OPTIMIZATION 9: Memoized columns with stable callbacks
    const columns: ColumnDef<Product>[] = useMemo(() => [
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
        },
        {
            accessorKey: 'sku',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="SKU" sortable />
            ),
        },
        {
            accessorKey: 'price',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Price" sortable />
            ),
            cell: ({ row }) => `Rp ${row.original.price?.toLocaleString('id-ID') || '-'}`,
        },
        {
            accessorKey: 'stock',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Stock" sortable />
            ),
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => (
                <span className={row.original.isActive === true ? 'text-green-600' : row.original.isActive === false ? 'text-red-600' : 'text-zinc-500'}>
                    {row.original.isActive === true ? 'Live' : row.original.isActive === false ? 'Not Live' : 'On Verification'}
                </span>
            ),
        },
        {
            accessorKey: 'verificationStatus',
            header: 'Verification',
            cell: ({ row }) => {
                if (!row.original.verificationStatus) return <span className="text-gray-400">-</span>;
                return <ProductStatusBadge status={row.original.verificationStatus} />;
            },
        },
        {
            accessorKey: 'updatedAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Updated" sortable />
            ),
            cell: ({ row }) => {
                try {
                    const date = new Date(row.original.updatedAt);
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
                const product = row.original;
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(product.publicId)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product.publicId)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.publicId)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            {product.verificationStatus && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setHistoryProductId(product.publicId);
                                        setShowHistoryViewer(true);
                                    }}
                                    className="text-gray-600 hover:text-gray-800"
                                    title="View History"
                                >
                                    <History className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {product.verificationStatus && (
                            <VerificationActionButtons
                                product={product}
                                userRole={session?.user?.role || 'CUSTOMER'}
                                onSuccess={handleRefresh}
                                onReject={() => {
                                    setRejectProduct(product);
                                    setShowRejectModal(true);
                                }}
                            />
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
    ], [page, limit, session, handleView, handleEdit, handleDelete, handleRefresh]);

    return (
        <div className="w-full">
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap justify-between items-center gap-3 h-12">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h1 className="text-lg sm:text-xl font-semibold">
                            {actionContent === 'table' ? 'Products' : actionContent === 'create' ? 'Create Product' : actionContent === 'edit' ? 'Edit Product' : actionContent === 'view' ? 'View Product' : ''}
                        </h1>
                    </div>
                    <div className='flex items-center gap-2 sm:gap-3'>
                        {actionContent === 'table' ? (
                            <Button onClick={() => setActionContent('create')} className="w-full sm:w-auto">Create</Button>
                        ) : (
                            <Button variant="outline" onClick={() => setActionContent('table')} className="w-full sm:w-auto">Back to Table</Button>
                        )}
                    </div>
                </div>
            </div>

            {actionContent === 'table' && (
                <DataTable
                    columns={columns}
                    data={products}
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
                    searchPlaceholder="Type to search products..."
                    onSearch={handleSearch}
                    useSearchSuggestion={true}
                    suggestionFetchFn={fetchProductSuggestionsForTable}
                    onSuggestionSelect={handleSearch}
                    suggestionDebounceMs={300}
                    suggestionMinChars={2}
                    suggestionLimit={5}
                    // Filters
                    filters={filters}
                    // Loading
                    isLoading={isLoading}
                    loadingText="Loading products..."
                    // Empty
                    emptyText="No products found."
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
            {actionContent === 'create' && <Create setActionContent={setActionContent} />}

            {/* Edit View */}
            {actionContent === 'edit' && selectedProductId && (
                <Edit
                    setActionContent={setActionContent}
                    productId={selectedProductId}
                    onSuccess={handleRefresh}
                />
            )}

            {/* View Details */}
            {actionContent === 'view' && selectedProductId && (
                <View
                    setActionContent={setActionContent}
                    productId={selectedProductId}
                />
            )}

            {/* Product History Viewer */}
            <ProductHistoryViewer
                productId={historyProductId}
                isOpen={showHistoryViewer}
                onClose={() => {
                    setShowHistoryViewer(false);
                    setHistoryProductId('');
                }}
            />

            {/* Reject Product Modal */}
            {rejectProduct && (
                <RejectProductModal
                    productId={rejectProduct.publicId}
                    productName={rejectProduct.name}
                    isOpen={showRejectModal}
                    onClose={() => {
                        setShowRejectModal(false);
                        setRejectProduct(null);
                    }}
                    onSuccess={handleRefresh}
                />
            )}
        </div>
    );
}
