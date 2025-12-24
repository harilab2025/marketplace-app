"use client";

import { useState, useEffect } from 'react';
import { Package, User, DollarSign, Calendar, Truck, MapPin, CreditCard, Clock, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import { Skeleton } from '@/components/ui/Skeleton';
import type { OrderStatus, PaymentStatus } from '@/store/ordersSlice';

interface ViewOrderProps {
    setActionContent: (action: string) => void;
    orderId: string;
}

interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderData {
    publicId: string;
    orderNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string | null;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode: string;
    trackingNumber: string | null;
    notes: string | null;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
    paidAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
}

export default function ViewOrder({ setActionContent, orderId }: ViewOrderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState<OrderData | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get<{ status: string; data: OrderData }>(`/orders/${orderId}`);

                if (response.data.status === 'success') {
                    setOrder(response.data.data);
                }
            } catch (error: unknown) {
                const message = error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : 'Failed to fetch order data';
                toast.error(message || 'Failed to fetch order data');
                setActionContent('table');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, setActionContent]);

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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-center text-gray-500">Order not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="h-6 w-6 text-gray-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
                        </div>
                        <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                            {order.paymentStatus.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">{order.userName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Email
                            </p>
                            <p className="text-sm text-gray-900">{order.userEmail}</p>
                        </div>
                        {order.userPhone && (
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    Phone
                                </p>
                                <p className="text-sm text-gray-900">{order.userPhone}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Address
                            </p>
                            <p className="text-sm text-gray-900">{order.shippingAddress}</p>
                            <p className="text-sm text-gray-900">{order.shippingCity}, {order.shippingPostalCode}</p>
                        </div>
                        {order.trackingNumber && (
                            <div>
                                <p className="text-sm text-gray-500">Tracking Number</p>
                                <p className="font-mono text-sm text-blue-600">{order.trackingNumber}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Method</p>
                            <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                                {order.paymentStatus.replace(/_/g, ' ')}
                            </span>
                        </div>
                        {order.paidAt && (
                            <div>
                                <p className="text-sm text-gray-500">Paid At</p>
                                <p className="text-sm text-gray-900">{formatDate(order.paidAt)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-gray-900">{item.productName}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600 font-mono">{item.productSku}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-sm text-gray-900">{formatCurrency(item.price)}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-sm text-gray-900">{item.quantity}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Order Totals */}
                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-900">{formatCurrency(order.shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Order Timeline
                </h3>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 w-0.5 bg-gray-200 mt-2"></div>
                        </div>
                        <div className="pb-4">
                            <p className="font-medium text-gray-900">Order Placed</p>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                    </div>

                    {order.paidAt && (
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                                {(order.shippedAt || order.deliveredAt) && <div className="flex-1 w-0.5 bg-gray-200 mt-2"></div>}
                            </div>
                            <div className="pb-4">
                                <p className="font-medium text-gray-900">Payment Confirmed</p>
                                <p className="text-sm text-gray-500">{formatDate(order.paidAt)}</p>
                            </div>
                        </div>
                    )}

                    {order.shippedAt && (
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Truck className="h-4 w-4 text-purple-600" />
                                </div>
                                {order.deliveredAt && <div className="flex-1 w-0.5 bg-gray-200 mt-2"></div>}
                            </div>
                            <div className="pb-4">
                                <p className="font-medium text-gray-900">Order Shipped</p>
                                <p className="text-sm text-gray-500">{formatDate(order.shippedAt)}</p>
                                {order.trackingNumber && (
                                    <p className="text-sm text-blue-600 font-mono">{order.trackingNumber}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {order.deliveredAt && (
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Order Delivered</p>
                                <p className="text-sm text-gray-500">{formatDate(order.deliveredAt)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notes (if any) */}
            {order.notes && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                    <p className="text-gray-700">{order.notes}</p>
                </div>
            )}
        </div>
    );
}
