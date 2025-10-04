/**
 * 空資料狀態組件
 */

import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export function EmptyState({ 
  title = '暫無資料',
  message = '目前沒有可顯示的內容',
  actionText = '重新載入',
  onAction,
  showAction = true
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-sm">{message}</p>
      {showAction && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
