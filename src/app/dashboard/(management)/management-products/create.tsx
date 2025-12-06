'use client'
import PhotoGalleryOrganizer from '@/components/gallery.photos';
import EditorPage, { initialValue } from '@/components/richtextEditor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useConfirm } from '@/context/dashboard/useConfirm';
import { useLoadingUtils } from '@/context/dashboard/useLoading';
import { apiClient } from '@/lib/axios';
import { objectToFormData } from '@/utils/formData.helper';
import { AxiosError } from 'axios';
import { SerializedEditorState } from 'lexical';
import { InfoIcon, LucideChevronDown, LucideChevronUp, Percent, Plus, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface createProductInput {
    category: string;
    name: string;
    description: SerializedEditorState;
    price: string;
    sku: string;
    stock: number;
    weight: number;
    isActive: boolean;
    dimensions?: {
        length?: string;
        width?: string;
        height?: string;
        unit?: string;
    };
    tags?: Array<string>;
    variants?: Array<{
        id: number;
        name: string;
        sku: string;
        price: string;
        stock: number;
        attributes: Record<string, string>;
        isActive: boolean;
    }>;
}

interface ErrorResponse {
    message: string;
}

interface CreateVariant {
    id: number;
    name: string;
    sku: string;
    price: string;
    stock: number;
    attributes: Record<string, string>;
    isActive: boolean;
    discounts?: CreateDiscount[];
}

interface CreateDiscount {
    id: number;
    variantId: number | null;
    type: 'PERCENTAGE' | 'FIXED';
    value: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}


function Create({ setActionContent }: { setActionContent: (content: string) => void }) {
    const [newTag, setNewTag] = useState('');
    const [Tags_value, setTags_value] = useState<string[]>([]);
    const [variants, setVariants] = useState<CreateVariant[]>([]);
    const [showVariants, setShowVariants] = useState(true);
    const [discounts, setDiscounts] = useState<CreateDiscount[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [showDiscounts, setShowDiscounts] = useState(true);
    const { confirm } = useConfirm();
    const {
        hide,
        showSaving,
    } = useLoadingUtils();
    const {
        register,
        reset,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<createProductInput>({
        defaultValues: {
            category: '',
            name: '',
            description: initialValue,
            price: '',
            sku: '',
            stock: 0,
            weight: 0,
            isActive: false,
            dimensions: {
                length: '',
                width: '',
                height: '',
                unit: 'cm'
            }
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: createProductInput): Promise<void> => {
        await confirm({
            title: "Confirm adding product",
            description: "Do you want to adding this product?",
            confirmText: "Yes",
            cancelText: "No",
            onConfirm: async () => {
                try {
                    showSaving('Saving your data...');
                    //name,    sku,    price,    stock,    weight,    isActive,    description,    tags,    dimensions
                    const sendData = {
                        ...data,
                        description: data.description,
                        stock: Number(data.stock),
                        price: data.price,
                        weight: Number(data.weight),
                        tags: Tags_value,
                        variants: variants
                    }
                    const formData = objectToFormData(sendData, files);
                    console.log(sendData);
                    // const res = { status: 201 };
                    const res = await apiClient.post(`/products`, formData);
                    hide();
                    if (res.status !== 201) {
                        toast.error('Failed to create product');
                        return;
                    }
                    toast.success('Product created successfully');

                    reset();
                    setActionContent('table');
                } catch (error: AxiosError | unknown) {
                    setTimeout(() => {
                        hide();
                        const message = (error as AxiosError<ErrorResponse>)?.response?.data?.message || (error as Error).message || 'Unknown error';
                        toast.error('error creating product : ' + message);
                    }, 1000);
                }
            },
        });
    }

    const addTag = () => {
        if (newTag.trim() && !Tags_value.includes(newTag.trim())) {
            setTags_value(prev => [...prev, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags_value(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const addVariant = () => {
        setVariants((prev) => [...prev, {
            id: Date.now(),
            name: '',
            sku: '',
            price: '',
            stock: 0,
            attributes: {},
            isActive: true,
            discounts: []
        }]);
    };

    const updateVariant = (id: number, field: string, value: string | number | boolean) => {
        setVariants(prev => prev.map(variant =>
            variant.id === id ? { ...variant, [field]: value } : variant
        ));
    };

    const removeVariant = (id: number) => {
        setVariants(prev => prev.filter(variant => variant.id !== id));
    };

    const calculateDiscountedPrice = (price: number, discount: CreateDiscount) => {
        if (!discount || !discount.isActive) return price;

        const now = new Date();
        const start = new Date(discount.startDate);
        const end = new Date(discount.endDate);

        if (now < start || now > end) return price;

        if (discount.type === 'PERCENTAGE') {
            return price - (price * parseFloat(discount.value) / 100);
        } else {
            return price - parseFloat(discount.value);
        }
    };

    const getActiveDiscount = (discountsList: CreateDiscount[]) => {
        if (!discountsList || discountsList.length === 0) return null;

        const now = new Date();
        return discountsList.find(d => {
            const start = new Date(d.startDate);
            const end = new Date(d.endDate);
            return d.isActive && now >= start && now <= end;
        });
    };

    const addDiscount = (variantId: number | null = null) => {
        const newDiscount: CreateDiscount = {
            id: Date.now(),
            variantId: variantId,
            type: 'PERCENTAGE',
            value: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true
        };

        if (variantId) {
            setVariants(prev => prev.map(v =>
                v.id === variantId
                    ? { ...v, discounts: [...(v.discounts || []), newDiscount] as CreateDiscount[] }
                    : v
            ));
        } else {
            setDiscounts(prev => [...prev, newDiscount]);
        }
    };

    const updateDiscount = (discountId: number, field: string, value: string | number | boolean, variantId: number | null = null) => {
        if (variantId) {
            setVariants(prev => prev.map(v =>
                v.id === variantId
                    ? {
                        ...v,
                        discounts: (v.discounts ?? []).map(d =>
                            d.id === discountId ? { ...d, [field]: value } : d
                        )
                    }
                    : v
            ));
        } else {
            setDiscounts(prev => prev.map(d =>
                d.id === discountId ? { ...d, [field]: value } : d
            ));
        }
    };

    const removeDiscount = (discountId: number, variantId: number | null = null) => {
        if (variantId) {
            setVariants(prev => prev.map(v =>
                v.id === variantId
                    ? { ...v, discounts: (v.discounts ?? []).filter(d => d.id !== discountId) }
                    : v
            ));
        } else {
            setDiscounts(prev => prev.filter(d => d.id !== discountId));
        }
    };
    return (
        <div className='relative w-full h-full'>
            <form onSubmit={handleSubmit(onSubmit)} className="absolute h-[calc(100vh-200px)] w-full grid grid-cols-1 overflow-y-auto overflow-hidden bg-white border rounded-md">
                <div className='w-full h-full p-4'>
                    {/* Photos */}
                    <section className="h-full space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">Photos</h2>
                        <PhotoGalleryOrganizer getFiles={(newFiles) => {
                            setFiles(newFiles);
                        }} />
                    </section>
                </div>
                <div className='w-full h-full flex flex-col p-4 space-y-8'>
                    {/* General Information */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">General Information</h2>
                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Product Name */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="name">PRODUCT NAME</Label>
                                <InputGroup>
                                    <InputGroupInput
                                        placeholder="example : smartphone"
                                        id="name"
                                        {...register("name", { required: "Product name is required" })}
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <InputGroupButton className="rounded-full" size="icon-xs">
                                                    <InfoIcon className="h-4 w-4" />
                                                </InputGroupButton>
                                            </TooltipTrigger>
                                            <TooltipContent>Required</TooltipContent>
                                        </Tooltip>
                                    </InputGroupAddon>
                                </InputGroup>

                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>
                            {/* SKU */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="sku">SKU</Label>
                                <InputGroup>
                                    <InputGroupInput
                                        placeholder="example : PRS-001"
                                        id="sku"
                                        {...register("sku", { required: "SKU is required" })}
                                        className={errors.sku ? "border-red-500" : ""}
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <InputGroupButton className="rounded-full" size="icon-xs">
                                                    <InfoIcon className="h-4 w-4" />
                                                </InputGroupButton>
                                            </TooltipTrigger>
                                            <TooltipContent>Required</TooltipContent>
                                        </Tooltip>
                                    </InputGroupAddon>
                                </InputGroup>
                                {errors.sku && (
                                    <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
                                )}
                            </div>
                            {/* Price */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="price">PRICE</Label>
                                <Input
                                    id="price"
                                    type="text"
                                    placeholder="Price"
                                    {...register("price", { required: "Price is required", pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format (only numbers are allowed)" } })}
                                    autoComplete="price"
                                    className={errors.price ? "border-red-500" : ""}
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                                )}
                            </div>
                            {/* Stock */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="stock">STOCK</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    placeholder="Stock"
                                    {...register("stock", { required: "Stock is required" })}
                                    autoComplete="stock"
                                    className={errors.stock ? "border-red-500" : ""}
                                />
                                {errors.stock && (
                                    <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                                )}
                            </div>
                            {/* Category */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="category">CATEGORY</Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{
                                        validate: value =>
                                            value ? true : "Category is required"
                                    }}
                                    render={({ field: { value, onChange } }) => (
                                        <Select value={value} onValueChange={onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="electronics">Electronics</SelectItem>
                                                <SelectItem value="clothing">Clothing</SelectItem>
                                                <SelectItem value="home_appliances">Home Appliances</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category && (
                                    <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                                )}
                            </div>
                            {/* Weight */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="weight">{`WEIGHT (kg)`}</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder="Weight"
                                    {...register("weight", { required: "Weight is required" })}
                                    autoComplete="weight"
                                    className={errors.weight ? "border-red-500" : ""}
                                />
                                {errors.weight && (
                                    <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>
                                )}
                            </div>
                        </div>
                        {/* Status Product */}
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="isActive">STATUS</Label>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Switch
                                        checked={value}
                                        onCheckedChange={onChange}
                                    />
                                )}
                            />
                        </div>
                    </section>
                    {/* Description */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">Description</h2>
                        <div className="w-full flex flex-col gap-4">
                            {/* Description */}
                            <div className="flex flex-col gap-1">
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
                                            limitChars={5000}
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </div>
                    </section>
                    {/* Dimensions */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">Dimensions</h2>
                        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Length */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="length">LENGTH</Label>
                                <Input
                                    id="length"
                                    type="text"
                                    placeholder="Length"
                                    {...register("dimensions.length", { required: "Length is required", pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format (only numbers are allowed)" } })}
                                    autoComplete="length"
                                    className={errors.dimensions?.length ? "border-red-500" : ""}
                                />
                                {errors.dimensions?.length && (
                                    <p className="text-red-500 text-xs mt-1">{errors.dimensions.length.message}</p>
                                )}
                            </div>
                            {/* Width */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="width">WIDTH</Label>
                                <Input
                                    id="width"
                                    type="text"
                                    placeholder="Width"
                                    {...register("dimensions.width", { required: "Width is required", pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format (only numbers are allowed)" } })}
                                    autoComplete="width"
                                    className={errors.dimensions?.width ? "border-red-500" : ""}
                                />
                                {errors.dimensions?.width && (
                                    <p className="text-red-500 text-xs mt-1">{errors.dimensions.width.message}</p>
                                )}
                            </div>
                            {/* Height */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="height">HEIGHT</Label>
                                <Input
                                    id="height"
                                    type="text"
                                    placeholder="Height"
                                    {...register("dimensions.height", { required: "Height is required", pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format (only numbers are allowed)" } })}
                                    autoComplete="height"
                                    className={errors.dimensions?.height ? "border-red-500" : ""}
                                />
                                {errors.dimensions?.height && (
                                    <p className="text-red-500 text-xs mt-1">{errors.dimensions.height.message}</p>
                                )}
                            </div>
                            {/* unit of measurement */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="unit">UNIT</Label>
                                <Controller
                                    name="dimensions.unit"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <Select value={value || 'cm'} onValueChange={onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cm">cm</SelectItem>
                                                <SelectItem value="m">m</SelectItem>
                                                <SelectItem value="in">in</SelectItem>
                                                <SelectItem value="ft">ft</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.dimensions?.unit && (
                                    <p className="text-red-500 text-xs mt-1">{errors.dimensions.unit.message}</p>
                                )}
                            </div>
                        </div>
                    </section>
                    {/* Tags */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">Tags</h2>
                        <div className='w-full flex space-x-2'>
                            <Input
                                id="tags"
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                placeholder="Add a tag and press Enter"
                            />
                            <Button type="button" onClick={addTag}>
                                <Tag size={20} />Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Tags_value.map((tag, index) => (
                                <span key={index} className='bg-primary text-primary-foreground h-7 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium'>
                                    {tag} <X size={15} className='ml-2 cursor-pointer hover:opacity-50' onClick={() => removeTag(tag)} />
                                </span>
                            ))}
                        </div>
                    </section>
                    {/* Discount */}
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
                            <div className="space-y-4">
                                <Button
                                    type="button"
                                    onClick={() => addDiscount()}
                                    variant="outline"
                                    className='w-full border-dashed'
                                >
                                    <Plus size={20} />
                                    Add Discount
                                </Button>

                                {discounts.map((discount, index) => (
                                    <div key={discount.id} className="bg-zinc-50 p-4 rounded-lg space-y-3 border-2 border-zinc-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-700 flex items-center gap-2">
                                                <Percent size={16} className="text-zinc-600" />
                                                Discount {index + 1}
                                            </h3>
                                            <Button
                                                type="button"
                                                onClick={() => removeDiscount(discount.id)}
                                                variant="ghost">
                                                <X size={20} />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <Label>Type</Label>
                                                <Select value={discount.type} onValueChange={(value) => updateDiscount(discount.id, 'type', value as 'PERCENTAGE' | 'FIXED')}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                                                        <SelectItem value="FIXED">Nominal (Rp)</SelectItem>
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

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`discount-active-${discount.id}`}
                                                checked={discount.isActive}
                                                onCheckedChange={(value) => updateDiscount(discount.id, 'isActive', value)}
                                            />
                                            <label htmlFor={`discount-active-${discount.id}`} className="text-sm text-gray-700">
                                                Active
                                            </label>
                                        </div>

                                        {getValues('price') && discount.value && (
                                            <div className="bg-white p-3 rounded border border-red-200">
                                                <p className="text-xs text-gray-600 mb-1">Preview Price:</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-400 line-through">
                                                        Rp {parseFloat(getValues('price')).toLocaleString('id-ID')}
                                                    </span>
                                                    <span className="text-base font-bold text-blue-600">
                                                        Rp {calculateDiscountedPrice(parseFloat(getValues('price')), discount).toLocaleString('id-ID')}
                                                    </span>
                                                    <span className="text-xs text-green-600">
                                                        (Save Rp {(parseFloat(getValues('price')) - calculateDiscountedPrice(parseFloat(getValues('price')), discount)).toLocaleString('id-ID')})
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    {/* Variants */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-xl font-semibold text-gray-800">Variants</h2>
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
                                    className='w-full border-dashed'
                                >
                                    <Plus size={20} />
                                    Add Variant
                                </Button>

                                {variants.map((variant, index) => (
                                    <div key={variant.id} className="border p-4 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-700">Variant {index + 1}</h3>
                                            <Button
                                                type="button"
                                                onClick={() => removeVariant(variant.id)}
                                                variant="ghost">
                                                <X size={20} />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <Label>Variant Name</Label>
                                                <Input
                                                    type="text"
                                                    value={variant.name}
                                                    onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                                    placeholder="example: Red, Size L"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label>Variant SKU</Label>
                                                <Input
                                                    type="text"
                                                    value={variant.sku}
                                                    onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                    placeholder="example: RED-SIZE-L"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label>Variant Price</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                                                    placeholder="example: 19.99"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label>Variant Stock</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                                                    placeholder="example: 100"
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`variant-active-${variant.id}`}
                                                checked={variant.isActive}
                                                onCheckedChange={(checked) => { updateVariant(variant.id, 'isActive', checked) }}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor={`variant-active-${variant.id}`} className="text-sm text-gray-700">
                                                Active
                                            </label>
                                        </div>

                                        <div className="pt-3 border-t border-gray-300">
                                            <Button
                                                type="button"
                                                onClick={() => addDiscount(variant.id)}
                                                variant="outline"
                                            >
                                                <Percent size={16} />
                                                Add Discount to Variant
                                            </Button>

                                            {variant.discounts && variant.discounts.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {variant.discounts.map((vDiscount) => (
                                                        <div key={vDiscount.id} className="bg-red-50 p-3 rounded border border-red-200 text-sm">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-medium text-gray-700">
                                                                    {vDiscount.type === 'PERCENTAGE' ? `${vDiscount.value}%` : `Rp ${vDiscount.value}`} OFF
                                                                </span>
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => removeDiscount(vDiscount.id, variant.id)}
                                                                    variant="ghost"
                                                                >
                                                                    <X size={14} />
                                                                </Button>
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                {new Date(vDiscount.startDate).toLocaleDateString('id-ID')} - {new Date(vDiscount.endDate).toLocaleDateString('id-ID')}
                                                            </div>
                                                            {variant.price && vDiscount.value && (
                                                                <div className="mt-2 pt-2 border-t border-red-200">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-400 line-through">
                                                                            Rp {parseFloat(variant.price).toLocaleString('id-ID')}
                                                                        </span>
                                                                        <span className="text-sm font-bold text-blue-600">
                                                                            Rp {calculateDiscountedPrice(parseFloat(variant.price), vDiscount).toLocaleString('id-ID')}
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
                    <section className="flex gap-4 pt-6 border-t">
                        <Button type="submit">Create Product</Button>
                        <Button type="button" variant="outline" onClick={() => setActionContent('table')}>Cancel</Button>
                    </section>
                </div>
            </form>
        </div>
    )
}

export default Create