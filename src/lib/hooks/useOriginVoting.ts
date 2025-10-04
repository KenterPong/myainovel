/**
 * 故事起源投票管理 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { OriginVoteStats, OriginVoteRequest, OriginVoteResponse } from '@/types/voting';

interface UseOriginVotingProps {
  storyId: string;
  enabled?: boolean;
}

export function useOriginVoting({ storyId, enabled = true }: UseOriginVotingProps) {
  const [voteStats, setVoteStats] = useState<OriginVoteStats | null>(null);
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
    if (!enabled || !storyId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/origin/vote?storyId=${storyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OriginVoteResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || '獲取投票統計失敗');
      }

      setVoteStats(data.data);
    } catch (error) {
      console.error('獲取故事起源投票統計失敗:', error);
      setError(error instanceof Error ? error.message : '獲取投票統計失敗');
    } finally {
      setLoading(false);
    }
  }, [storyId, enabled, getSessionId]);

  // 提交投票
  const submitVote = useCallback(async (outerChoice: string, middleChoice: string, innerChoice: string) => {
    if (!storyId || !outerChoice || !middleChoice || !innerChoice) return;

    try {
      setLoading(true);
      setError(null);

      const voteData: OriginVoteRequest = {
        storyId,
        outerChoice,
        middleChoice,
        innerChoice,
        voterSession: getSessionId()
      };

      const response = await fetch('/api/origin/vote', {
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

      const data: OriginVoteResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || '投票失敗');
      }

      // 更新本地狀態
      setVoteStats(data.data);

      return data;
    } catch (error) {
      console.error('故事起源投票失敗:', error);
      setError(error instanceof Error ? error.message : '投票失敗');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storyId, getSessionId]);

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
