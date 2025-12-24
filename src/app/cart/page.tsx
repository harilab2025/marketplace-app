'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CartItem {
    id: string;
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    stock: number;
    image?: string;
}

export default function CartPage() {
    const router = useRouter();

    // Mock cart data - In production, this would come from a global state or API
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: '1',
            productId: 'prod-1',
            name: 'Premium Wireless Headphones',
            sku: 'SKU-001',
            price: 299000,
            quantity: 2,
            stock: 15,
        },
        {
            id: '2',
            productId: 'prod-2',
            name: 'Smart Watch Pro',
            sku: 'SKU-002',
            price: 1499000,
            quantity: 1,
            stock: 8,
        },
        {
            id: '3',
            productId: 'prod-3',
            name: 'USB-C Fast Charger',
            sku: 'SKU-003',
            price: 149000,
            quantity: 3,
            stock: 20,
        },
    ]);

    const updateQuantity = (itemId: string, newQuantity: number) => {
        setCartItems(items =>
            items.map(item => {
                if (item.id === itemId) {
                    if (newQuantity > item.stock) {
                        toast.error(`Only ${item.stock} items available in stock`);
                        return item;
                    }
                    if (newQuantity < 1) {
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const removeItem = (itemId: string) => {
        const item = cartItems.find(i => i.id === itemId);
        setCartItems(items => items.filter(i => i.id !== itemId));
        toast.success(`${item?.name} removed from cart`);
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.11; // 11% tax
    const shipping = subtotal > 100000 ? 0 : 15000; // Free shipping over 100k
    const total = subtotal + tax + shipping;

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Continue Shopping</span>
                            <span className="sm:hidden">Back</span>
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    </div>
                </div>
            </div>

            {/* Cart Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {cartItems.length === 0 ? (
                    // Empty Cart
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Add some products to get started</p>
                        <Button onClick={() => router.push('/catalog')}>
                            Browse Products
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-4 sm:p-6 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Cart Items ({cartItems.length})
                                    </h2>
                                </div>
                                <div className="divide-y">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="p-4 sm:p-6">
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-3xl">📦</span>
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
                                                        <div className="min-w-0">
                                                            <h3 className="font-semibold text-gray-900 truncate">
                                                                {item.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                SKU: {item.sku}
                                                            </p>
                                                        </div>
                                                        <div className="text-left sm:text-right">
                                                            <p className="text-lg font-bold text-blue-600">
                                                                Rp {item.price.toLocaleString('id-ID')}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                per item
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center border rounded-lg">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    className="px-3"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    disabled={item.quantity >= item.stock}
                                                                    className="px-3"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <span className="text-sm text-gray-500">
                                                                Stock: {item.stock}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                                            <div className="text-left sm:text-right">
                                                                <p className="text-xs text-gray-500">Subtotal</p>
                                                                <p className="text-lg font-bold text-gray-900">
                                                                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeItem(item.id)}
                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">
                                            Rp {subtotal.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (11%)</span>
                                        <span className="font-medium">
                                            Rp {tax.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">
                                            {shipping === 0 ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                `Rp ${shipping.toLocaleString('id-ID')}`
                                            )}
                                        </span>
                                    </div>
                                    {shipping === 0 && (
                                        <p className="text-xs text-green-600">
                                            🎉 You got free shipping!
                                        </p>
                                    )}
                                </div>

                                <div className="border-t pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            Rp {total.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    className="w-full mb-3"
                                    size="lg"
                                >
                                    Proceed to Checkout
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/catalog')}
                                    className="w-full"
                                >
                                    Continue Shopping
                                </Button>

                                {/* Additional Info */}
                                <div className="mt-6 pt-6 border-t space-y-2 text-xs text-gray-500">
                                    <p>✓ Secure checkout</p>
                                    <p>✓ Free returns within 30 days</p>
                                    <p>✓ 100% original products</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
