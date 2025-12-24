"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    fetchCategories,
    selectCategories,
    selectCategoriesLoading,
    selectCategoriesPagination,
    selectCategoriesSearch,
    selectCategoriesSorting,
    setLimit,
    setPage,
    setSearch,
    setSorting
} from '@/store/categoriesSlice';
import type { SortingState } from '@tanstack/react-table';
import type { Category } from '@/store/categoriesSlice';
import { Pencil, Trash2 } from 'lucide-react';
import CreateCategory from './create';
import EditCategory from './edit';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import { useConfirm } from '@/context/dashboard/useConfirm';
import { DataTable, DataTableColumnHeader } from '@/components/data-table';

export default function ManagementCategoriesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const categories = useSelector(selectCategories);
    const isLoading = useSelector(selectCategoriesLoading);
    const { page, limit, total, totalPages } = useSelector(selectCategoriesPagination);
    const search = useSelector(selectCategoriesSearch);
    const { sortBy, sortOrder } = useSelector(selectCategoriesSorting);
    const [actionContent, setActionContent] = useState('table');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const { confirm } = useConfirm();

    useEffect(() => {
        dispatch(fetchCategories({ page, limit, search, sortBy, sortOrder }));
    }, [dispatch, page, limit, search, sortBy, sortOrder]);

    const handleDelete = useCallback(async (categoryId: string) => {
        await confirm({
            title: "Confirm deletion",
            description: "Are you sure you want to delete this category? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/categories/${categoryId}`);
                    toast.success('Category deleted successfully');
                    dispatch(fetchCategories({ page, limit, search, sortBy, sortOrder }));
                } catch (error: unknown) {
                    const message = error instanceof Error && 'response' in error
                        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                        : 'Failed to delete category';
                    toast.error(message || 'Failed to delete category');
                }
            },
        });
    }, [confirm, dispatch, page, limit, search, sortBy, sortOrder]);

    const handleEdit = useCallback((categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setActionContent('edit');
    }, []);

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

    const handleRefresh = useCallback(() => {
        dispatch(fetchCategories({ page, limit, search, sortBy, sortOrder }));
    }, [dispatch, page, limit, search, sortBy, sortOrder]);

    const columns: ColumnDef<Category>[] = useMemo(() => [
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
            accessorKey: 'slug',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Slug" sortable />
            ),
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => (
                <span className={row.original.isActive ? 'text-green-600' : 'text-red-600'}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
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
                const category = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category.publicId)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.publicId)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        },
    ], [page, limit, handleEdit, handleDelete]);

    return (
        <div className="w-full">
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap justify-between items-center gap-3 h-12">
                    <h1 className="text-xl font-semibold">{actionContent === 'table' ? 'Categories' : actionContent === 'create' ? 'Create Category' : actionContent === 'edit' ? 'Edit Category' : ''}</h1>
                    <div className='w-full sm:w-full md:w-auto flex flex-wrap sm:flex-wrap md:flex-nowrap items-center gap-3 sm:justify-start md:justify-end'>
                        {actionContent === 'table' ? (
                            <Button onClick={() => setActionContent('create')}>Create</Button>
                        ) : (
                            <Button variant="outline" onClick={() => setActionContent('table')}>Back to Table</Button>
                        )}
                    </div>
                </div>
            </div>

            {actionContent === 'table' && (
                <DataTable
                    columns={columns}
                    data={categories}
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
                    // Search
                    searchable={true}
                    searchPlaceholder="Search categories..."
                    searchColumn="name"
                    onSearch={handleSearch}
                    // Loading
                    isLoading={isLoading}
                    loadingText="Loading categories..."
                    // Empty
                    emptyText="No categories found."
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
            {actionContent === 'create' && <CreateCategory setActionContent={setActionContent} onSuccess={handleRefresh} />}

            {/* Edit View */}
            {actionContent === 'edit' && selectedCategoryId && (
                <EditCategory
                    setActionContent={setActionContent}
                    categoryId={selectedCategoryId}
                    onSuccess={handleRefresh}
                />
            )}
        </div>
    );
}
