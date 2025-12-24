'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
    fetchProducts,
    searchProductsES,
    selectProducts,
    selectProductsError,
    selectProductsLoading,
    selectProductsPagination,
    selectProductsSearch,
    setLimit,
    setPage,
    setSearch,
} from '@/store/productsSlice';
import { ProductAutocomplete } from '@/components/product/ProductAutocomplete';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { Product } from '@/store/productsSlice';

export default function CatalogPage() {
    const dispatch = useDispatch<AppDispatch>();
    const products = useSelector(selectProducts);
    const isLoading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);
    const { page, limit, total, totalPages } = useSelector(selectProductsPagination);
    const search = useSelector(selectProductsSearch);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (search && search.trim().length > 2) {
                    await dispatch(searchProductsES({
                        query: search,
                        page,
                        limit,
                        sortBy: '_score',
                        sortOrder: 'desc'
                    })).unwrap();
                } else {
                    await dispatch(fetchProducts({
                        page,
                        limit,
                        search,
                        sortBy: '',
                        sortOrder: '',
                        statusFilter: ['live']
                    })).unwrap();
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            }
        };

        fetchData();
    }, [dispatch, page, limit, search]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handlePageChange = useCallback((newPage: number) => {
        dispatch(setPage(newPage));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch]);

    const handleSearch = useCallback((value: string) => {
        dispatch(setSearch(value));
        dispatch(setPage(1));
    }, [dispatch]);

    const handleViewProduct = (productId: string) => {
        router.push(`/product/${productId}`);
    };

    const handleAddToCart = (product: Product) => {
        toast.success(`${product.name} added to cart`);
        // TODO: Implement cart logic
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Catalog</h1>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/cart')}
                                className="flex items-center gap-2"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                <span className="hidden sm:inline">Cart</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-2xl">
                    <ProductAutocomplete
                        value={search}
                        onChange={handleSearch}
                        onSelect={(suggestion) => handleSearch(suggestion)}
                        placeholder="Search products..."
                        debounceMs={300}
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                                <div className="aspect-square bg-gray-200" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    <div className="h-8 bg-gray-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.publicId}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-4xl text-gray-300">📦</span>
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[3rem]">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xl font-bold text-blue-600">
                                                Rp {product.price.toLocaleString('id-ID')}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                product.stock > 10 ? 'bg-green-100 text-green-700' :
                                                product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                Stock: {product.stock}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewProduct(product.publicId)}
                                                className="flex-1"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.stock === 0}
                                                className="flex-1"
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                                    <span className="font-medium">{total}</span> results
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (page <= 3) {
                                                pageNum = i + 1;
                                            } else if (page >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={i}
                                                    variant={page === pageNum ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className="w-10"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
