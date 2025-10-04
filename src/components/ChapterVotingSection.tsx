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
  onVotingStatusChange?: (status: '投票中' | '已投票' | '投票截止') => void;
  isVotingActive?: boolean;
  onNewChapterGenerated?: () => void;
}

export function ChapterVotingSection({
  storyId,
  chapterId,
  votingOptions = [],
  onVoteSuccess,
  onVotingStatusChange,
  isVotingActive = true,
  onNewChapterGenerated
}: ChapterVotingSectionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localVotingStatus, setLocalVotingStatus] = useState<'投票中' | '已投票' | '投票截止'>('投票中');

  const { voteStats, loading, error, submitVote } = useChapterVoting({
    storyId,
    chapterId,
    enabled: true
  });

  // 同步投票狀態
  React.useEffect(() => {
    if (voteStats?.votingStatus) {
      setLocalVotingStatus(voteStats.votingStatus);
    }
  }, [voteStats?.votingStatus]);

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
    if (isSubmitting || !isVotingActive) return;

    try {
      setIsSubmitting(true);
      const result = await submitVote(optionId);
      setSelectedOption(optionId);
      onVoteSuccess?.();
      
      // 根據投票結果更新狀態
      if (result?.data?.thresholdReached) {
        // 如果達到門檻，狀態變為投票截止
        setLocalVotingStatus('投票截止');
        onVotingStatusChange?.('投票截止');
        // 觸發新章節生成通知
        onNewChapterGenerated?.();
      } else {
        // 否則變為已投票
        setLocalVotingStatus('已投票');
        onVotingStatusChange?.('已投票');
      }
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

  // 載入狀態 - 顯示投票選項但禁用互動
  if (loading && !voteStats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-sm text-gray-600 mb-4">
          載入中... - 選擇故事發展方向
        </div>
        <div className="space-y-3">
          {votingOptions.map((option) => (
            <div
              key={option.id}
              className="p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-50"
            >
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-gray-200 text-gray-700">
                  {option.id}
                </span>
                <span className="font-medium text-gray-900 flex-1">
                  {option.content}
                </span>
                <span className="text-sm text-gray-500">
                  載入中...
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 投票已結束，但仍顯示選項（鎖定狀態）
  if (localVotingStatus !== '投票中') {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-4">
          {localVotingStatus === '投票截止' ? '已根據投票結果生成下一章' : 
           localVotingStatus === '已投票' ? `您已投票 (選擇了選項 ${voteStats?.userChoice})` : '投票時間已截止'}
        </div>
        <div className="space-y-3">
          {votingOptions.map((option) => {
            const voteCount = voteStats?.voteCounts[option.id as keyof typeof voteStats.voteCounts] || 0;
            const isUserChoice = voteStats?.userChoice === option.id;
            const isWinningOption = localVotingStatus === '投票截止' && voteCount > 0 && voteCount === Math.max(...Object.values(voteStats?.voteCounts || { A: 0, B: 0, C: 0 }));
            const threshold = voteStats?.threshold || 100;
            const progressPercentage = Math.min((voteCount / threshold) * 100, 100);
            
            return (
              <div
                key={option.id}
                className={`
                  p-3 rounded-lg border transition-all duration-200
                  ${isWinningOption 
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-300 shadow-md' 
                    : isUserChoice
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300 shadow-md'
                    : 'border-gray-200 bg-white opacity-75'
                  }
                `}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`
                      inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold
                      ${isWinningOption 
                        ? 'bg-green-500 text-white' 
                        : isUserChoice
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {option.id}
                    </span>
                    <span className="font-medium text-gray-900 flex-1">
                      {option.content}
                    </span>
                    <span className="text-sm text-gray-500">
                      {voteCount} / {threshold}
                    </span>
                  </div>
                  
                  {/* 狀態條 */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isWinningOption 
                          ? 'bg-green-500' 
                          : isUserChoice
                          ? 'bg-purple-500'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* 簡化的投票選項 - 上下排列 */}
        <div className="space-y-3">
          {votingOptions.map((option) => {
            const voteCount = voteCounts[option.id as keyof typeof voteCounts] || 0;
            const isSelected = selectedOption === option.id || voteStats?.userChoice === option.id;
            const threshold = voteStats?.threshold || 100;
            const progressPercentage = Math.min((voteCount / threshold) * 100, 100);

            return (
              <div
                key={option.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-300' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }
                  ${isSubmitting || voteStats?.userVoted || !voteStats?.isVotingActive ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !isSubmitting && voteStats?.isVotingActive && !voteStats?.userVoted && handleVote(option.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`
                      inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold
                      ${isSelected 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {option.id}
                    </span>
                    <span className="font-medium text-gray-900 flex-1">
                      {option.content}
                    </span>
                    <span className="text-sm text-gray-500">
                      {voteCount} / {threshold}
                    </span>
                  </div>
                  
                  {/* 狀態條 */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isSelected 
                          ? 'bg-purple-500' 
                          : 'bg-blue-400'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
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
