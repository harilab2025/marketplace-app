/**
 * Sanitize decimal input - only allow numbers and one decimal point
 * @param value - Input value to sanitize
 * @returns Sanitized string with only numbers and one decimal point
 */
export function sanitizeDecimalInput(value: string): string {
    // Only allow numbers and decimal point
    let v = value.replace(/[^0-9.]/g, '');

    // Only allow one decimal point
    const parts = v.split('.');
    if (parts.length > 2) {
        v = parts[0] + '.' + parts.slice(1).join('');
    }

    return v;
}

/**
 * Parse string to number safely
 * @param value - String value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number or default value
 */
export function parseNumber(value: string | number, defaultValue: number = 0): number {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format number to Indonesian locale
 * @param value - Number to format
 * @returns Formatted string
 */
export function formatNumber(value: number): string {
    return value.toLocaleString('id-ID');
}
