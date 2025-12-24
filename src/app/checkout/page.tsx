'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Wallet, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface ShippingAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
}

export default function CheckoutPage() {
    const router = useRouter();

    // Mock cart data
    const cartItems: CartItem[] = [
        { id: '1', name: 'Premium Wireless Headphones', price: 299000, quantity: 2 },
        { id: '2', name: 'Smart Watch Pro', price: 1499000, quantity: 1 },
        { id: '3', name: 'USB-C Fast Charger', price: 149000, quantity: 3 },
    ];

    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'bank-transfer' | 'e-wallet'>('credit-card');
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.11;
    const shipping = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + tax + shipping;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            toast.success('Order placed successfully!');
            // In production, redirect to order detail page
            router.push('/order/ORD-12345');
        }, 2000);
    };

    const paymentMethods = [
        {
            id: 'credit-card' as const,
            name: 'Credit/Debit Card',
            icon: CreditCard,
            description: 'Visa, Mastercard, JCB',
        },
        {
            id: 'bank-transfer' as const,
            name: 'Bank Transfer',
            icon: Building2,
            description: 'BCA, Mandiri, BNI',
        },
        {
            id: 'e-wallet' as const,
            name: 'E-Wallet',
            icon: Wallet,
            description: 'GoPay, OVO, Dana',
        },
    ];

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
                            <span className="hidden sm:inline">Back to Cart</span>
                            <span className="sm:hidden">Back</span>
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Checkout</h1>
                    </div>
                </div>
            </div>

            {/* Checkout Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Shipping Address
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={shippingAddress.fullName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingAddress.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address *
                                        </label>
                                        <textarea
                                            name="address"
                                            value={shippingAddress.address}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Province *
                                        </label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={shippingAddress.province}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Postal Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={shippingAddress.postalCode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Payment Method
                                </h2>
                                <div className="space-y-3">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`w-full p-4 border-2 rounded-lg transition-all ${
                                                paymentMethod === method.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                                    paymentMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}>
                                                    <method.icon className={`h-6 w-6 ${
                                                        paymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-semibold text-gray-900">
                                                        {method.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {method.description}
                                                    </p>
                                                </div>
                                                {paymentMethod === method.id && (
                                                    <Check className="h-6 w-6 text-blue-600" />
                                                )}
                                            </div>
                                        </button>
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

                                {/* Cart Items */}
                                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-gray-500">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium text-gray-900 ml-2">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-3 mb-4">
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
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 'Place Order'}
                                </Button>

                                {/* Additional Info */}
                                <div className="mt-6 pt-6 border-t space-y-2 text-xs text-gray-500">
                                    <p>✓ Secure payment processing</p>
                                    <p>✓ Your data is encrypted</p>
                                    <p>✓ Order confirmation via email</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
