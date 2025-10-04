/**
 * 章節導航組件
 */

import React from 'react';

interface ChapterNavigationProps {
  storyId: string;
  currentChapterNumber: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrev: boolean;
  hasNext: boolean;
  loading?: boolean;
}

export function ChapterNavigation({ 
  storyId, 
  currentChapterNumber, 
  onNavigate, 
  hasPrev, 
  hasNext,
  loading = false 
}: ChapterNavigationProps) {
  // 如果是第一章節，不顯示導航
  if (currentChapterNumber === '001') {
    return null;
  }

  return (
    <div className="flex justify-center space-x-4 mt-4">
      <button 
        onClick={() => onNavigate('prev')}
        disabled={!hasPrev || loading}
        className={`
          px-4 py-2 rounded-lg transition-colors flex items-center space-x-2
          ${hasPrev && !loading 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <span>←</span>
        <span>上一章</span>
      </button>
      
      <button 
        onClick={() => onNavigate('next')}
        disabled={!hasNext || loading}
        className={`
          px-4 py-2 rounded-lg transition-colors flex items-center space-x-2
          ${hasNext && !loading 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <span>下一章</span>
        <span>→</span>
      </button>
    </div>
  );
}
