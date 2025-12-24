'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Percent, X } from 'lucide-react';
import { CreateDiscount } from '../types';
import { calculateDiscountedPrice, calculateSavings } from '../utils/price';
import { formatNumber, parseNumber } from '../utils/number';

interface DiscountItemProps {
    discount: CreateDiscount;
    index: number;
    onUpdate: (discountId: number, field: keyof CreateDiscount, value: any) => void;
    onRemove: (discountId: number) => void;
    basePrice?: number;
    showPreview?: boolean;
}

export function DiscountItem({
    discount,
    index,
    onUpdate,
    onRemove,
    basePrice,
    showPreview = false
}: DiscountItemProps) {
    const price = basePrice || 0;
    const discountedPrice = showPreview && basePrice
        ? calculateDiscountedPrice(price, discount)
        : 0;
    const savings = showPreview && basePrice
        ? calculateSavings(price, discountedPrice)
        : 0;

    return (
        <div className="bg-zinc-50 p-4 rounded-lg border-2 border-zinc-200">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <Percent size={16} className="text-zinc-600" />
                    Discount {index + 1}
                </h4>
                <Button
                    type="button"
                    onClick={() => onRemove(discount.id)}
                    variant="ghost"
                    size="sm"
                >
                    <X size={16} />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Type */}
                <div className="flex flex-col gap-1">
                    <Label>Type</Label>
                    <Select
                        value={discount.type}
                        onValueChange={(value) =>
                            onUpdate(discount.id, 'type', value as 'PERCENTAGE' | 'FIXED_AMOUNT')
                        }
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

                {/* Value */}
                <div className="flex flex-col gap-1">
                    <Label>
                        Discount Value {discount.type === 'PERCENTAGE' ? '(%)' : '(Rp)'}
                    </Label>
                    <Input
                        type="number"
                        value={discount.value}
                        onChange={(e) => onUpdate(discount.id, 'value', e.target.value)}
                        placeholder={discount.type === 'PERCENTAGE' ? '0 - 100' : '0'}
                        step="0.01"
                        min="0"
                        max={discount.type === 'PERCENTAGE' ? '100' : undefined}
                    />
                </div>

                {/* Start Date */}
                <div className="flex flex-col gap-1">
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        value={discount.startDate}
                        onChange={(e) => onUpdate(discount.id, 'startDate', e.target.value)}
                    />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1">
                    <Label>End Date</Label>
                    <Input
                        type="date"
                        value={discount.endDate}
                        onChange={(e) => onUpdate(discount.id, 'endDate', e.target.value)}
                    />
                </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center space-x-2 mt-3">
                <Checkbox
                    id={`discount-active-${discount.id}`}
                    checked={discount.isActive}
                    onCheckedChange={(value) => onUpdate(discount.id, 'isActive', value)}
                />
                <label htmlFor={`discount-active-${discount.id}`} className="text-sm text-gray-700">
                    Active
                </label>
            </div>

            {/* Preview Price */}
            {showPreview && basePrice && discount.value && (
                <div className="bg-white p-3 rounded border border-blue-200 mt-3">
                    <p className="text-xs text-gray-600 mb-1">Preview Price:</p>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 line-through">
                            Rp {formatNumber(price)}
                        </span>
                        <span className="text-base font-bold text-blue-600">
                            Rp {formatNumber(discountedPrice)}
                        </span>
                        <span className="text-xs text-green-600">
                            (Save Rp {formatNumber(savings)})
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
