'use client';

import React, { useState, useEffect } from 'react';
import { 
  SatisfactionVoteType, 
  SatisfactionVoteStats, 
  SatisfactionVoteRequest 
} from '@/types/voting';

interface SatisfactionVotingProps {
  chapterId: number;
  storyId: string;
  onVote?: (stats: SatisfactionVoteStats) => void;
}

const VOTE_EMOJIS = {
  [SatisfactionVoteType.LIKE]: '👍',
  [SatisfactionVoteType.STAR]: '⭐',
  [SatisfactionVoteType.FIRE]: '🔥',
  [SatisfactionVoteType.HEART]: '💖',
};

const VOTE_LABELS = {
  [SatisfactionVoteType.LIKE]: '喜歡',
  [SatisfactionVoteType.STAR]: '精彩',
  [SatisfactionVoteType.FIRE]: '超讚',
  [SatisfactionVoteType.HEART]: '感動',
};

export default function SatisfactionVoting({ 
  chapterId, 
  storyId, 
  onVote 
}: SatisfactionVotingProps) {
  const [stats, setStats] = useState<SatisfactionVoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 獲取投票統計
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/stories/${storyId}/chapters/${chapterId}/satisfaction`
      );
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('獲取投票統計失敗:', err);
      setError('獲取投票統計失敗');
    } finally {
      setLoading(false);
    }
  };

  // 提交投票
  const handleVote = async (voteType: SatisfactionVoteType) => {
    if (voting || !stats || stats.userVoted) return;

    try {
      setVoting(true);
      setError(null);

      const response = await fetch(
        `/api/stories/${storyId}/chapters/${chapterId}/satisfaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ voteType } as SatisfactionVoteRequest),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        onVote?.(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('投票失敗:', err);
      setError('投票失敗，請稍後再試');
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [chapterId, storyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
        >
          重試
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          這章節如何？
        </h3>
        <p className="text-sm text-gray-600">
          {stats.userVoted ? '感謝您的回饋！' : '選擇您的感受'}
        </p>
      </div>

      {/* 投票按鈕網格 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.values(SatisfactionVoteType).map((voteType) => {
          const isSelected = stats.userVoted && stats.userVoteType === voteType;
          const count = stats.voteCounts[voteType];
          const isDisabled = voting || stats.userVoted;

          return (
            <button
              key={voteType}
              onClick={() => handleVote(voteType)}
              disabled={isDisabled}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${voting ? 'animate-pulse' : ''}
              `}
            >
              <span className="text-2xl mb-1">
                {VOTE_EMOJIS[voteType]}
              </span>
              <span className="text-xs font-medium">
                {VOTE_LABELS[voteType]}
              </span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 總投票數 */}
      {stats.totalVotes > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            共 {stats.totalVotes} 人參與投票
          </p>
        </div>
      )}

      {/* 載入狀態指示器 */}
      {voting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">投票中...</span>
          </div>
        </div>
      )}
    </div>
  );
}
