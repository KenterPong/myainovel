/**
 * 章節列表彈窗組件
 */

import React from 'react';

interface Chapter {
  chapter_id: number;
  chapter_number: string;
  title: string;
  voting_status: '投票中' | '已投票' | '投票截止';
  created_at: string;
}

interface ChapterListModalProps {
  storyId: string;
  storyTitle: string;
  chapters: Chapter[];
  currentChapterId: number;
  onChapterSelect: (chapterId: number) => void;
  onClose: () => void;
  loading?: boolean;
}

export function ChapterListModal({
  storyId,
  storyTitle,
  chapters,
  currentChapterId,
  onChapterSelect,
  onClose,
  loading = false
}: ChapterListModalProps) {
  // 按章節編號排序（001, 002, 003...）
  const sortedChapters = [...chapters].sort((a, b) => 
    parseInt(a.chapter_number) - parseInt(b.chapter_number)
  );

  // 獲取章節狀態圖標和顏色
  const getChapterStatus = (status: string) => {
    switch (status) {
      case '投票中':
        return {
          icon: '⏰',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case '已投票':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case '投票截止':
        return {
          icon: '🔒',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          icon: '❓',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md mx-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入章節列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📚 {storyTitle}</h3>
            <p className="text-sm text-gray-500">章節列表</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 章節列表 */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {sortedChapters.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📖</div>
              <p className="text-gray-500">暫無章節</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedChapters.map((chapter) => {
                const status = getChapterStatus(chapter.voting_status);
                const isCurrentChapter = chapter.chapter_id === currentChapterId;
                
                return (
                  <div
                    key={chapter.chapter_id}
                    onClick={() => {
                      onChapterSelect(chapter.chapter_id);
                      onClose();
                    }}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${isCurrentChapter 
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                        : `${status.borderColor} ${status.bgColor} hover:bg-gray-50`
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${isCurrentChapter 
                            ? 'bg-primary-500 text-white' 
                            : `${status.bgColor} ${status.color}`
                          }
                        `}>
                          {isCurrentChapter ? '📍' : status.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {chapter.title}
                            </span>
                            {isCurrentChapter && (
                              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                當前章節
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs ${status.color}`}>
                          {chapter.voting_status}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(chapter.created_at).toLocaleDateString('zh-TW')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部操作欄 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>共 {sortedChapters.length} 個章節</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
