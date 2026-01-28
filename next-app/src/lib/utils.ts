import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}

export function formatPrice(num: number): string {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (num >= 10000) {
        return `${(num / 10000).toFixed(2)}億`;
    }
    return `${formatNumber(num, 0)}萬`;
}
