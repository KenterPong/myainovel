import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 CSS 類別名稱的工具函式
 * 結合 clsx 和 tailwind-merge 的功能
 * 
 * @param inputs 類別名稱或條件物件
 * @returns 合併後的類別字串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
