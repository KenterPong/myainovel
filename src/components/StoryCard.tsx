/**
 * 故事卡片組件
 */

import React from 'react';
import { StoryWithChapter } from '@/types/story';
import { ChapterVotingSection } from './ChapterVotingSection';

interface StoryCardProps {
  story: StoryWithChapter;
  onVoteSuccess?: () => void;
  onViewDetails?: (storyId: string) => void;
}

export function StoryCard({ story, onVoteSuccess, onViewDetails }: StoryCardProps) {
  const { current_chapter, chapter_voting, origin_voting } = story;

  // 格式化投票選項
  const votingOptions = current_chapter.voting_options?.options?.map(option => ({
    id: option.id,
    content: option.content,
    description: option.description,
    votes: option.votes || 0
  })) || [];

  // 檢查是否有進行中的投票
  const hasActiveVoting = current_chapter.voting_status === '進行中' && votingOptions.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* 故事標題和狀態 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">{story.title}</h2>
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${story.status === '投票中' ? 'bg-purple-100 text-purple-800' :
              story.status === '撰寫中' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'}
          `}>
            {story.status}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          建立時間: {new Date(story.created_at).toLocaleDateString('zh-TW')}
        </p>
      </div>

      {/* 章節內容 */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            第 {current_chapter.chapter_number} 章: {current_chapter.title}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {current_chapter.summary || current_chapter.full_text.substring(0, 200) + '...'}
          </p>
        </div>

        {/* 章節標籤 */}
        {current_chapter.tags && current_chapter.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {current_chapter.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 故事起源投票統計 */}
        {origin_voting && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">故事起源投票</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">故事類型</div>
                <div className="font-medium">
                  {Object.keys(origin_voting.voteCounts.outer).length > 0 ? '已投票' : '未投票'}
                </div>
              </div>
              <div>
                <div className="text-gray-600">故事背景</div>
                <div className="font-medium">
                  {Object.keys(origin_voting.voteCounts.middle).length > 0 ? '已投票' : '未投票'}
                </div>
              </div>
              <div>
                <div className="text-gray-600">故事主題</div>
                <div className="font-medium">
                  {Object.keys(origin_voting.voteCounts.inner).length > 0 ? '已投票' : '未投票'}
                </div>
              </div>
            </div>
            {origin_voting.allThresholdsReached && (
              <div className="mt-2 text-green-600 text-sm">
                ✓ 所有分類已達到投票門檻
              </div>
            )}
          </div>
        )}

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

        {/* 投票統計顯示 */}
        {chapter_voting && !hasActiveVoting && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">投票結果</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">選項 A</div>
                <div className="font-medium">{chapter_voting.voteCounts.A} 票</div>
              </div>
              <div>
                <div className="text-gray-600">選項 B</div>
                <div className="font-medium">{chapter_voting.voteCounts.B} 票</div>
              </div>
              <div>
                <div className="text-gray-600">選項 C</div>
                <div className="font-medium">{chapter_voting.voteCounts.C} 票</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              總票數: {chapter_voting.totalVotes}
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => onViewDetails?.(story.story_id)}
            className="text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            查看詳情 →
          </button>
          <div className="text-xs text-gray-500">
            章節狀態: {current_chapter.voting_status}
          </div>
        </div>
      </div>
    </div>
  );
}
