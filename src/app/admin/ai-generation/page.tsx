/**
 * AI 生成歷史管理頁面
 */

'use client'

import { useState, useEffect } from 'react';
import { AIGenerationHistory } from '@/types/ai-generation';

export default function AIGenerationPage() {
  const [generations, setGenerations] = useState<AIGenerationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取 AI 生成歷史
  const fetchGenerations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/ai-generation');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setGenerations(data.data);
      } else {
        throw new Error(data.message || '獲取生成歷史失敗');
      }
    } catch (error) {
      console.error('獲取 AI 生成歷史失敗:', error);
      setError(error instanceof Error ? error.message : '獲取生成歷史失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-2">載入中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchGenerations}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 生成歷史</h1>
        <p className="text-gray-600">查看所有 AI 生成記錄和狀態</p>
      </div>

      {generations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暫無生成記錄</h3>
          <p className="text-gray-600">目前沒有 AI 生成記錄</p>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((generation) => (
            <div key={generation.generation_id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    生成 ID: {generation.generation_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    故事 ID: {generation.story_id}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${generation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      generation.status === 'failed' ? 'bg-red-100 text-red-800' :
                      generation.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}
                  `}>
                    {generation.status === 'completed' ? '已完成' :
                     generation.status === 'failed' ? '失敗' :
                     generation.status === 'processing' ? '處理中' : '等待中'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">生成類型</label>
                  <p className="text-sm text-gray-900">{generation.generation_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">章節 ID</label>
                  <p className="text-sm text-gray-900">{generation.chapter_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">處理時間</label>
                  <p className="text-sm text-gray-900">{generation.processing_time}ms</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">建立時間</label>
                  <p className="text-sm text-gray-900">
                    {new Date(generation.created_at).toLocaleString('zh-TW')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">更新時間</label>
                  <p className="text-sm text-gray-900">
                    {new Date(generation.updated_at).toLocaleString('zh-TW')}
                  </p>
                </div>
              </div>

              {/* 輸入資料 */}
              {generation.input_data && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">輸入資料</label>
                  <div className="bg-gray-50 rounded p-3">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(generation.input_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* 輸出資料 */}
              {generation.output_data && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">輸出資料</label>
                  <div className="bg-gray-50 rounded p-3">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(generation.output_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={fetchGenerations}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          重新載入
        </button>
      </div>
    </div>
  );
}
