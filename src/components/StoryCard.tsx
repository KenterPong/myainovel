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
  filteredStoryId?: string | null;
}

export function StoryCard({ 
  chapter, 
  onVoteSuccess, 
  onViewDetails, 
  onNewChapterGenerated,
  onStoryTitleClick,
  onChapterNavigate,
  filteredStoryId
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
          <div className="flex items-center justify-between mb-2">
            <h2 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
              onClick={() => onStoryTitleClick?.(chapter.story_id)}
            >
              {chapter.story_title}
            </h2>
            {/* 故事起源標籤 */}
            {chapter.origin_voting && (() => {
              const originTags = getOriginTags(chapter.origin_voting);
              return originTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {originTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-gray-800">
              第 {chapter.chapter_number} 章: {chapter.title}
            </h3>
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
