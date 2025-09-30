/**
 * 工具函式集合
 */

// 匯出 cn 函數
export { cn } from './cn';

/**
 * 格式化日期
 * @param date 日期物件或字串
 * @param format 格式字串
 * @returns 格式化後的日期字串
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 延遲函式
 * @param ms 延遲毫秒數
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 產生隨機字串
 * @param length 字串長度
 * @returns 隨機字串
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 檢查是否為空值
 * @param value 要檢查的值
 * @returns 是否為空值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
