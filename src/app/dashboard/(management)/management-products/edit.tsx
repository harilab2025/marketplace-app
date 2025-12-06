'use client'
import EditorPage, { initialValue } from '@/components/richtextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/axios';
import { SerializedEditorState } from 'lexical';
import { Controller, useForm } from 'react-hook-form';

interface editProductInput {
    name: string;
    description: SerializedEditorState;
    price: string;
    sku: string;
    stock: number;
    isActive: boolean;
}

interface CreateProps {
    setActionContent: (content: string) => void;
}

function Create({ setActionContent }: CreateProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<editProductInput>({
        defaultValues: {
            name: '',
            description: initialValue,
            price: '',
            sku: '',
            stock: 0,
            isActive: false
        },
        mode: 'onBlur'
    });
    const onSubmit = async (data: editProductInput): Promise<void> => {
        const sendData = { ...data, description: data.description, stock: Number(data.stock) }
        const res = await apiClient.post(`/products`, sendData);
        console.log(res);
        // reset();
    }
    return (
        <div className="w-full bg-white border rounded-md">
            <div className="grid w-full [&>div]:h-[calc(100vh-300px)] py-3">
                <div className='w-full h-full flex flex-col overflow-auto'>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-2xl p-4">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="name">NAMA PRODUCT</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Name"
                                {...register("name", { required: "Nama produk wajib diisi" })}
                                autoComplete="name"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="description">DESKRIPSI</Label>
                            <Controller
                                name="description"
                                control={control}
                                rules={{
                                    validate: value =>
                                        value?.root?.children?.length > 0 ||
                                        "Deskripsi tidak boleh kosong"
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
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="price">HARGA</Label>
                            <Input
                                id="price"
                                type="text"
                                placeholder="Harga"
                                {...register("price", { required: "Harga produk wajib diisi" })}
                                autoComplete="price"
                                className={errors.price ? "border-red-500" : ""}
                            />
                            {errors.price && (
                                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                type="text"
                                placeholder="SKU"
                                {...register("sku", { required: "SKU produk wajib diisi" })}
                                autoComplete="sku"
                                className={errors.sku ? "border-red-500" : ""}
                            />
                            {errors.sku && (
                                <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="stock">STOK</Label>
                            <Input
                                id="stock"
                                type="number"
                                placeholder="Stok"
                                {...register("stock", { required: "Stok produk wajib diisi" })}
                                autoComplete="stock"
                                className={errors.stock ? "border-red-500" : ""}
                            />
                            {errors.stock && (
                                <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                            )}
                        </div>
                        <div className='flex space-x-4'>
                            <Button type='button' variant='outline' onClick={() => setActionContent('table')}>Go to table</Button>
                            <Button type='submit'>Simpan</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Create