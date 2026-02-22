import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a price in the smallest currency unit (e.g., satang/cents) to a display string.
 * @param amount The amount in smallest units (e.g., 99000 for 990.00)
 * @param currency The currency code (default: 'THB')
 * @returns Formatted string (e.g., "990 THB")
 */
export function formatPrice(amount: number, currency: string = 'THB'): string {
    return `${(amount / 100).toLocaleString()} ${currency}`;
}
