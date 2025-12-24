'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
    orderId: string;
    orderNumber: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    itemCount: number;
    total: number;
    trackingNumber?: string;
}

export default function TransactionPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

    // Mock orders data - In production, fetch from API
    const orders: Order[] = [
        {
            orderId: 'ORD-12345',
            orderNumber: 'ORD-12345',
            status: 'delivered',
            createdAt: '2024-01-15T10:30:00Z',
            itemCount: 3,
            total: 2327670,
            trackingNumber: 'JNE1234567890',
        },
        {
            orderId: 'ORD-12346',
            orderNumber: 'ORD-12346',
            status: 'shipped',
            createdAt: '2024-01-18T14:20:00Z',
            itemCount: 2,
            total: 1548000,
            trackingNumber: 'JNE0987654321',
        },
        {
            orderId: 'ORD-12347',
            orderNumber: 'ORD-12347',
            status: 'processing',
            createdAt: '2024-01-20T09:15:00Z',
            itemCount: 1,
            total: 299000,
        },
        {
            orderId: 'ORD-12348',
            orderNumber: 'ORD-12348',
            status: 'pending',
            createdAt: '2024-01-21T16:45:00Z',
            itemCount: 4,
            total: 3456000,
        },
        {
            orderId: 'ORD-12349',
            orderNumber: 'ORD-12349',
            status: 'cancelled',
            createdAt: '2024-01-10T11:00:00Z',
            itemCount: 2,
            total: 998000,
        },
    ];

    const statusOptions = [
        { value: 'all' as const, label: 'All Orders', icon: ShoppingBag, count: orders.length },
        { value: 'pending' as const, label: 'Pending', icon: Clock, count: orders.filter(o => o.status === 'pending').length },
        { value: 'processing' as const, label: 'Processing', icon: Package, count: orders.filter(o => o.status === 'processing').length },
        { value: 'shipped' as const, label: 'Shipped', icon: Truck, count: orders.filter(o => o.status === 'shipped').length },
        { value: 'delivered' as const, label: 'Delivered', icon: CheckCircle, count: orders.filter(o => o.status === 'delivered').length },
        { value: 'cancelled' as const, label: 'Cancelled', icon: XCircle, count: orders.filter(o => o.status === 'cancelled').length },
    ];

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

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
                return <Clock className="h-4 w-4" />;
            case 'processing':
                return <Package className="h-4 w-4" />;
            case 'shipped':
                return <Truck className="h-4 w-4" />;
            case 'delivered':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-1">Track and manage your orders</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order number or tracking number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6 overflow-x-auto">
                    <div className="flex gap-2 pb-2 min-w-max">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setStatusFilter(option.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                                    statusFilter === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <option.icon className="h-4 w-4" />
                                <span>{option.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    statusFilter === option.value
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {option.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ? 'Try adjusting your search' : 'You haven\'t placed any orders yet'}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => router.push('/catalog')}>
                                Start Shopping
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.orderId}
                                onClick={() => router.push(`/order/${order.orderId}`)}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                            >
                                <div className="p-4 sm:p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {order.orderNumber}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="capitalize">{order.status}</span>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Items</p>
                                            <p className="font-medium text-gray-900">
                                                {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Total</p>
                                            <p className="font-bold text-blue-600">
                                                Rp {order.total.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        {order.trackingNumber && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {order.trackingNumber}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* View Details Button */}
                                    <div className="flex justify-end pt-4 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                        >
                                            View Details
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
