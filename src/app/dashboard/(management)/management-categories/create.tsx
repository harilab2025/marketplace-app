'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useConfirm } from '@/context/dashboard/useConfirm';
import { useLoadingUtils } from '@/context/dashboard/useLoading';
import { apiClient } from '@/lib/axios';
import { AxiosError } from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

interface createCategoryInput {
    name: string;
    isActive: boolean;
}

interface ErrorResponse {
    message: string;
}
type ActionContent = "table" | "create" | "edit";

function CreateCategory({ setActionContent, onSuccess }: { setActionContent: (content: ActionContent) => void, onSuccess?: () => void }) {
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
        formState: { errors },
    } = useForm<createCategoryInput>({
        defaultValues: {
            name: '',
            isActive: true,
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: createCategoryInput): Promise<void> => {
        await confirm({
            title: "Confirm adding category",
            description: "Do you want to add this category?",
            confirmText: "Yes",
            cancelText: "No",
            onConfirm: async () => {
                try {
                    showSaving('Saving your data...');
                    const res = await apiClient.post(`/categories`, data);
                    hide();
                    if (res.status !== 201) {
                        toast.error('Failed to create category');
                        return;
                    }
                    toast.success('Category created successfully');
                    reset();
                    if (onSuccess) onSuccess();
                    setActionContent('table');
                } catch (error: AxiosError | unknown) {
                    setTimeout(() => {
                        hide();
                        const message = (error as AxiosError<ErrorResponse>)?.response?.data?.message || (error as Error).message || 'Unknown error';
                        toast.error('Error creating category: ' + message);
                    }, 1000);
                }
            },
        });
    }

    return (
        <div className='relative w-full h-full'>
            <form onSubmit={handleSubmit(onSubmit)} className="absolute h-[calc(100vh-200px)] w-full overflow-y-auto overflow-hidden bg-white border rounded-md">
                <div className='w-full h-full flex flex-col p-4 space-y-8'>
                    {/* General Information */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">General Information</h2>
                        <div className="w-full grid grid-cols-1 gap-4">
                            {/* Category Name */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="name">CATEGORY NAME</Label>
                                <Input
                                    placeholder="example: Electronics"
                                    id="name"
                                    {...register("name", { required: "Category name is required", minLength: { value: 2, message: "Category name must be at least 2 characters" } })}
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="isActive">STATUS (Active)</Label>
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
                        </div>
                    </section>

                    <section className="flex gap-4 pt-6 border-t">
                        <Button type="submit">Create Category</Button>
                        <Button type="button" variant="outline" onClick={() => setActionContent('table')}>Cancel</Button>
                    </section>
                </div>
            </form>
        </div>
    )
}

export default CreateCategory
