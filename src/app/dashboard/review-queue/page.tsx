'use client';

import { useEffect, useState } from 'react';
import { getPendingProducts } from '@/services/fetch/product.verification.fetch';
import { Product } from '@/store/productsSlice';
import ProductStatusBadge from '@/components/product/ProductStatusBadge';
import VerificationActionButtons from '@/components/product/VerificationActionButtons';
import RejectProductModal from '@/components/product/RejectProductModal';
import { LucideLoader2, LucidePackage } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function ReviewQueuePage() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const limit = 10;


    const fetchPendingProducts = async (pages: number) => {
        try {
            setLoading(true);
            const response = await getPendingProducts({ page: pages, limit });
            setProducts(response.data.items || []);
            setTotal(response.data.total || 0);
            setTotalPages(response.data.totalPages || 0);
        } catch (error) {
            console.error('Failed to fetch pending products:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPendingProducts(page);
    }, [page]);

    const handleRejectClick = (product: Product) => {
        setSelectedProduct(product);
        setShowRejectModal(true);
    };

    const handleSuccess = () => {
        fetchPendingProducts(page);
    };

    if (loading && page === 1) {
        return (
            <div className="flex items-center justify-center h-96">
                <LucideLoader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Review Queue</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {total} product{total !== 1 ? 's' : ''} pending review
                </p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12">
                    <LucidePackage size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Products</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        All products have been reviewed!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {products.map((product) => (
                        <div
                            key={product.publicId}
                            className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    {product.images && product.images.length > 0 ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-24 h-24 object-cover rounded-md"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                            <LucidePackage size={32} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                SKU: {product.sku}
                                            </p>
                                        </div>
                                        <ProductStatusBadge status={product.verificationStatus!} />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Category
                                            </p>
                                            <p className="text-sm font-medium">
                                                {product.category?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Price
                                            </p>
                                            <p className="text-sm font-medium">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Stock
                                            </p>
                                            <p className="text-sm font-medium">{product.stock}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Submitted by
                                            </p>
                                            <p className="text-sm font-medium">
                                                {product.submittedBy?.name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {product.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <VerificationActionButtons
                                            product={product}
                                            userRole={session?.user?.role || 'CUSTOMER'}
                                            onSuccess={handleSuccess}
                                            onReject={() => handleRejectClick(product)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Reject Modal */}
            {selectedProduct && (
                <RejectProductModal
                    productId={selectedProduct.publicId}
                    productName={selectedProduct.name}
                    isOpen={showRejectModal}
                    onClose={() => {
                        setShowRejectModal(false);
                        setSelectedProduct(null);
                    }}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
