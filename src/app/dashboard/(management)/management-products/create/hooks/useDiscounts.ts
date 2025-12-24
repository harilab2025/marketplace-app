import { useState, useCallback } from 'react';
import { CreateDiscount, CreateVariant } from '../types';

/**
 * Custom hook to manage discounts (both parent and variant-level)
 */
export function useDiscounts(
    variants: CreateVariant[],
    setVariants: React.Dispatch<React.SetStateAction<CreateVariant[]>>
) {
    const [parentDiscounts, setParentDiscounts] = useState<CreateDiscount[]>([]);

    /**
     * Add a new discount (parent or variant-level)
     */
    const addDiscount = useCallback((variantId: number | null = null) => {
        const newDiscount: CreateDiscount = {
            id: Date.now(),
            variantId,
            type: 'PERCENTAGE',
            value: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true
        };

        if (variantId) {
            // Add to variant
            setVariants(prev =>
                prev.map(v =>
                    v.id === variantId
                        ? { ...v, discounts: [...v.discounts, newDiscount] }
                        : v
                )
            );
        } else {
            // Add to parent
            setParentDiscounts(prev => [...prev, newDiscount]);
        }
    }, [setVariants]);

    /**
     * Remove a discount
     */
    const removeDiscount = useCallback((
        discountId: number,
        variantId: number | null = null
    ) => {
        if (variantId) {
            // Remove from variant
            setVariants(prev =>
                prev.map(v =>
                    v.id === variantId
                        ? { ...v, discounts: v.discounts.filter(d => d.id !== discountId) }
                        : v
                )
            );
        } else {
            // Remove from parent
            setParentDiscounts(prev => prev.filter(d => d.id !== discountId));
        }
    }, [setVariants]);

    /**
     * Update a discount field
     */
    const updateDiscount = useCallback((
        discountId: number,
        field: keyof CreateDiscount,
        value: any,
        variantId: number | null = null
    ) => {
        if (variantId) {
            // Update variant discount
            setVariants(prev =>
                prev.map(v =>
                    v.id === variantId
                        ? {
                            ...v,
                            discounts: v.discounts.map(d =>
                                d.id === discountId ? { ...d, [field]: value } : d
                            )
                        }
                        : v
                )
            );
        } else {
            // Update parent discount
            setParentDiscounts(prev =>
                prev.map(d => (d.id === discountId ? { ...d, [field]: value } : d))
            );
        }
    }, [setVariants]);

    /**
     * Clear all parent discounts
     */
    const clearParentDiscounts = useCallback(() => {
        setParentDiscounts([]);
    }, []);

    return {
        parentDiscounts,
        addDiscount,
        removeDiscount,
        updateDiscount,
        clearParentDiscounts
    };
}
