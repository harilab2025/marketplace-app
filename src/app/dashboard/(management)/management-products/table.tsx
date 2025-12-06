"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    fetchProducts,
    selectProducts,
    selectProductsError,
    selectProductsLoading,
    selectProductsPagination,
    setLimit,
    setPage
} from '@/store/productsSlice';
import type { Product } from '@/store/productsSlice';
import type { HeaderGroup, Header, SortingState, VisibilityState } from '@tanstack/react-table';
import { LucideChevronDown, LucideChevronLeft, LucideChevronRight, LucideChevronsUpDown, LucideChevronUp } from 'lucide-react';
import Create from './create';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ManagementProductsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const products = useSelector(selectProducts);
    const isLoading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);
    const { page, limit, total, totalPages } = useSelector(selectProductsPagination);
    const [lastFetchParams, setLastFetchParams] = useState({ page: 0, limit: 0 });
    const [localLoading, setLocalLoading] = useState(false);
    const [actionContent, setActionContent] = useState('table');
    const isFetchingRef = useRef(false);
    const router = useRouter();
    useEffect(() => {
        // Hanya fetch jika parameter benar-benar berubah
        if (lastFetchParams.page !== page || lastFetchParams.limit !== limit) {
            if (!isFetchingRef.current) {
                isFetchingRef.current = true;
                setLastFetchParams({ page, limit });

                dispatch(fetchProducts({ page, limit }))
                    .finally(() => {
                        isFetchingRef.current = false;
                    });
            }
        }
    }, [dispatch, page, limit, lastFetchParams]);

    // Cleanup timeout and reset refs on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = null;
            }
            isFetchingRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!isLoading && localLoading) {
            setLocalLoading(false);
        }
    }, [isLoading, localLoading]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            setTimeout(() => {
                router.refresh();
            }, 3000);
        }
    }, [error, router]);

    const columns: ColumnDef<Product, unknown>[] = [
        { accessorKey: 'id', header: 'No', enableSorting: false },
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'sku', header: 'SKU' },
        { accessorKey: 'price', header: 'Price', cell: ({ row }) => `Rp ${row.original.price.toLocaleString('id-ID')}` },
        { accessorKey: 'stock', header: 'Stock' },
        {
            accessorKey: 'isActive', header: 'Status', cell: ({ row }) => (
                <span className={row.original.isActive === true ? 'text-green-600' : row.original.isActive === false ? 'text-red-600' : 'text-zinc-500'}>
                    {row.original.isActive === true ? 'Live' : row.original.isActive === false ? 'Not Live' : 'On Verification'}
                </span>
            )
        },
        { accessorKey: 'updatedAt', header: 'Updated', cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString('id-ID') },
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const table = useReactTable<Product>({
        data: products.map((product, index: number) => {
            const rowNumber = ((page - 1) * limit) + index + 1;
            const obj = {
                ...product,
                id: rowNumber
            }
            return obj
        }),
        columns,
        state: { sorting, columnVisibility, globalFilter },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    const stableData = useMemo(() => columnVisibility && ({
        products: products,
        visibleColumns: table.getVisibleLeafColumns(),
        rows: table.getRowModel().rows
    }), [products, table, columnVisibility]);

    const tableRows = useCallback(() => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={stableData.visibleColumns.length} className="text-center">
                        Memuat...
                    </TableCell>
                </TableRow>
            );
        }

        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={stableData.visibleColumns.length} className="text-center text-red-600">
                        {error}
                    </TableCell>
                </TableRow>
            );
        }

        if (stableData.rows.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={stableData.visibleColumns.length} className="text-center">
                        No data available.
                    </TableCell>
                </TableRow>
            );
        }

        return stableData.rows.map((row) => (
            <TableRow key={row.id} className="group [&>td]:hover:bg-gray-100 bg-white">
                {row.getVisibleCells().map((cell) => {
                    const columnIndex = stableData.visibleColumns.findIndex(col => col.id === cell.column.id);

                    return (
                        <TableCell
                            key={cell.id}
                            className={`${columnIndex === 0 ? 'sticky text-center left-0 w-[53px]' :
                                columnIndex === 1 ? 'sticky left-[53px]' : ''
                                } py-3 px-4 text-sm group-hover:bg-gray-100 bg-white`}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    );
                })}
            </TableRow>
        ));
    }, [isLoading, error, stableData]);

    return (
        <div className="w-full">
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <h1 className="text-xl font-semibold">{actionContent === 'table' ? 'Products' : actionContent === 'create' ? 'Create Product' : actionContent === 'edit' ? 'Edit Product' : actionContent === 'view' ? 'View Product' : ''}</h1>
                    <div className='w-full sm:w-full md:w-auto flex flex-wrap sm:flex-wrap md:flex-nowrap items-center gap-3 sm:justify-start md:justify-end'>
                        {actionContent === 'table' ? <>
                            <Input
                                placeholder="Cari produk..."
                                value={globalFilter ?? ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setGlobalFilter(value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        // Clear existing timeout
                                        if (searchTimeoutRef.current) {
                                            clearTimeout(searchTimeoutRef.current);
                                        }

                                        // Set new timeout for debounced search
                                        searchTimeoutRef.current = setTimeout(() => {
                                            if (!isFetchingRef.current) {
                                                isFetchingRef.current = true;
                                                // Reset ke halaman 1 saat search
                                                dispatch(setPage(1));
                                                dispatch(fetchProducts({ page: 1, limit }))
                                                    .finally(() => {
                                                        isFetchingRef.current = false;
                                                    });
                                            }
                                        }, 500);
                                    }
                                }}
                                // disabled={isLoading}
                                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <Button onClick={() => setActionContent('create')}>Create</Button>
                        </> :
                            <Button variant="outline" onClick={() => setActionContent('table')}>Back to Table</Button>
                        }
                    </div>
                    {/* <div className="flex items-center gap-3 flex-wrap">
                        {table.getAllLeafColumns().map((column) => (
                            <label key={column.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                            checked={column.getIsVisible()}
                            onCheckedChange={(v) => column.toggleVisibility(Boolean(v))}
                            disabled={isLoading}
                            />
                            <span>{String(column.columnDef.header)}</span>
                            </label>
                            ))}
                    </div> */}
                </div>
            </div>

            {actionContent === 'table' && <div className="w-full bg-white border rounded-md">
                <div className="grid w-full [&>div]:h-[calc(100vh-300px)]">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Product>) => (
                                <TableRow key={headerGroup.id} className="bg-gradient-to-b from-slate-200 to-slate-100 sticky top-0 z-10">
                                    {headerGroup.headers.map((header: Header<Product, unknown>, index: number) => (
                                        <TableHead key={header.id} className={`${index === 0 ? 'sticky left-0 w-[53px]' : index === 1 ? 'sticky left-[53px]' : ''} select-none font-semibold text-gray-700 py-4 px-4 text-sm border-gray-200 bg-gradient-to-b from-slate-200 to-slate-100`}>
                                            <div
                                                className={header.column.getCanSort() ? 'cursor-pointer flex items-center justify-between group hover:text-gray-900' : 'flex items-center justify-between'}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <span className="font-semibold uppercase">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </span>
                                                {header.column.getCanSort() && (
                                                    <div className="flex flex-col ml-2">
                                                        {header.column.getIsSorted() === 'asc' && (
                                                            <LucideChevronUp size={15} />
                                                        )}
                                                        {header.column.getIsSorted() === 'desc' && (
                                                            <LucideChevronDown size={15} />
                                                        )}
                                                        {!header.column.getIsSorted() && (
                                                            <div className="flex flex-col">
                                                                <LucideChevronsUpDown size={15} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {tableRows()}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm rounded-b-md">
                    <div>
                        Page {page} of {totalPages} • Total {total} items
                    </div>
                    <div className='flex items-end justify-center flex-col sm:flex-col md:flex-col lg:flex-row sm:justify-center md:justify-center lg:justify-end sm:items-end md:items-end lg:items-center gap-2'>
                        <div className="flex items-center gap-2 select-none">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const newPage = Math.max(1, page - 1);
                                    if (newPage !== page && !localLoading) {
                                        setLocalLoading(true);
                                        dispatch(setPage(newPage));
                                    }
                                }}
                                disabled={page <= 1 || isLoading}
                            >
                                <LucideChevronLeft size={16} />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const newPage = Math.min(totalPages || 1, page + 1);
                                    if (newPage !== page && !localLoading) {
                                        setLocalLoading(true);
                                        dispatch(setPage(newPage));
                                    }
                                }}
                                disabled={page >= (totalPages || 1) || isLoading}
                            >
                                <LucideChevronRight size={16} />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Per Page</label>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    const newLimit = Number(e.target.value);
                                    if (newLimit !== limit) {
                                        dispatch(setLimit(newLimit));
                                        dispatch(setPage(1));
                                    }
                                }}
                                disabled={isLoading}
                                className="border rounded px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {[10, 20, 50].map((v) => (
                                    <option value={v} key={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>}
            {actionContent === 'create' && <Create setActionContent={setActionContent} />}
        </div>
    );
}