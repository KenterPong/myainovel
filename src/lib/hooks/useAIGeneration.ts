/**
 * AI 生成狀態管理 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { AIGenerationStatus } from '@/types/ai-generation';

interface UseAIGenerationProps {
  generationId?: string;
  enabled?: boolean;
  pollInterval?: number; // 輪詢間隔（毫秒）
}

export function useAIGeneration({ 
  generationId, 
  enabled = true, 
  pollInterval = 2000 
}: UseAIGenerationProps) {
  const [status, setStatus] = useState<AIGenerationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 獲取生成狀態
  const fetchStatus = useCallback(async () => {
    if (!generationId || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/generate?generationId=${generationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || '獲取生成狀態失敗');
      }

      setStatus(data.data);
    } catch (error) {
      console.error('獲取 AI 生成狀態失敗:', error);
      setError(error instanceof Error ? error.message : '獲取生成狀態失敗');
    } finally {
      setLoading(false);
    }
  }, [generationId, enabled]);

  // 輪詢生成狀態
  useEffect(() => {
    if (!generationId || !enabled) return;

    // 立即執行一次
    fetchStatus();

    // 如果狀態不是 completed 或 failed，則開始輪詢
    const interval = setInterval(() => {
      if (status && (status.status === 'completed' || status.status === 'failed')) {
        clearInterval(interval);
        return;
      }
      fetchStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [generationId, enabled, fetchStatus, pollInterval, status?.status]);

  // 手動刷新狀態
  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refresh,
    isCompleted: status?.status === 'completed',
    isFailed: status?.status === 'failed',
    isProcessing: status?.status === 'processing',
    isPending: status?.status === 'pending'
  };
}
