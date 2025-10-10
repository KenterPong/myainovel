'use client';

import React, { useState, useEffect } from 'react';
import { SatisfactionVoteStats, ShareStats } from '@/types/voting';

interface AnalyticsDashboardProps {
  chapterId: number;
  storyId: string;
}

interface AnalyticsData {
  satisfactionStats: SatisfactionVoteStats | null;
  shareStats: ShareStats | null;
  loading: boolean;
  error: string | null;
}

export default function AnalyticsDashboard({ 
  chapterId, 
  storyId 
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>({
    satisfactionStats: null,
    shareStats: null,
    loading: true,
    error: null
  });

  // 獲取分析數據
  const fetchAnalyticsData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // 並行獲取滿意度投票和分享統計
      const [satisfactionResponse, shareResponse] = await Promise.all([
        fetch(`/api/stories/${storyId}/chapters/${chapterId}/satisfaction`),
        fetch(`/api/stories/${storyId}/chapters/${chapterId}/share`)
      ]);

      const [satisfactionData, shareData] = await Promise.all([
        satisfactionResponse.json(),
        shareResponse.json()
      ]);

      setData({
        satisfactionStats: satisfactionData.success ? satisfactionData.data : null,
        shareStats: shareData.success ? shareData.data : null,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('獲取分析數據失敗:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: '獲取分析數據失敗'
      }));
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [chapterId, storyId]);

  if (data.loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">載入分析數據中...</span>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{data.error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重試
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">章節分析儀表板</h2>
        <p className="text-gray-600">章節 {chapterId} 的互動數據分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 滿意度投票分析 */}
        {data.satisfactionStats && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              滿意度投票分析
            </h3>
            
            <div className="space-y-3">
              {Object.entries(data.satisfactionStats.voteCounts).map(([voteType, count]) => {
                const emoji = {
                  '1': '👍',
                  '2': '⭐', 
                  '3': '🔥',
                  '4': '💖'
                }[voteType] || '❓';
                
                const label = {
                  '1': '喜歡',
                  '2': '精彩',
                  '3': '超讚', 
                  '4': '感動'
                }[voteType] || '未知';

                const percentage = data.satisfactionStats!.totalVotes > 0 
                  ? Math.round((count / data.satisfactionStats!.totalVotes) * 100)
                  : 0;

                return (
                  <div key={voteType} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">總投票數</span>
                <span className="text-lg font-bold text-blue-600">
                  {data.satisfactionStats.totalVotes}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 社群分享分析 */}
        {data.shareStats && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📤</span>
              社群分享分析
            </h3>
            
            <div className="space-y-3">
              {Object.entries(data.shareStats.shareCounts).map(([platform, count]) => {
                const icon = {
                  'twitter': '𝕏',
                  'facebook': '📘',
                  'line': '💬'
                }[platform] || '📱';
                
                const label = {
                  'twitter': 'X (Twitter)',
                  'facebook': 'Facebook',
                  'line': 'Line'
                }[platform] || platform;

                const percentage = data.shareStats!.totalShares > 0 
                  ? Math.round((count / data.shareStats!.totalShares) * 100)
                  : 0;

                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">總分享數</span>
                <span className="text-lg font-bold text-green-600">
                  {data.shareStats.totalShares}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 綜合分析 */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">📈</span>
          綜合分析
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.satisfactionStats?.totalVotes || 0}
            </div>
            <div className="text-sm text-gray-600">總投票數</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.shareStats?.totalShares || 0}
            </div>
            <div className="text-sm text-gray-600">總分享數</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(data.satisfactionStats?.totalVotes || 0) + (data.shareStats?.totalShares || 0)}
            </div>
            <div className="text-sm text-gray-600">總互動數</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.satisfactionStats?.userVoted ? '✅' : '❌'}
            </div>
            <div className="text-sm text-gray-600">已投票</div>
          </div>
        </div>
      </div>

      {/* 重新整理按鈕 */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchAnalyticsData}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重新整理數據
        </button>
      </div>
    </div>
  );
}
