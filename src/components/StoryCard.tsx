/**
 * 章節卡片組件 - 跨故事章節排序顯示
 */

import React, { useState, useEffect } from 'react';
import { ChapterVotingSection } from './ChapterVotingSection';
import { ChapterNavigation } from './ChapterNavigation';
import { ChapterListModal } from './ChapterListModal';
import { getOriginTags } from '@/lib/utils/originTags';

interface ChapterCardProps {
  chapter: any; // 章節資料
  onVoteSuccess?: () => void;
  onViewDetails?: (storyId: string) => void;
  onNewChapterGenerated?: () => void;
  onStoryTitleClick?: (storyId: string) => void;
  onChapterNavigate?: (storyId: string, chapterNumber: string) => void;
  onTagClick?: (tag: string) => void;
  onBackToHome?: () => void;
  filteredStoryId?: string | null;
  filteredTag?: string | null;
}

export function StoryCard({ 
  chapter, 
  onVoteSuccess, 
  onViewDetails, 
  onNewChapterGenerated,
  onStoryTitleClick,
  onChapterNavigate,
  onTagClick,
  onBackToHome,
  filteredStoryId,
  filteredTag
}: ChapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localVotingStatus, setLocalVotingStatus] = useState(chapter.voting_status);
  const [navigationInfo, setNavigationInfo] = useState<any>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [storyChapters, setStoryChapters] = useState<any[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // 同步本地投票狀態
  useEffect(() => {
    setLocalVotingStatus(chapter.voting_status);
  }, [chapter.voting_status]);

  // 獲取章節導航資訊
  useEffect(() => {
    const fetchNavigationInfo = async () => {
      try {
        setNavigationLoading(true);
        const response = await fetch(
          `/api/stories/${chapter.story_id}/chapters/navigation?currentChapter=${chapter.chapter_number}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNavigationInfo(data.data);
          }
        }
      } catch (error) {
        console.error('獲取章節導航資訊失敗:', error);
      } finally {
        setNavigationLoading(false);
      }
    };

    fetchNavigationInfo();
  }, [chapter.story_id, chapter.chapter_number]);

  // 格式化投票選項
  const votingOptions = Array.isArray(chapter.voting_options) 
    ? chapter.voting_options.map((option: any) => ({
        id: option.id,
        content: option.content,
        description: option.description,
        votes: option.votes || 0
      }))
    : chapter.voting_options?.options?.map((option: any) => ({
        id: option.id,
        content: option.content,
        description: option.description,
        votes: option.votes || 0
      })) || [];

  // 檢查是否有投票選項（不管投票狀態如何都顯示）
  const hasVotingOptions = votingOptions.length > 0;
  const isVotingActive = localVotingStatus === '投票中';


  // 處理內容點擊展開
  const handleContentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // 處理滑動手勢（禁用）
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  // 處理章節導航
  const handleChapterNavigate = (direction: 'prev' | 'next') => {
    if (!navigationInfo) return;
    
    const targetChapter = direction === 'prev' ? navigationInfo.prevChapter : navigationInfo.nextChapter;
    if (targetChapter && onChapterNavigate) {
      onChapterNavigate(chapter.story_id, targetChapter.chapter_number);
    }
  };

  // 獲取故事的所有章節
  const fetchStoryChapters = async () => {
    try {
      setChaptersLoading(true);
      const response = await fetch(`/api/stories/${chapter.story_id}/chapters`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStoryChapters(data.data);
        }
      }
    } catch (error) {
      console.error('獲取章節列表失敗:', error);
    } finally {
      setChaptersLoading(false);
    }
  };

  // 處理顯示章節列表
  const handleShowChapterList = () => {
    if (storyChapters.length === 0) {
      fetchStoryChapters();
    }
    setShowChapterList(true);
  };

  // 處理章節選擇
  const handleChapterSelect = (chapterId: number) => {
    const selectedChapter = storyChapters.find(ch => ch.chapter_id === chapterId);
    if (selectedChapter && onChapterNavigate) {
      onChapterNavigate(chapter.story_id, selectedChapter.chapter_number);
    }
  };

  // 處理返回首頁
  const handleBackToHome = () => {
    setShowChapterList(false);
    if (onBackToHome) {
      onBackToHome();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* 章節內容 */}
      <div className="p-6">
        <div className="mb-4">
          {/* 故事標題 */}
          <div className="mb-2">
            <h2 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
              onClick={() => onStoryTitleClick?.(chapter.story_id)}
            >
              {chapter.story_title}
            </h2>
          </div>
          
          {/* 故事標籤和投票狀態 */}
          <div className="flex items-center justify-between mb-2">
            {/* 故事類型標籤 - 左邊 */}
            <div className="flex flex-wrap gap-1">
              {(() => {
                // 從 voting_result 中獲取故事的三個類型標籤
                const votingResult = chapter.voting_result;
                let tags = [];
                
                if (votingResult) {
                  // 如果有投票結果，使用投票結果
                  if (votingResult.genre) tags.push(votingResult.genre);
                  if (votingResult.background) tags.push(votingResult.background);
                  if (votingResult.theme) tags.push(votingResult.theme);
                } else {
                  // 如果沒有投票結果，嘗試從故事標題中解析類型
                  const title = chapter.story_title || '';
                  
                  // 從標題中提取類型資訊（例如：「科幻職場BL的奇幻冒險」）
                  // 科幻 -> 故事類型
                  // 職場 -> 故事背景  
                  // BL -> 故事主題
                  
                  // 故事類型映射
                  const genreMap = {
                    '科幻': '科幻',
                    '奇幻': '奇幻',
                    '懸疑': '懸疑',
                    '歷史': '歷史',
                    '都市': '都市',
                    '末日': '末日'
                  };
                  
                  // 故事背景映射
                  const backgroundMap = {
                    '校園': '校園',
                    '職場': '職場',
                    '古代': '古代',
                    '冒險': '冒險',
                    '超能力': '超能力',
                    '推理': '推理'
                  };
                  
                  // 故事主題映射
                  const themeMap = {
                    'B/G': 'B/G',
                    'B/B': 'B/B', 
                    'G/G': 'G/G',
                    'BL': 'B/B',
                    'GL': 'G/G',
                    'BG': 'B/G',
                    '其他': '其他'
                  };
                  
                  // 嘗試從標題中提取類型
                  for (const [key, value] of Object.entries(genreMap)) {
                    if (title.includes(key)) {
                      tags.push(value);
                      break;
                    }
                  }
                  
                  for (const [key, value] of Object.entries(backgroundMap)) {
                    if (title.includes(key)) {
                      tags.push(value);
                      break;
                    }
                  }
                  
                  for (const [key, value] of Object.entries(themeMap)) {
                    if (title.includes(key)) {
                      tags.push(value);
                      break;
                    }
                  }
                }
                
                return tags.map((tag, index) => {
                  // 檢查是否為當前選中的標籤
                  const isSelected = filteredTag === tag;
                  
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTagClick?.(tag);
                      }}
                      className={`px-2 py-1 text-xs rounded-full transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-green-100 text-green-800 border-2 border-green-600 hover:bg-green-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                });
              })()}
            </div>
            
            {/* 投票狀態 - 右邊 */}
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${localVotingStatus === '投票中' ? 'bg-purple-100 text-purple-800' :
                localVotingStatus === '已投票' ? 'bg-green-100 text-green-800' :
                localVotingStatus === '投票截止' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {localVotingStatus}
            </span>
          </div>
          
          {/* 章節標題 */}
          <div className="mb-2">
            <h3 className="text-base font-medium text-gray-800">
              {chapter.title}
            </h3>
          </div>
          <div 
            className="text-gray-700 leading-relaxed cursor-pointer"
            onClick={handleContentClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {(() => {
              const text = isExpanded ? chapter.full_text : chapter.full_text.substring(0, 200) + '...';
              // 按段落分割文字（以兩個換行符或句號+空格為分隔符）
              const paragraphs = text.split(/\n\s*\n|\.\s+(?=[A-Z\u4e00-\u9fff])/).filter((p: string) => p.trim());
              
              return (
                <div className="space-y-3">
                  {paragraphs.map((paragraph: string, index: number) => (
                    <p key={index} className="text-justify indent-8">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              );
            })()}
            {!isExpanded && chapter.full_text.length > 200 && (
              <span className="text-purple-600 hover:text-purple-800 font-medium ml-1">
                點擊展開完整內容
              </span>
            )}
            {isExpanded && chapter.full_text.length > 200 && (
              <span className="text-purple-600 hover:text-purple-800 font-medium ml-1">
                點擊收合
              </span>
            )}
            
            {/* 章節投票區域 - 只在展開時顯示 */}
            {isExpanded && hasVotingOptions && (
              <div className="mt-6">
                <ChapterVotingSection
                  storyId={chapter.story_id}
                  chapterId={chapter.chapter_id}
                  votingOptions={votingOptions}
                  onVoteSuccess={onVoteSuccess}
                  onVotingStatusChange={setLocalVotingStatus}
                  isVotingActive={isVotingActive}
                  onNewChapterGenerated={onNewChapterGenerated}
                />
              </div>
            )}
          </div>
        </div>

        {/* 章節導航區域 */}
        <ChapterNavigation
          storyId={chapter.story_id}
          currentChapterNumber={chapter.chapter_number}
          onNavigate={handleChapterNavigate}
          onShowChapterList={handleShowChapterList}
          hasPrev={!!navigationInfo?.prevChapter}
          hasNext={!!navigationInfo?.nextChapter}
          loading={navigationLoading}
          showChapterList={showChapterList}
        />

        {/* 章節列表彈窗 */}
        {showChapterList && (
          <ChapterListModal
            storyId={chapter.story_id}
            storyTitle={chapter.story_title || '未知故事'}
            chapters={storyChapters}
            currentChapterId={chapter.chapter_id}
            onChapterSelect={handleChapterSelect}
            onClose={() => setShowChapterList(false)}
            loading={chaptersLoading}
          />
        )}

      </div>
    </div>
  );
}
