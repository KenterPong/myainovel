/**
 * 故事卡片組件
 */

import React, { useState } from 'react';
import { StoryWithChapter } from '@/types/story';
import { ChapterVotingSection } from './ChapterVotingSection';
import { getOriginTags } from '@/lib/utils/originTags';

interface StoryCardProps {
  story: StoryWithChapter;
  onVoteSuccess?: () => void;
  onViewDetails?: (storyId: string) => void;
}

export function StoryCard({ story, onVoteSuccess, onViewDetails }: StoryCardProps) {
  const { current_chapter, chapter_voting, origin_voting } = story;
  const [isExpanded, setIsExpanded] = useState(false);

  // 格式化投票選項
  const votingOptions = current_chapter.voting_options?.options?.map(option => ({
    id: option.id,
    content: option.content,
    description: option.description,
    votes: option.votes || 0
  })) || [];

  // 檢查是否有進行中的投票
  const hasActiveVoting = current_chapter.voting_status === '進行中' && votingOptions.length > 0;

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* 章節內容 */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {story.title}
            </h2>
            {/* 故事起源標籤 */}
            {origin_voting && (() => {
              const originTags = getOriginTags(origin_voting);
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
              第 {current_chapter.chapter_number} 章: {current_chapter.title}
            </h3>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${story.status === '投票中' ? 'bg-purple-100 text-purple-800' :
                story.status === '撰寫中' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {story.status}
            </span>
          </div>
          <div 
            className="text-gray-700 leading-relaxed cursor-pointer"
            onClick={handleContentClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {isExpanded 
              ? current_chapter.full_text
              : current_chapter.full_text.substring(0, 200) + '...'
            }
            {!isExpanded && current_chapter.full_text.length > 200 && (
              <span className="text-purple-600 hover:text-purple-800 font-medium ml-1">
                點擊展開完整內容
              </span>
            )}
            {isExpanded && current_chapter.full_text.length > 200 && (
              <span className="text-purple-600 hover:text-purple-800 font-medium ml-1">
                點擊收合
              </span>
            )}
          </div>
        </div>



        {/* 章節投票區域 */}
        {hasActiveVoting && (
          <div className="mb-4">
            <ChapterVotingSection
              storyId={story.story_id}
              chapterId={current_chapter.chapter_id}
              votingOptions={votingOptions}
              onVoteSuccess={onVoteSuccess}
            />
          </div>
        )}

        {/* 簡化的投票結果顯示 */}
        {chapter_voting && !hasActiveVoting && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              投票已結束 - 總票數: {chapter_voting.totalVotes}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
