import { SerializedEditorState } from 'lexical';

/**
 * Product form input types
 */
export interface CreateProductInput {
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
    tags?: string[];
}

/**
 * Variant types - using number for stock to match input type
 */
export interface CreateVariant {
    id: number;
    name: string;
    sku: string;
    price: string;
    stock: number;
    attributes: Record<string, string>;
    isActive: boolean;
    discounts: CreateDiscount[];
}

/**
 * Discount types
 */
export interface CreateDiscount {
    id: number;
    variantId: number | null;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

/**
 * Category type
 */
export interface Category {
    publicId: string;
    name: string;
    slug: string;
    isActive: boolean;
}

/**
 * API Error Response
 */
export interface ErrorResponse {
    message: string;
}
