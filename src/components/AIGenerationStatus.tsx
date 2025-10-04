/**
 * AI 生成狀態顯示組件
 */

import React from 'react';
import { AIGenerationStatus } from '@/types/ai-generation';

interface AIGenerationStatusProps {
  status: AIGenerationStatus | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AIGenerationStatusComponent({ 
  status, 
  loading = false, 
  error = null, 
  onRetry 
}: AIGenerationStatusProps) {
  // 載入狀態
  if (loading && !status) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-blue-700">正在檢查生成狀態...</span>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              重試
            </button>
          )}
        </div>
      </div>
    );
  }

  // 沒有狀態
  if (!status) {
    return null;
  }

  // 根據狀態顯示不同內容
  const getStatusInfo = () => {
    switch (status.status) {
      case 'pending':
        return {
          icon: '⏳',
          title: '等待生成',
          message: 'AI 正在準備生成新章節...',
          color: 'yellow'
        };
      case 'processing':
        return {
          icon: '🤖',
          title: 'AI 生成中',
          message: `正在生成新章節... (${status.progress}%)`,
          color: 'blue'
        };
      case 'completed':
        return {
          icon: '✅',
          title: '生成完成',
          message: '新章節已成功生成！',
          color: 'green'
        };
      case 'failed':
        return {
          icon: '❌',
          title: '生成失敗',
          message: status.error || '生成過程中發生錯誤',
          color: 'red'
        };
      default:
        return {
          icon: '❓',
          title: '未知狀態',
          message: '生成狀態未知',
          color: 'gray'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[statusInfo.color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{statusInfo.icon}</span>
          <div>
            <h4 className="font-semibold">{statusInfo.title}</h4>
            <p className="text-sm">{statusInfo.message}</p>
          </div>
        </div>
        
        {/* 進度條（僅在處理中時顯示） */}
        {status.status === 'processing' && (
          <div className="w-32">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              />
            </div>
            <div className="text-xs text-center mt-1">{status.progress}%</div>
          </div>
        )}
      </div>

      {/* 詳細資訊 */}
      <div className="mt-3 text-xs text-gray-600">
        <div>生成 ID: {status.generationId}</div>
        <div>開始時間: {new Date(status.startedAt).toLocaleString('zh-TW')}</div>
        {status.completedAt && (
          <div>完成時間: {new Date(status.completedAt).toLocaleString('zh-TW')}</div>
        )}
        {status.estimatedTime && status.status === 'processing' && (
          <div>預估剩餘時間: {status.estimatedTime} 秒</div>
        )}
      </div>

      {/* 重試按鈕（失敗時顯示） */}
      {status.status === 'failed' && onRetry && (
        <div className="mt-3">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            重新生成
          </button>
        </div>
      )}
    </div>
  );
}
