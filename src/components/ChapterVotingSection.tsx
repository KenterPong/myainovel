/**
 * 章節投票區域組件
 */

import React, { useState } from 'react';
import { VoteStats, VotingOption } from '@/types/voting';
import { VoteOption } from './VoteOption';
import { useChapterVoting } from '@/lib/hooks/useChapterVoting';
import { useVotePolling } from '@/lib/hooks/useVotePolling';

interface ChapterVotingSectionProps {
  storyId: string;
  chapterId: number;
  votingOptions?: VotingOption[];
  onVoteSuccess?: () => void;
}

export function ChapterVotingSection({
  storyId,
  chapterId,
  votingOptions = [],
  onVoteSuccess
}: ChapterVotingSectionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { voteStats, loading, error, submitVote } = useChapterVoting({
    storyId,
    chapterId,
    enabled: true
  });

  // 投票統計輪詢
  useVotePolling({
    storyId,
    chapterId,
    enabled: voteStats?.isVotingActive || false,
    interval: 3000, // 3 秒輪詢一次
    onUpdate: (newStats) => {
      // 這裡可以添加額外的更新邏輯
    }
  });

  // 處理投票提交
  const handleVote = async (optionId: string) => {
    if (isSubmitting || !voteStats?.isVotingActive) return;

    try {
      setIsSubmitting(true);
      await submitVote(optionId);
      setSelectedOption(optionId);
      onVoteSuccess?.();
    } catch (error) {
      console.error('投票失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果沒有投票選項，不顯示組件
  if (!votingOptions || votingOptions.length === 0) {
    return null;
  }

  // 載入狀態
  if (loading && !voteStats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  // 投票已結束
  if (!voteStats?.isVotingActive) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          {voteStats?.votingStatus === '已生成' ? '已根據投票結果生成下一章' : '投票時間已截止'}
        </div>
      </div>
    );
  }

  // 計算投票統計
  const totalVotes = voteStats?.totalVotes || 0;
  const voteCounts = voteStats?.voteCounts || { A: 0, B: 0, C: 0 };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-4">
        投票中 ({totalVotes}票) - 選擇故事發展方向
      </div>

      {/* 簡化的投票選項 */}
      <div className="space-y-2">
        {votingOptions.map((option) => {
          const voteCount = voteCounts[option.id as keyof typeof voteCounts] || 0;
          const isSelected = selectedOption === option.id || voteStats?.userChoice === option.id;

          return (
            <div
              key={option.id}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }
                ${isSubmitting || voteStats?.userVoted || !voteStats?.isVotingActive ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !isSubmitting && voteStats?.isVotingActive && !voteStats?.userVoted && handleVote(option.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {option.id} {option.content}
                </span>
                {totalVotes > 0 && (
                  <span className="text-sm text-gray-500">
                    {voteCount} 票
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 簡化的投票狀態資訊 */}
      {voteStats?.userVoted && (
        <div className="mt-3 text-sm text-green-600">
          ✓ 您已投票
        </div>
      )}

      {/* 門檻提示 */}
      {voteStats?.thresholdReached && (
        <div className="mt-3 text-sm text-green-600">
          投票已達到門檻，正在生成下一章...
        </div>
      )}
    </div>
  );
}
