/**
 * 章節投票管理 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { VoteStats, ChapterVoteRequest, ChapterVoteResponse } from '@/types/voting';

interface UseChapterVotingProps {
  storyId: string;
  chapterId: number;
  enabled?: boolean;
}

export function useChapterVoting({ storyId, chapterId, enabled = true }: UseChapterVotingProps) {
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 生成會話 ID
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('voter_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('voter_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // 獲取投票統計
  const fetchVoteStats = useCallback(async () => {
    if (!enabled || !storyId || !chapterId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stories/${storyId}/chapters/${chapterId}/vote`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChapterVoteResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || '獲取投票統計失敗');
      }

      setVoteStats(data.data);
    } catch (error) {
      console.error('獲取投票統計失敗:', error);
      setError(error instanceof Error ? error.message : '獲取投票統計失敗');
    } finally {
      setLoading(false);
    }
  }, [storyId, chapterId, enabled, getSessionId]);

  // 提交投票
  const submitVote = useCallback(async (optionId: string) => {
    if (!storyId || !chapterId || !optionId) return;

    try {
      setLoading(true);
      setError(null);

      const voteData: ChapterVoteRequest = {
        optionId,
        voterSession: getSessionId()
      };

      const response = await fetch(`/api/stories/${storyId}/chapters/${chapterId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId()
        },
        body: JSON.stringify(voteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChapterVoteResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || '投票失敗');
      }

      // 更新本地狀態
      setVoteStats(prev => prev ? {
        ...prev,
        voteCounts: data.data.voteCounts,
        totalVotes: data.data.totalVotes,
        userVoted: data.data.userVoted,
        thresholdReached: data.data.thresholdReached,
        triggerGeneration: data.data.triggerGeneration
      } : null);

      return data;
    } catch (error) {
      console.error('投票失敗:', error);
      setError(error instanceof Error ? error.message : '投票失敗');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storyId, chapterId, getSessionId]);

  // 初始載入
  useEffect(() => {
    if (enabled) {
      fetchVoteStats();
    }
  }, [fetchVoteStats, enabled]);

  return {
    voteStats,
    loading,
    error,
    submitVote,
    refetch: fetchVoteStats
  };
}
