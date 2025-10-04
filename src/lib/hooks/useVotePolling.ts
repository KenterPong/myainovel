/**
 * 投票統計輪詢 Hook
 */

import { useEffect, useRef, useCallback } from 'react';
import { VoteStats } from '@/types/voting';

interface UseVotePollingProps {
  storyId: string;
  chapterId: number;
  enabled: boolean;
  interval?: number; // 輪詢間隔（毫秒）
  onUpdate?: (voteStats: VoteStats) => void;
}

export function useVotePolling({ 
  storyId, 
  chapterId, 
  enabled, 
  interval = 5000, // 預設 5 秒
  onUpdate 
}: UseVotePollingProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  // 輪詢函數
  const pollVoteStats = useCallback(async () => {
    if (!enabled || !storyId || !chapterId || isPollingRef.current) return;

    try {
      isPollingRef.current = true;

      const response = await fetch(`/api/stories/${storyId}/chapters/${chapterId}/vote`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': localStorage.getItem('voter_session_id') || 'anonymous'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          onUpdate?.(data.data);
        }
      }
    } catch (error) {
      console.warn('投票統計輪詢失敗:', error);
    } finally {
      isPollingRef.current = false;
    }
  }, [storyId, chapterId, enabled, onUpdate]);

  // 開始輪詢
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (enabled && storyId && chapterId) {
      // 立即執行一次
      pollVoteStats();
      
      // 設定定時輪詢
      intervalRef.current = setInterval(pollVoteStats, interval);
    }
  }, [pollVoteStats, enabled, storyId, chapterId, interval]);

  // 停止輪詢
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 重新開始輪詢
  const restartPolling = useCallback(() => {
    stopPolling();
    startPolling();
  }, [stopPolling, startPolling]);

  // 當依賴項變化時重新開始輪詢
  useEffect(() => {
    restartPolling();
    return stopPolling;
  }, [restartPolling, stopPolling]);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    startPolling,
    stopPolling,
    restartPolling
  };
}
