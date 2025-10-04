/**
 * 載入狀態組件
 */

import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = '載入中...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full border-4 border-gray-200 border-t-purple-500 mb-4">
        <div className={sizeClasses[size]}></div>
      </div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}
