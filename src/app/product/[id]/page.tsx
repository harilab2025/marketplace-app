'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, Plus, Minus, Package, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/axios';

interface Product {
    publicId: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    isActive: boolean;
    description?: string;
    category?: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
}

export default function ProductPreviewPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/products/${params.id}`);
                setProduct(response.data.data);
            } catch (error) {
                toast.error('Failed to load product');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;

        toast.success(`Added ${quantity} ${product.name} to cart`);
        // TODO: Implement cart logic
    };

    const handleBuyNow = () => {
        if (!product) return;

        // TODO: Implement buy now logic
        router.push('/checkout');
    };

    const incrementQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-24 mb-8" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="aspect-square bg-gray-200 rounded-lg" />
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-3/4" />
                                <div className="h-6 bg-gray-200 rounded w-1/4" />
                                <div className="h-12 bg-gray-200 rounded w-1/3" />
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded" />
                                    <div className="h-4 bg-gray-200 rounded" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
                    <Button onClick={() => router.push('/catalog')}>Back to Catalog</Button>
                </div>
            </div>
        );
    }

    const mockImages = [
        '📦', '📸', '🎁', '🛍️'
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Product Details */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center text-9xl">
                                {mockImages[selectedImage]}
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        <div className="grid grid-cols-4 gap-4">
                            {mockImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center text-4xl ${
                                        selectedImage === index ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                >
                                    {img}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>

                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                                Rp {product.price.toLocaleString('id-ID')}
                            </span>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                product.stock > 10 ? 'bg-green-100 text-green-800' :
                                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {product.stock > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={decrementQuantity}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-lg font-semibold w-12 text-center">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={incrementQuantity}
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-gray-500 ml-2">
                                        Max: {product.stock}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 flex items-center justify-center gap-2"
                                variant="outline"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                className="flex-1"
                            >
                                Buy Now
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="border-t pt-6 space-y-3">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Package className="h-5 w-5 text-blue-500" />
                                <span className="text-sm">Free shipping for orders over Rp 100,000</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Shield className="h-5 w-5 text-blue-500" />
                                <span className="text-sm">100% Original product guarantee</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Truck className="h-5 w-5 text-blue-500" />
                                <span className="text-sm">Fast delivery 2-3 business days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
