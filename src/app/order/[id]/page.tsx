'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrderItem {
    id: string;
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
}

interface Order {
    orderId: string;
    orderNumber: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    items: OrderItem[];
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
    };
    paymentMethod: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    trackingNumber?: string;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock data - In production, fetch from API
        setTimeout(() => {
            setOrder({
                orderId: params.id,
                orderNumber: 'ORD-12345',
                status: 'shipped',
                createdAt: new Date().toISOString(),
                items: [
                    {
                        id: '1',
                        productId: 'prod-1',
                        name: 'Premium Wireless Headphones',
                        sku: 'SKU-001',
                        price: 299000,
                        quantity: 2,
                    },
                    {
                        id: '2',
                        productId: 'prod-2',
                        name: 'Smart Watch Pro',
                        sku: 'SKU-002',
                        price: 1499000,
                        quantity: 1,
                    },
                ],
                shippingAddress: {
                    fullName: 'John Doe',
                    phone: '+62 812-3456-7890',
                    address: 'Jl. Sudirman No. 123',
                    city: 'Jakarta',
                    province: 'DKI Jakarta',
                    postalCode: '12345',
                },
                paymentMethod: 'Credit Card',
                subtotal: 2097000,
                tax: 230670,
                shipping: 0,
                total: 2327670,
                trackingNumber: 'JNE1234567890',
            });
            setIsLoading(false);
        }, 500);
    }, [params.id]);

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5" />;
            case 'processing':
                return <Package className="h-5 w-5" />;
            case 'shipped':
                return <Truck className="h-5 w-5" />;
            case 'delivered':
                return <CheckCircle className="h-5 w-5" />;
            default:
                return <Package className="h-5 w-5" />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-48" />
                        <div className="bg-white rounded-lg p-6 space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                    <Button onClick={() => router.push('/transaction')}>View All Orders</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/transaction')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Button>
                </div>
            </div>

            {/* Order Details */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Order Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                Order {order.orderNumber}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="font-semibold capitalize">{order.status}</span>
                        </div>
                    </div>

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Tracking Number</p>
                                    <p className="text-lg font-bold text-blue-600">{order.trackingNumber}</p>
                                    <p className="text-xs text-blue-700 mt-1">Track your package with this number</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                    <div className="divide-y">
                        {order.items.map((item) => (
                            <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <span className="text-3xl">📦</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                            <div className="flex items-start gap-2 text-gray-600">
                                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p>{order.shippingAddress.phone}</p>
                            </div>
                            <p className="text-gray-600">{order.shippingAddress.address}</p>
                            <p className="text-gray-600">
                                {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                            </p>
                        </div>
                    </div>

                    {/* Payment & Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">{order.paymentMethod}</p>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">Rp {order.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax (11%)</span>
                                <span className="font-medium">Rp {order.tax.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">
                                    {order.shipping === 0 ? (
                                        <span className="text-green-600">FREE</span>
                                    ) : (
                                        `Rp ${order.shipping.toLocaleString('id-ID')}`
                                    )}
                                </span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        Rp {order.total.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={() => toast.info('Contact support feature coming soon')}
                        className="flex-1"
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Support
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => toast.info('Invoice download feature coming soon')}
                        className="flex-1"
                    >
                        Download Invoice
                    </Button>
                </div>
            </div>
        </div>
    );
}
