/**
 * 章節導航組件
 */

import React from 'react';

interface ChapterNavigationProps {
  storyId: string;
  currentChapterNumber: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  onShowChapterList?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  loading?: boolean;
  showChapterList?: boolean; // 是否顯示章節列表視圖
}

export function ChapterNavigation({ 
  storyId, 
  currentChapterNumber, 
  onNavigate, 
  onShowChapterList,
  hasPrev, 
  hasNext,
  loading = false,
  showChapterList = false
}: ChapterNavigationProps) {
  // 如果是第一章節且沒有下一章，不顯示導航
  if (currentChapterNumber === '001' && !hasNext) {
    return null;
  }

  // 左按鈕 - 上一章
  const PrevButton = () => (
    <button 
      onClick={() => onNavigate('prev')}
      disabled={!hasPrev || loading}
      className={`
        w-10 h-10 rounded-lg transition-colors flex items-center justify-center
        ${hasPrev && !loading 
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105' 
          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }
      `}
      title="上一章"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );

  // 中間按鈕 - 章節列表功能
  const MiddleButton = () => (
    <button 
      onClick={onShowChapterList}
      className="w-10 h-10 rounded-lg transition-colors flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
      title="查看章節列表"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    </button>
  );

  // 右按鈕 - 下一章
  const NextButton = () => (
    <button 
      onClick={() => onNavigate('next')}
      disabled={!hasNext || loading}
      className={`
        w-10 h-10 rounded-lg transition-colors flex items-center justify-center
        ${hasNext && !loading 
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105' 
          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }
      `}
      title="下一章"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  return (
    <div className="flex justify-center items-center space-x-3 mt-4">
      <PrevButton />
      <MiddleButton />
      <NextButton />
    </div>
  );
}
