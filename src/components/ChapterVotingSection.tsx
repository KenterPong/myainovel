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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          投票已結束
        </h3>
        <div className="text-gray-600">
          {voteStats?.votingStatus === '已生成' ? '已根據投票結果生成下一章' : '投票時間已截止'}
        </div>
      </div>
    );
  }

  // 計算投票統計
  const totalVotes = voteStats?.totalVotes || 0;
  const voteCounts = voteStats?.voteCounts || { A: 0, B: 0, C: 0 };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          章節投票
        </h3>
        <div className="text-sm text-gray-500">
          總票數: {totalVotes}
        </div>
      </div>

      {/* 投票選項 */}
      <div className="space-y-4">
        {votingOptions.map((option) => {
          const voteCount = voteCounts[option.id as keyof typeof voteCounts] || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id || voteStats?.userChoice === option.id;

          return (
            <VoteOption
              key={option.id}
              option={option}
              voteCount={voteCount}
              percentage={percentage}
              isSelected={isSelected}
              onSelect={() => handleVote(option.id)}
              disabled={isSubmitting || voteStats?.userVoted || !voteStats?.isVotingActive}
              totalVotes={totalVotes}
            />
          );
        })}
      </div>

      {/* 投票狀態資訊 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {voteStats?.userVoted ? (
              <span className="text-green-600">✓ 您已投票</span>
            ) : (
              <span>請選擇一個選項進行投票</span>
            )}
          </div>
          {voteStats?.votingDeadline && (
            <div>
              截止時間: {new Date(voteStats.votingDeadline).toLocaleString('zh-TW')}
            </div>
          )}
        </div>

        {/* 門檻提示 */}
        {voteStats?.thresholdReached && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700">
                投票已達到門檻，正在生成下一章...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
