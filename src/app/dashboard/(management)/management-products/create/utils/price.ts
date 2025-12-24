import { CreateDiscount, CreateVariant } from '../types';
import { parseNumber, formatNumber } from './number';

/**
 * Calculate discounted price based on discount type
 * @param basePrice - Original price
 * @param discount - Discount configuration
 * @returns Final price after discount
 */
export function calculateDiscountedPrice(
    basePrice: number,
    discount: CreateDiscount
): number {
    if (!discount.value || !discount.isActive) {
        return basePrice;
    }

    const discountValue = parseNumber(discount.value);

    if (discount.type === 'PERCENTAGE') {
        return basePrice - (basePrice * discountValue / 100);
    } else {
        return Math.max(0, basePrice - discountValue);
    }
}

/**
 * Calculate price range from variants
 * @param variants - Array of product variants
 * @returns Formatted price range string or null
 */
export function calculatePriceRange(variants: CreateVariant[]): string | null {
    if (variants.length === 0) {
        return null;
    }

    const prices = variants
        .map(v => {
            const price = parseNumber(v.price);
            const activeDiscount = v.discounts.find(d => d.isActive);

            if (activeDiscount && activeDiscount.value) {
                return calculateDiscountedPrice(price, activeDiscount);
            }
            return price;
        })
        .filter(p => p > 0);

    if (prices.length === 0) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) {
        return `Rp ${formatNumber(min)}`;
    }
    return `Rp ${formatNumber(min)} - Rp ${formatNumber(max)}`;
}

/**
 * Calculate savings from discount
 * @param originalPrice - Price before discount
 * @param discountedPrice - Price after discount
 * @returns Savings amount
 */
export function calculateSavings(originalPrice: number, discountedPrice: number): number {
    return Math.max(0, originalPrice - discountedPrice);
}
