'use client';

import { useState } from 'react';
import { Product, VerificationStatus } from '@/store/productsSlice';
import { Button } from '@/components/ui/button';
import { submitProductForReview, approveProduct, publishProduct, unpublishProduct } from '@/services/fetch/product.verification.fetch';
import { useRouter } from 'next/navigation';
import { LucideCheck, LucideX, LucideLoader2, LucideSend, LucideEye, LucideEyeOff } from 'lucide-react';

interface VerificationActionButtonsProps {
    product: Product;
    userRole: string;
    onSuccess?: () => void;
    onReject?: () => void;
}

export default function VerificationActionButtons({
    product,
    userRole,
    onSuccess,
    onReject
}: VerificationActionButtonsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmitForReview = async () => {
        try {
            setLoading(true);
            await submitProductForReview(product.publicId);
            alert('Product submitted for review successfully!');
            onSuccess?.();
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit product');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setLoading(true);
            await approveProduct(product.publicId);
            alert('Product approved successfully!');
            onSuccess?.();
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to approve product');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        try {
            setLoading(true);
            await publishProduct(product.publicId);
            alert('Product published successfully!');
            onSuccess?.();
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to publish product');
        } finally {
            setLoading(false);
        }
    };

    const handleUnpublish = async () => {
        const reason = prompt('Enter reason for unpublishing (optional):');
        try {
            setLoading(true);
            await unpublishProduct(product.publicId, reason || undefined);
            alert('Product unpublished successfully!');
            onSuccess?.();
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to unpublish product');
        } finally {
            setLoading(false);
        }
    };

    // PRODUCT_MANAGER and SUPERADMIN actions
    if (userRole === 'PRODUCT_MANAGER' || userRole === 'SUPERADMIN') {
        switch (product.verificationStatus) {
            case 'DRAFT':
            case 'REJECTED':
                return (
                    <Button
                        onClick={handleSubmitForReview}
                        disabled={loading}
                        size="sm"
                        className="gap-2"
                    >
                        {loading ? (
                            <LucideLoader2 size={16} className="animate-spin" />
                        ) : (
                            <LucideSend size={16} />
                        )}
                        Submit for Review
                    </Button>
                );

            case 'PENDING':
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="gap-2"
                    >
                        <LucideLoader2 size={16} className="animate-spin" />
                        Awaiting Review
                    </Button>
                );

            case 'APPROVED':
                return (
                    <Button
                        onClick={handlePublish}
                        disabled={loading}
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                        {loading ? (
                            <LucideLoader2 size={16} className="animate-spin" />
                        ) : (
                            <LucideEye size={16} />
                        )}
                        Publish Now
                    </Button>
                );

            case 'PUBLISHED':
                return (
                    <Button
                        onClick={handleUnpublish}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        {loading ? (
                            <LucideLoader2 size={16} className="animate-spin" />
                        ) : (
                            <LucideEyeOff size={16} />
                        )}
                        Unpublish
                    </Button>
                );

            case 'UNPUBLISHED':
                return (
                    <Button
                        onClick={handlePublish}
                        disabled={loading}
                        size="sm"
                        className="gap-2"
                    >
                        {loading ? (
                            <LucideLoader2 size={16} className="animate-spin" />
                        ) : (
                            <LucideEye size={16} />
                        )}
                        Re-publish
                    </Button>
                );

            default:
                return null;
        }
    }

    // PRODUCT_REVIEWER actions
    if (userRole === 'PRODUCT_REVIEWER' && product.verificationStatus === 'PENDING') {
        return (
            <div className="flex gap-2">
                <Button
                    onClick={handleApprove}
                    disabled={loading}
                    size="sm"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                >
                    {loading ? (
                        <LucideLoader2 size={16} className="animate-spin" />
                    ) : (
                        <LucideCheck size={16} />
                    )}
                    Approve
                </Button>
                <Button
                    onClick={onReject}
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                >
                    <LucideX size={16} />
                    Reject
                </Button>
            </div>
        );
    }

    return null;
}
