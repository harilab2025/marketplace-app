'use client';

import { useState } from 'react';
import { rejectProduct } from '@/services/fetch/product.verification.fetch';
import { Button } from '@/components/ui/button';
import { LucideX, LucideLoader2 } from 'lucide-react';

interface RejectProductModalProps {
    productId: string;
    productName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function RejectProductModal({
    productId,
    productName,
    isOpen,
    onClose,
    onSuccess
}: RejectProductModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            setLoading(true);
            await rejectProduct(productId, reason);
            alert('Product rejected successfully!');
            onSuccess?.();
            onClose();
            setReason('');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to reject product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Reject Product</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        You are about to reject: <strong>{productName}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="reason"
                            className="block text-sm font-medium mb-2"
                        >
                            Rejection Reason *
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please provide a clear reason for rejection..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Be specific to help the product manager improve the product
                        </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={loading}
                            className="gap-2"
                        >
                            {loading && <LucideLoader2 size={16} className="animate-spin" />}
                            Reject Product
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
