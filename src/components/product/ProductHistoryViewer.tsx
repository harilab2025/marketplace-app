'use client';

import { useEffect, useState } from 'react';
import { getProductHistory } from '@/services/fetch/product.verification.fetch';
import { LucideLoader2, LucideX, LucideHistory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductStatusBadge from './ProductStatusBadge';
import { VerificationStatus } from '@/store/productsSlice';

interface RevisionHistoryItem {
    action: string;
    by: string;
    byRole: string;
    at: string;
    from: VerificationStatus;
    to: VerificationStatus;
}

interface ProductHistoryData {
    publicId: string;
    name: string;
    verificationStatus: VerificationStatus;
    createdBy: {
        publicId: string;
        name: string;
        role: string;
    };
    submittedBy?: {
        publicId: string;
        name: string;
    } | null;
    reviewedBy?: {
        publicId: string;
        name: string;
        role: string;
    } | null;
    createdAt: string;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    publishedAt?: string | null;
    rejectionReason?: string | null;
    revisionHistory: RevisionHistoryItem[];
}

interface ProductHistoryViewerProps {
    productId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductHistoryViewer({
    productId,
    isOpen,
    onClose
}: ProductHistoryViewerProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ProductHistoryData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && productId) {
            fetchHistory();
        }
    }, [isOpen, productId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProductHistory(productId);
            setData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <LucideHistory size={24} />
                        <h2 className="text-xl font-semibold">Product History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <LucideLoader2 className="animate-spin" size={40} />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                            <Button onClick={fetchHistory} className="mt-4">
                                Retry
                            </Button>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Product Info */}
                            <div className="border dark:border-gray-700 rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-2">{data.name}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Current Status:
                                    </span>
                                    <ProductStatusBadge status={data.verificationStatus} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Created by
                                        </p>
                                        <p className="font-medium">
                                            {data.createdBy.name} ({data.createdBy.role})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Created at
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(data.createdAt)}
                                        </p>
                                    </div>
                                    {data.submittedBy && (
                                        <>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Submitted by
                                                </p>
                                                <p className="font-medium">
                                                    {data.submittedBy.name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Submitted at
                                                </p>
                                                <p className="font-medium">
                                                    {data.submittedAt
                                                        ? formatDate(data.submittedAt)
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    {data.reviewedBy && (
                                        <>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Reviewed by
                                                </p>
                                                <p className="font-medium">
                                                    {data.reviewedBy.name} ({data.reviewedBy.role})
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Reviewed at
                                                </p>
                                                <p className="font-medium">
                                                    {data.reviewedAt
                                                        ? formatDate(data.reviewedAt)
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {data.rejectionReason && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                                            Rejection Reason:
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-300">
                                            {data.rejectionReason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Revision History */}
                            <div>
                                <h4 className="font-semibold mb-3">Revision History</h4>
                                <div className="space-y-3">
                                    {data.revisionHistory.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            No revision history available
                                        </p>
                                    ) : (
                                        data.revisionHistory.map((item, index) => (
                                            <div
                                                key={index}
                                                className="border-l-2 border-blue-500 dark:border-blue-400 pl-4 py-2"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm">
                                                        {item.action}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <ProductStatusBadge status={item.from} />
                                                        <span>→</span>
                                                        <ProductStatusBadge status={item.to} />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    by {item.by} ({item.byRole})
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    {formatDate(item.at)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="p-6 border-t dark:border-gray-700">
                    <Button onClick={onClose} className="w-full">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
