/**
 * 錯誤狀態組件
 */

import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({ 
  message = '發生錯誤，請稍後再試', 
  onRetry, 
  showRetry = true 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-red-700 text-center mb-4">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
        >
          重試
        </button>
      )}
    </div>
  );
}
