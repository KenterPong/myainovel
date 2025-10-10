'use client';

import React, { useState, useEffect } from 'react';
import { 
  SharePlatform, 
  ShareStats, 
  ShareRequest,
  ShareContent 
} from '@/types/voting';

interface SocialSharingProps {
  chapterId: number;
  storyId: string;
  chapterTitle: string;
  chapterSummary: string;
  storyTitle: string;
  onShare?: (stats: ShareStats) => void;
}

const PLATFORM_ICONS = {
  [SharePlatform.TWITTER]: '𝕏',
  [SharePlatform.FACEBOOK]: '📘',
  [SharePlatform.LINE]: '💬',
};

const PLATFORM_LABELS = {
  [SharePlatform.TWITTER]: 'X (Twitter)',
  [SharePlatform.FACEBOOK]: 'Facebook',
  [SharePlatform.LINE]: 'Line',
};

const PLATFORM_COLORS = {
  [SharePlatform.TWITTER]: 'hover:bg-gray-100 border-gray-300',
  [SharePlatform.FACEBOOK]: 'hover:bg-blue-50 border-blue-300',
  [SharePlatform.LINE]: 'hover:bg-green-50 border-green-300',
};

export default function SocialSharing({ 
  chapterId, 
  storyId, 
  chapterTitle,
  chapterSummary,
  storyTitle,
  onShare 
}: SocialSharingProps) {
  const [stats, setStats] = useState<ShareStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState<SharePlatform | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // 獲取分享統計
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/stories/${storyId}/chapters/${chapterId}/share`
      );
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('獲取分享統計失敗:', err);
      setError('獲取分享統計失敗');
    } finally {
      setLoading(false);
    }
  };

  // 生成分享內容
  const generateShareContent = (platform: SharePlatform): ShareContent => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const chapterUrl = `${baseUrl}/stories/${storyId}/chapters/${chapterId}`;
    
    // 根據平台調整字元限制
    const maxLength = platform === SharePlatform.TWITTER ? 200 : 300;
    
    // 生成動態 Hashtag
    const hashtags = ['#AIStepMasterS1', '#AI小說', '#互動小說'];
    
    // 生成分享文案
    let text = `📖 ${storyTitle} - ${chapterTitle}\n\n`;
    text += `${chapterSummary.substring(0, maxLength - text.length - hashtags.join(' ').length - 10)}...\n\n`;
    text += hashtags.join(' ');
    
    return {
      text,
      hashtags,
      url: chapterUrl,
    };
  };

  // 處理分享
  const handleShare = async (platform: SharePlatform) => {
    try {
      setSharing(platform);
      setError(null);

      // 生成分享內容
      const shareContent = generateShareContent(platform);
      
      // 記錄分享到資料庫
      const response = await fetch(
        `/api/stories/${storyId}/chapters/${chapterId}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ platform } as ShareRequest),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        onShare?.(data.data);
        
        // 顯示成功訊息
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(data.message);
      }

      // 開啟分享視窗
      const shareUrl = getShareUrl(platform, shareContent);
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }

    } catch (err) {
      console.error('分享失敗:', err);
      setError('分享失敗，請稍後再試');
    } finally {
      setSharing(null);
    }
  };

  // 獲取各平台的分享URL
  const getShareUrl = (platform: SharePlatform, content: ShareContent): string | null => {
    const encodedText = encodeURIComponent(content.text);
    const encodedUrl = encodeURIComponent(content.url);

    switch (platform) {
      case SharePlatform.TWITTER:
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      case SharePlatform.FACEBOOK:
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      case SharePlatform.LINE:
        return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;
      default:
        return null;
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
          分享這章節
        </h3>
        <p className="text-sm text-gray-600">
          讓更多人看到這個精彩的故事
        </p>
      </div>

      {/* 分享按鈕 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {Object.values(SharePlatform).map((platform) => {
          const isSharing = sharing === platform;
          const count = stats.shareCounts[platform];

          return (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              disabled={isSharing}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                ${PLATFORM_COLORS[platform]}
                ${isSharing ? 'opacity-50 cursor-not-allowed animate-pulse' : 'cursor-pointer'}
              `}
            >
              <span className="text-2xl mb-1">
                {PLATFORM_ICONS[platform]}
              </span>
              <span className="text-xs font-medium">
                {PLATFORM_LABELS[platform]}
              </span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 總分享數 */}
      {stats.totalShares > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            共 {stats.totalShares} 次分享
          </p>
        </div>
      )}

      {/* 成功提示訊息 */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>分享成功！</span>
          </div>
        </div>
      )}

      {/* Instagram 導向教學 */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📸</span>
          <div>
            <p className="text-sm font-medium text-gray-800">Instagram 分享</p>
            <p className="text-xs text-gray-600">
              複製連結到 Instagram 限時動態分享
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const chapterUrl = `${baseUrl}/stories/${storyId}/chapters/${chapterId}`;
            navigator.clipboard.writeText(chapterUrl);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          }}
          className="mt-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs py-2 px-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
        >
          複製連結
        </button>
      </div>
    </div>
  );
}
