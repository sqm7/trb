import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with thousands separators and optional decimal places
 */
export function formatNumber(value: number | undefined | null, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return value.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a price in 萬 (10k units) or 億 (100M units)
 */
export function formatPrice(value: number | undefined | null): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)} 億`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)} 萬`;
  }
  return value.toLocaleString('zh-TW');
}

