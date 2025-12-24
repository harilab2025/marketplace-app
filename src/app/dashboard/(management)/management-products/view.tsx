'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import {
    Loader2,
    ArrowLeft,
    Package,
    Tag,
    Ruler,
    Weight,
    Calendar,
    Copy,
    Check,
    Layers,
    Info
} from 'lucide-react';
import { SerializedEditorState } from 'lexical';

interface ProductFile {
    publicId: string;
    url: string;
    originalName: string;
    mimeType: string;
    size?: number;
}

interface Discount {
    publicId: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface Variant {
    publicId: string;
    name: string;
    sku: string;
    price: string;
    stock: number;
    isActive: boolean;
    discounts: Discount[];
}

interface Product {
    publicId: string;
    name: string;
    description: SerializedEditorState | string;
    price?: number;
    priceMin?: number;
    priceMax?: number;
    sku: string;
    stock: number;
    isActive: boolean;
    verificationStatus: string;
    category: {
        name: string;
        slug: string;
    };
    tags: string[];
    weight: string;
    dimensions: {
        width: string;
        height: string;
        length: string;
        unit: string;
    };
    files?: ProductFile[];
    variants: Variant[];
    discounts: Discount[];
    createdAt: string;
    updatedAt: string;
}

interface ViewProps {
    setActionContent: (content: string) => void;
    productId: string;
}

export default function View({ setActionContent, productId }: ViewProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [copiedSku, setCopiedSku] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/products/${productId}`);
                setProduct(response.data?.data || response.data);
            } catch (error: unknown) {
                const message = error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : 'Failed to fetch product';
                toast.error(message || 'Failed to fetch product');
                setActionContent('table');
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, setActionContent]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    const formatCurrency = (value: number | string) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num);
    };

    const calculateDiscountedPrice = (price: string, discount: Discount) => {
        const priceNum = parseFloat(price);
        if (discount.type === 'PERCENTAGE') {
            return priceNum - (priceNum * parseFloat(discount.value) / 100);
        }
        return priceNum - parseFloat(discount.value);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSku(true);
        setTimeout(() => setCopiedSku(false), 2000);
        toast.success('SKU copied to clipboard');
    };

    const getStatusBadge = (isActive: boolean) => {
        if (isActive === true) {
            return <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>;
        } else if (isActive === false) {
            return <Badge variant="destructive">Not Live</Badge>;
        }
        return <Badge variant="secondary">On Verification</Badge>;
    };

    const getVerificationBadge = (status: string) => {
        const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            'DRAFT': { label: 'Draft', variant: 'secondary' },
            'PENDING': { label: 'Pending Review', variant: 'outline' },
            'APPROVED': { label: 'Approved', variant: 'default' },
            'REJECTED': { label: 'Rejected', variant: 'destructive' },
            'PUBLISHED': { label: 'Published', variant: 'default' },
        };
        const config = variants[status] || { label: status, variant: 'secondary' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (isLoading) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading product details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <div className="text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Product not found</p>
                        <Button variant="outline" onClick={() => setActionContent('table')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Table
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => setActionContent('table')}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Table
                </Button>

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(product.isActive)}
                            {getVerificationBadge(product.verificationStatus)}
                            <Badge variant="outline" className="gap-1">
                                <Tag className="h-3 w-3" />
                                {product.category.name}
                            </Badge>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Price Range</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {product.price
                                ? formatCurrency(product.price)
                                : `${formatCurrency(product.priceMin || 0)} - ${formatCurrency(product.priceMax || 0)}`
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Images */}
                <div className="lg:col-span-1">
                    <Card className="p-4 sticky top-4">
                        {product.files && product.files.length > 0 ? (
                            <>
                                {/* Main Image */}
                                <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border mb-4">
                                    <Image
                                        src={`/api/image/${product.files[selectedImageIndex].publicId}`}
                                        alt={product.files[selectedImageIndex].originalName}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-contain p-2"
                                        priority
                                    />
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                        {selectedImageIndex + 1} / {product.files.length}
                                    </div>
                                </div>

                                {/* Thumbnail Gallery */}
                                {product.files.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {product.files.map((file, index) => (
                                            <button
                                                key={file.publicId}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Image
                                                    src={`/api/image/${file.publicId}`}
                                                    alt={file.originalName}
                                                    sizes="10vw"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <Package className="h-16 w-16 mx-auto mb-2" />
                                    <p className="text-sm">No images</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="variants">
                                Variants {product.variants?.length > 0 && `(${product.variants.length})`}
                            </TabsTrigger>
                            <TabsTrigger value="specs">Specs</TabsTrigger>
                            <TabsTrigger value="description">Description</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                            <Card className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* SKU */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="h-4 w-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-600">SKU</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                                                {product.sku}
                                            </code>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(product.sku)}
                                            >
                                                {copiedSku ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="h-4 w-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-600">Stock</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold">{product.stock}</span>
                                            <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "outline" : "destructive"}>
                                                {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Product ID */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="h-4 w-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-600">Product ID</label>
                                        </div>
                                        <code className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                            {product.publicId}
                                        </code>
                                    </div>
                                </div>
                            </Card>

                            {/* Timestamps */}
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Timestamps
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Created At</div>
                                        <div className="text-sm font-medium">{formatDate(product.createdAt)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                                        <div className="text-sm font-medium">{formatDate(product.updatedAt)}</div>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>

                        {/* Variants Tab */}
                        <TabsContent value="variants" className="space-y-4">
                            {product.variants && product.variants.length > 0 ? (
                                <div className="space-y-3">
                                    {product.variants.map((variant) => {
                                        const activeDiscount = variant.discounts.find(d => d.isActive);
                                        const discountedPrice = activeDiscount
                                            ? calculateDiscountedPrice(variant.price, activeDiscount)
                                            : null;

                                        return (
                                            <Card key={variant.publicId} className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-semibold">{variant.name}</h4>
                                                            {getStatusBadge(variant.isActive)}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            SKU: <code className="bg-gray-100 px-2 py-0.5 rounded">{variant.sku}</code>
                                                        </div>
                                                        <div className="flex items-baseline gap-2">
                                                            {discountedPrice ? (
                                                                <>
                                                                    <span className="text-lg font-bold text-blue-600">
                                                                        {formatCurrency(discountedPrice)}
                                                                    </span>
                                                                    <span className="text-sm text-gray-400 line-through">
                                                                        {formatCurrency(variant.price)}
                                                                    </span>
                                                                    <Badge variant="destructive" className="gap-1">
                                                                        {activeDiscount?.value}% OFF
                                                                    </Badge>
                                                                </>
                                                            ) : (
                                                                <span className="text-lg font-bold">
                                                                    {formatCurrency(variant.price)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500 mb-1">Stock</div>
                                                        <div className="text-xl font-semibold">{variant.stock}</div>
                                                    </div>
                                                </div>

                                                {/* Variant Discounts */}
                                                {variant.discounts.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <div className="text-xs font-semibold text-gray-600 mb-2">Active Discounts:</div>
                                                        <div className="space-y-1">
                                                            {variant.discounts.map((discount) => (
                                                                <div key={discount.publicId} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded flex items-center justify-between">
                                                                    <span>
                                                                        {discount.type === 'PERCENTAGE' ? `${discount.value}%` : formatCurrency(discount.value)} OFF
                                                                    </span>
                                                                    <span className="text-gray-500">
                                                                        {new Date(discount.startDate).toLocaleDateString('id-ID')} - {new Date(discount.endDate).toLocaleDateString('id-ID')}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Card className="p-8">
                                    <div className="text-center text-gray-400">
                                        <Layers className="h-12 w-12 mx-auto mb-2" />
                                        <p>No variants available</p>
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Specifications Tab */}
                        <TabsContent value="specs" className="space-y-4">
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Ruler className="h-4 w-4" />
                                    Physical Properties
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Weight */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Weight className="h-4 w-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-600">Weight</label>
                                        </div>
                                        <p className="text-lg">{product.weight} kg</p>
                                    </div>

                                    {/* Dimensions */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Ruler className="h-4 w-4 text-gray-500" />
                                            <label className="text-sm font-semibold text-gray-600">Dimensions</label>
                                        </div>
                                        <p className="text-lg">
                                            {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <Card className="p-6">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Description Tab */}
                        <TabsContent value="description">
                            <Card className="p-6">
                                <div className="prose prose-sm max-w-none">
                                    {typeof product.description === 'string' ? (
                                        <p className="whitespace-pre-wrap text-gray-700">{product.description}</p>
                                    ) : (
                                        <div className="text-gray-700">
                                            {/* Rich text description - can be enhanced with proper Lexical renderer */}
                                            <p className="text-sm text-gray-500 italic">Rich text description available</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
