'use client'
import { useEffect, useState } from 'react';
import EditorPage, { initialValue } from '@/components/richtextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/axios';
import { SerializedEditorState } from 'lexical';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, LucideChevronDown, LucideChevronUp, Percent, Plus, Trash2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface EditProductInput {
    name: string;
    description: SerializedEditorState;
    price: string;
    sku: string;
    stock: number;
    categoryId: string;
    isActive: boolean;
}

interface EditVariant {
    id: number;
    name: string;
    sku: string;
    price: string;
    stock: string;
    attributes: Record<string, string>;
    isActive: boolean;
    discounts: EditDiscount[];
}

interface EditDiscount {
    id: number;
    variantId: number | null;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface EditAttribute {
    key: string;
    value: string;
}

interface Category {
    id: number;
    name: string;
}

interface EditProps {
    setActionContent: (content: string) => void;
    productId: string;
    onSuccess: () => void;
}

function Edit({ setActionContent, productId, onSuccess }: EditProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [variants, setVariants] = useState<EditVariant[]>([]);
    const [discounts, setDiscounts] = useState<EditDiscount[]>([]);
    const [showVariants, setShowVariants] = useState(false);
    const [showDiscounts, setShowDiscounts] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm<EditProductInput>({
        defaultValues: {
            name: '',
            description: initialValue,
            price: '',
            sku: '',
            stock: 0,
            categoryId: '',
            isActive: false
        },
        mode: 'onBlur'
    });

    // Computed value: check if product has variants
    const hasVariants = variants.length > 0;

    // Helper function to calculate discounted price
    const calculateDiscountedPrice = (price: number, discount: EditDiscount): number => {
        if (!discount.value || !discount.isActive) return price;

        const discountValue = parseFloat(discount.value);
        if (isNaN(discountValue)) return price;

        if (discount.type === 'PERCENTAGE') {
            return price - (price * discountValue / 100);
        } else {
            return Math.max(0, price - discountValue);
        }
    };

    // Calculate price range from variants
    const calculatePriceRange = () => {
        if (!hasVariants || variants.length === 0) {
            return null;
        }

        const prices = variants.map(v => {
            const price = parseFloat(v.price) || 0;
            const activeDiscount = v.discounts.find(d => d.isActive);

            if (activeDiscount && activeDiscount.value) {
                return calculateDiscountedPrice(price, activeDiscount);
            }
            return price;
        }).filter(p => p > 0);

        if (prices.length === 0) return null;

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (min === max) {
            return `Rp ${min.toLocaleString('id-ID')}`;
        }
        return `Rp ${min.toLocaleString('id-ID')} - Rp ${max.toLocaleString('id-ID')}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch categories
                const categoriesResponse = await apiClient.get('/categories');
                setCategories(categoriesResponse.data.categories || []);

                // Fetch product with variants and discounts
                const response = await apiClient.get(`/products/${productId}`);
                const product = response.data;

                reset({
                    name: product.name || '',
                    description: product.description || initialValue,
                    price: product.price?.toString() || '',
                    sku: product.sku || '',
                    stock: product.stock || 0,
                    categoryId: product.categoryId?.toString() || '',
                    isActive: product.isActive || false
                });

                // Load variants if exists
                if (product.variants && product.variants.length > 0) {
                    const loadedVariants = product.variants.map((v: any) => ({
                        id: v.id || Date.now(),
                        name: v.name || '',
                        sku: v.sku || '',
                        price: v.price?.toString() || '',
                        stock: v.stock?.toString() || '0',
                        attributes: v.attributes || {},
                        isActive: v.isActive !== undefined ? v.isActive : true,
                        discounts: v.discounts ? v.discounts.map((d: any) => ({
                            id: d.id || Date.now(),
                            variantId: v.id,
                            type: d.type || 'PERCENTAGE',
                            value: d.value?.toString() || '',
                            startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
                            endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
                            isActive: d.isActive !== undefined ? d.isActive : true
                        })) : []
                    }));
                    setVariants(loadedVariants);
                    setShowVariants(true);
                }

                // Load parent discounts if exists
                if (product.discounts && product.discounts.length > 0) {
                    const loadedDiscounts = product.discounts
                        .filter((d: any) => !d.variantId)
                        .map((d: any) => ({
                            id: d.id || Date.now(),
                            variantId: null,
                            type: d.type || 'PERCENTAGE',
                            value: d.value?.toString() || '',
                            startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
                            endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
                            isActive: d.isActive !== undefined ? d.isActive : true
                        }));
                    setDiscounts(loadedDiscounts);
                    if (loadedDiscounts.length > 0) {
                        setShowDiscounts(true);
                    }
                }
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
            fetchData();
        }
    }, [productId, reset, setActionContent]);

    // Variant management functions
    const addVariant = () => {
        // If this is the first variant, reset parent discounts
        if (variants.length === 0) {
            setDiscounts([]);
        }

        setVariants((prev) => [...prev, {
            id: Date.now(),
            name: '',
            sku: '',
            price: '',
            stock: '0',
            attributes: {},
            isActive: true,
            discounts: []
        }]);
    };

    const removeVariant = (id: number) => {
        setVariants((prev) => prev.filter(v => v.id !== id));
    };

    const updateVariant = (id: number, field: keyof EditVariant, value: any) => {
        setVariants((prev) =>
            prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
        );
    };

    const addAttributeToVariant = (variantId: number) => {
        setVariants((prev) =>
            prev.map(v => {
                if (v.id === variantId) {
                    return {
                        ...v,
                        attributes: { ...v.attributes, '': '' }
                    };
                }
                return v;
            })
        );
    };

    const updateVariantAttribute = (variantId: number, oldKey: string, newKey: string, value: string) => {
        setVariants((prev) =>
            prev.map(v => {
                if (v.id === variantId) {
                    const newAttributes = { ...v.attributes };
                    if (oldKey !== newKey) {
                        delete newAttributes[oldKey];
                    }
                    newAttributes[newKey] = value;
                    return { ...v, attributes: newAttributes };
                }
                return v;
            })
        );
    };

    const removeVariantAttribute = (variantId: number, key: string) => {
        setVariants((prev) =>
            prev.map(v => {
                if (v.id === variantId) {
                    const newAttributes = { ...v.attributes };
                    delete newAttributes[key];
                    return { ...v, attributes: newAttributes };
                }
                return v;
            })
        );
    };

    // Discount management functions
    const addDiscount = (variantId: number | null = null) => {
        const newDiscount: EditDiscount = {
            id: Date.now(),
            variantId,
            type: 'PERCENTAGE',
            value: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true
        };

        if (variantId) {
            // Add discount to specific variant
            setVariants((prev) =>
                prev.map(v => {
                    if (v.id === variantId) {
                        return {
                            ...v,
                            discounts: [...v.discounts, newDiscount]
                        };
                    }
                    return v;
                })
            );
        } else {
            // Add parent discount
            setDiscounts((prev) => [...prev, newDiscount]);
        }
    };

    const removeDiscount = (discountId: number, variantId: number | null = null) => {
        if (variantId) {
            // Remove from variant
            setVariants((prev) =>
                prev.map(v => {
                    if (v.id === variantId) {
                        return {
                            ...v,
                            discounts: v.discounts.filter(d => d.id !== discountId)
                        };
                    }
                    return v;
                })
            );
        } else {
            // Remove from parent
            setDiscounts((prev) => prev.filter(d => d.id !== discountId));
        }
    };

    const updateDiscount = (discountId: number, field: keyof EditDiscount, value: any, variantId: number | null = null) => {
        if (variantId) {
            // Update variant discount
            setVariants((prev) =>
                prev.map(v => {
                    if (v.id === variantId) {
                        return {
                            ...v,
                            discounts: v.discounts.map(d =>
                                d.id === discountId ? { ...d, [field]: value } : d
                            )
                        };
                    }
                    return v;
                })
            );
        } else {
            // Update parent discount
            setDiscounts((prev) =>
                prev.map(d => (d.id === discountId ? { ...d, [field]: value } : d))
            );
        }
    };

    const onSubmit = async (data: EditProductInput): Promise<void> => {
        try {
            setIsSubmitting(true);

            // Prepare variants data
            const variantsData = variants.map(v => ({
                name: v.name,
                sku: v.sku,
                price: parseFloat(v.price) || 0,
                stock: parseInt(v.stock) || 0,
                attributes: v.attributes,
                isActive: v.isActive,
                discounts: v.discounts.map(d => ({
                    type: d.type,
                    value: parseFloat(d.value) || 0,
                    startDate: new Date(d.startDate),
                    endDate: new Date(d.endDate),
                    isActive: d.isActive
                }))
            }));

            // Prepare parent discounts data
            const discountsData = discounts.map(d => ({
                type: d.type,
                value: parseFloat(d.value) || 0,
                startDate: new Date(d.startDate),
                endDate: new Date(d.endDate),
                isActive: d.isActive
            }));

            const sendData = {
                ...data,
                description: data.description,
                price: hasVariants ? null : Number(data.price),
                stock: Number(data.stock),
                categoryId: parseInt(data.categoryId),
                variants: variantsData,
                discounts: discountsData
            };

            await apiClient.put(`/products/${productId}`, sendData);
            toast.success('Product updated successfully');
            onSuccess();
            setActionContent('table');
        } catch (error: unknown) {
            const message = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Failed to update product';
            toast.error(message || 'Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white border rounded-md">
                <div className="flex items-center justify-center h-[calc(100vh-300px)]">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white border rounded-md">
            <div className="grid w-full [&>div]:h-[calc(100vh-300px)] py-3">
                <div className='w-full h-full flex flex-col overflow-auto'>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full max-w-4xl p-4">
                        {/* Basic Information */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="name">PRODUCT NAME</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Product Name"
                                    {...register("name", { required: "Product name is required" })}
                                    autoComplete="name"
                                    className={errors.name ? "border-red-500" : ""}
                                    disabled={isSubmitting}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="category">CATEGORY</Label>
                                <Controller
                                    name="categoryId"
                                    control={control}
                                    rules={{ required: "Category is required" }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.categoryId && (
                                    <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="description">DESCRIPTION</Label>
                                <Controller
                                    name="description"
                                    control={control}
                                    rules={{
                                        validate: value =>
                                            value?.root?.children?.length > 0 ||
                                            "Description cannot be empty"
                                    }}
                                    render={({ field: { value, onChange } }) => (
                                        <EditorPage
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </section>

                        {/* Pricing & Inventory */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Pricing & Inventory</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="price">
                                        PRICE {hasVariants && <span className="text-xs text-gray-500">(Range from variants)</span>}
                                    </Label>
                                    {hasVariants ? (
                                        <Input
                                            id="price"
                                            type="text"
                                            value={calculatePriceRange() || 'Add variant prices'}
                                            readOnly
                                            disabled
                                            className="bg-gray-100 cursor-not-allowed"
                                        />
                                    ) : (
                                        <Input
                                            id="price"
                                            type="text"
                                            placeholder="Price"
                                            {...register("price", {
                                                required: !hasVariants && "Price is required",
                                                pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format" }
                                            })}
                                            autoComplete="price"
                                            className={errors.price ? "border-red-500" : ""}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                    {!hasVariants && errors.price && (
                                        <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                                    )}
                                    {hasVariants && (
                                        <p className="text-xs text-gray-500">
                                            💡 With variants: Price shows as range from all variant prices
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        type="text"
                                        placeholder="SKU"
                                        {...register("sku", { required: "SKU is required" })}
                                        autoComplete="sku"
                                        className={errors.sku ? "border-red-500" : ""}
                                        disabled={isSubmitting}
                                    />
                                    {errors.sku && (
                                        <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="stock">STOCK</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        placeholder="Stock"
                                        {...register("stock", { required: "Stock is required" })}
                                        autoComplete="stock"
                                        className={errors.stock ? "border-red-500" : ""}
                                        disabled={isSubmitting}
                                    />
                                    {errors.stock && (
                                        <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Parent Discount - Only show when NO variants */}
                        {!hasVariants && (
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h2 className="text-xl font-semibold text-gray-800">Discount</h2>
                                    <Button
                                        type="button"
                                        onClick={() => setShowDiscounts(!showDiscounts)}
                                        variant='ghost'
                                    >
                                        {showDiscounts ? <LucideChevronUp /> : <LucideChevronDown />}
                                    </Button>
                                </div>

                                {showDiscounts && (
                                    <div className="space-y-3">
                                        <Button
                                            type="button"
                                            onClick={() => addDiscount(null)}
                                            variant="outline"
                                            size="sm"
                                            disabled={isSubmitting}
                                        >
                                            <Plus size={16} className="mr-2" />
                                            Add Discount
                                        </Button>

                                        {discounts.map((discount) => (
                                            <div key={discount.id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                                        <Percent size={16} className="text-gray-600" />
                                                        Product Discount
                                                    </h4>
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeDiscount(discount.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        <Label>Type</Label>
                                                        <Select
                                                            value={discount.type}
                                                            onValueChange={(value) => updateDiscount(discount.id, 'type', value as 'PERCENTAGE' | 'FIXED_AMOUNT')}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                                                <SelectItem value="FIXED_AMOUNT">Fixed Amount (Rp)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <Label>
                                                            Discount Value {discount.type === 'PERCENTAGE' ? '(%)' : '(Rp)'}
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={discount.value}
                                                            onChange={(e) => updateDiscount(discount.id, 'value', e.target.value)}
                                                            placeholder={discount.type === 'PERCENTAGE' ? '0 - 100' : '0'}
                                                            step="0.01"
                                                            min="0"
                                                            max={discount.type === 'PERCENTAGE' ? '100' : undefined}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <Label>Start Date</Label>
                                                        <Input
                                                            type="date"
                                                            value={discount.startDate}
                                                            onChange={(e) => updateDiscount(discount.id, 'startDate', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <Label>End Date</Label>
                                                        <Input
                                                            type="date"
                                                            value={discount.endDate}
                                                            onChange={(e) => updateDiscount(discount.id, 'endDate', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 mt-3">
                                                    <Checkbox
                                                        id={`discount-active-${discount.id}`}
                                                        checked={discount.isActive}
                                                        onCheckedChange={(value) => updateDiscount(discount.id, 'isActive', value)}
                                                    />
                                                    <label htmlFor={`discount-active-${discount.id}`} className="text-sm text-gray-700">
                                                        Active
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Variants Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h2 className="text-xl font-semibold text-gray-800">Product Variants</h2>
                                <Button
                                    type="button"
                                    onClick={() => setShowVariants(!showVariants)}
                                    variant='ghost'
                                >
                                    {showVariants ? <LucideChevronUp /> : <LucideChevronDown />}
                                </Button>
                            </div>

                            {showVariants && (
                                <div className="space-y-4">
                                    <Button
                                        type="button"
                                        onClick={addVariant}
                                        variant="outline"
                                        size="sm"
                                        disabled={isSubmitting}
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Add Variant
                                    </Button>

                                    {hasVariants && (
                                        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                            💡 With variants: Discount applies per variant, price shows as range
                                        </p>
                                    )}

                                    {variants.map((variant, index) => (
                                        <div key={variant.id} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-semibold text-gray-800">Variant {index + 1}</h3>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeVariant(variant.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <Label>Variant Name</Label>
                                                    <Input
                                                        type="text"
                                                        value={variant.name}
                                                        onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                                        placeholder="e.g., Red - Large"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <Label>SKU</Label>
                                                    <Input
                                                        type="text"
                                                        value={variant.sku}
                                                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                        placeholder="Variant SKU"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <Label>Price</Label>
                                                    <Input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                                                        placeholder="0"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <Label>Stock</Label>
                                                    <Input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 mt-3">
                                                <Checkbox
                                                    id={`variant-active-${variant.id}`}
                                                    checked={variant.isActive}
                                                    onCheckedChange={(value) => updateVariant(variant.id, 'isActive', value)}
                                                />
                                                <label htmlFor={`variant-active-${variant.id}`} className="text-sm text-gray-700">
                                                    Active
                                                </label>
                                            </div>

                                            {/* Variant Attributes */}
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-sm font-medium">Attributes</Label>
                                                    <Button
                                                        type="button"
                                                        onClick={() => addAttributeToVariant(variant.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Plus size={14} className="mr-1" />
                                                        Add Attribute
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    {Object.entries(variant.attributes).map(([key, value]) => (
                                                        <div key={key} className="flex gap-2">
                                                            <Input
                                                                type="text"
                                                                value={key}
                                                                onChange={(e) => updateVariantAttribute(variant.id, key, e.target.value, value)}
                                                                placeholder="Attribute name (e.g., Color)"
                                                                className="flex-1"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={value}
                                                                onChange={(e) => updateVariantAttribute(variant.id, key, key, e.target.value)}
                                                                placeholder="Value (e.g., Red)"
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={() => removeVariantAttribute(variant.id, key)}
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <X size={16} />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Variant Discounts */}
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-sm font-medium">Variant Discounts</Label>
                                                    <Button
                                                        type="button"
                                                        onClick={() => addDiscount(variant.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Plus size={14} className="mr-1" />
                                                        Add Discount to Variant
                                                    </Button>
                                                </div>

                                                {variant.discounts && variant.discounts.length > 0 && (
                                                    <div className="mt-3 space-y-3">
                                                        {variant.discounts.map((vDiscount, idx) => (
                                                            <div key={vDiscount.id} className="bg-zinc-50 p-4 rounded-lg border-2 border-zinc-200">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                                                        <Percent size={16} className="text-zinc-600" />
                                                                        Variant Discount {idx + 1}
                                                                    </h4>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => removeDiscount(vDiscount.id, variant.id)}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                    >
                                                                        <X size={16} />
                                                                    </Button>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <div className="flex flex-col gap-1">
                                                                        <Label>Type</Label>
                                                                        <Select
                                                                            value={vDiscount.type}
                                                                            onValueChange={(value) => updateDiscount(vDiscount.id, 'type', value as 'PERCENTAGE' | 'FIXED_AMOUNT', variant.id)}
                                                                        >
                                                                            <SelectTrigger className="w-full">
                                                                                <SelectValue placeholder="Select type" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                                                                <SelectItem value="FIXED_AMOUNT">Fixed Amount (Rp)</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="flex flex-col gap-1">
                                                                        <Label>
                                                                            Discount Value {vDiscount.type === 'PERCENTAGE' ? '(%)' : '(Rp)'}
                                                                        </Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={vDiscount.value}
                                                                            onChange={(e) => updateDiscount(vDiscount.id, 'value', e.target.value, variant.id)}
                                                                            placeholder={vDiscount.type === 'PERCENTAGE' ? '0 - 100' : '0'}
                                                                            step="0.01"
                                                                            min="0"
                                                                            max={vDiscount.type === 'PERCENTAGE' ? '100' : undefined}
                                                                        />
                                                                    </div>

                                                                    <div className="flex flex-col gap-1">
                                                                        <Label>Start Date</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={vDiscount.startDate}
                                                                            onChange={(e) => updateDiscount(vDiscount.id, 'startDate', e.target.value, variant.id)}
                                                                        />
                                                                    </div>

                                                                    <div className="flex flex-col gap-1">
                                                                        <Label>End Date</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={vDiscount.endDate}
                                                                            onChange={(e) => updateDiscount(vDiscount.id, 'endDate', e.target.value, variant.id)}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center space-x-2 mt-3">
                                                                    <Checkbox
                                                                        id={`variant-discount-active-${vDiscount.id}`}
                                                                        checked={vDiscount.isActive}
                                                                        onCheckedChange={(value) => updateDiscount(vDiscount.id, 'isActive', value, variant.id)}
                                                                    />
                                                                    <label htmlFor={`variant-discount-active-${vDiscount.id}`} className="text-sm text-gray-700">
                                                                        Active
                                                                    </label>
                                                                </div>

                                                                {variant.price && vDiscount.value && (
                                                                    <div className="bg-white p-3 rounded border border-blue-200 mt-3">
                                                                        <p className="text-xs text-gray-600 mb-1">Preview Price:</p>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-sm text-gray-400 line-through">
                                                                                Rp {parseFloat(variant.price).toLocaleString('id-ID')}
                                                                            </span>
                                                                            <span className="text-base font-bold text-blue-600">
                                                                                Rp {calculateDiscountedPrice(parseFloat(variant.price), vDiscount).toLocaleString('id-ID')}
                                                                            </span>
                                                                            <span className="text-xs text-green-600">
                                                                                (Save Rp {(parseFloat(variant.price) - calculateDiscountedPrice(parseFloat(variant.price), vDiscount)).toLocaleString('id-ID')})
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Submit Buttons */}
                        <div className='flex space-x-4'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => setActionContent('table')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Product'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Edit;
