import { useState, useCallback } from 'react';
import { CreateVariant } from '../types';

/**
 * Custom hook to manage product variants
 */
export function useVariants() {
    const [variants, setVariants] = useState<CreateVariant[]>([]);

    /**
     * Add a new variant
     */
    const addVariant = useCallback(() => {
        const newVariant: CreateVariant = {
            id: Date.now(),
            name: '',
            sku: '',
            price: '',
            stock: 0,
            attributes: {},
            isActive: true,
            discounts: []
        };

        setVariants(prev => [...prev, newVariant]);
    }, []);

    /**
     * Remove a variant by id
     */
    const removeVariant = useCallback((id: number) => {
        setVariants(prev => prev.filter(v => v.id !== id));
    }, []);

    /**
     * Update a variant field
     */
    const updateVariant = useCallback((
        id: number,
        field: keyof CreateVariant,
        value: any
    ) => {
        setVariants(prev =>
            prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
        );
    }, []);

    /**
     * Add attribute to variant
     */
    const addAttribute = useCallback((variantId: number) => {
        setVariants(prev =>
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
    }, []);

    /**
     * Update variant attribute
     */
    const updateAttribute = useCallback((
        variantId: number,
        oldKey: string,
        newKey: string,
        value: string
    ) => {
        setVariants(prev =>
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
    }, []);

    /**
     * Remove attribute from variant
     */
    const removeAttribute = useCallback((variantId: number, key: string) => {
        setVariants(prev =>
            prev.map(v => {
                if (v.id === variantId) {
                    const newAttributes = { ...v.attributes };
                    delete newAttributes[key];
                    return { ...v, attributes: newAttributes };
                }
                return v;
            })
        );
    }, []);

    /**
     * Clear all variants
     */
    const clearVariants = useCallback(() => {
        setVariants([]);
    }, []);

    return {
        variants,
        addVariant,
        removeVariant,
        updateVariant,
        addAttribute,
        updateAttribute,
        removeAttribute,
        clearVariants,
        hasVariants: variants.length > 0
    };
}
