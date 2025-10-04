/**
 * 首頁資料管理 Hook - 跨故事章節排序
 */

import { useState, useEffect } from 'react';
import { StoryWithChapter, HomePageData } from '@/types/story';

export function useHomeData() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredStoryId, setFilteredStoryId] = useState<string | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);

  // 獲取所有章節，按生成時間由新到舊排序
  const fetchChapters = async (storyId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // 構建 API URL
      const url = storyId ? `/api/chapters?storyId=${storyId}` : '/api/chapters';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('獲取章節列表失敗');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '獲取章節列表失敗');
      }

      // 為每個章節獲取投票資訊
      const chaptersWithVoting = await Promise.all(
        data.data.map(async (chapter: any) => {
          try {
            // 獲取故事起源投票統計
            let originVoting = null;
            try {
              const originResponse = await fetch(`/api/origin/vote?storyId=${chapter.story_id}`);
              if (originResponse.ok) {
                const originData = await originResponse.json();
                if (originData.success) {
                  originVoting = originData.data;
                }
              }
            } catch (error) {
              console.warn('獲取故事起源投票統計失敗:', error);
            }

            // 獲取章節投票統計（如果章節正在投票中）
            let chapterVoting = null;
            if (chapter.voting_status === '投票中') {
              try {
                const chapterVoteResponse = await fetch(
                  `/api/stories/${chapter.story_id}/chapters/${chapter.chapter_id}/vote`
                );
                if (chapterVoteResponse.ok) {
                  const chapterVoteData = await chapterVoteResponse.json();
                  if (chapterVoteData.success) {
                    chapterVoting = chapterVoteData.data;
                  }
                }
              } catch (error) {
                console.warn('獲取章節投票統計失敗:', error);
              }
            }

            return {
              ...chapter,
              origin_voting: originVoting,
              chapter_voting: chapterVoting
            };
          } catch (error) {
            console.error(`處理章節 ${chapter.chapter_id} 時發生錯誤:`, error);
            return chapter; // 即使投票資訊獲取失敗，也返回章節基本資訊
          }
        })
      );

      setChapters(chaptersWithVoting);
    } catch (error) {
      console.error('獲取章節資料失敗:', error);
      setError(error instanceof Error ? error.message : '獲取資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 重新載入資料
  const refetch = () => {
    fetchChapters(filteredStoryId || undefined);
  };

  // 篩選特定故事的章節
  const filterByStory = (storyId: string | null) => {
    setFilteredStoryId(storyId);
    setCurrentChapterId(null); // 清除當前章節
    fetchChapters(storyId || undefined);
  };

  // 跳轉到特定章節
  const navigateToChapter = (storyId: string, chapterNumber: string) => {
    setFilteredStoryId(storyId);
    setCurrentChapterId(chapterNumber);
    fetchChapters(storyId);
  };

  // 清除當前章節
  const clearCurrentChapter = () => {
    setCurrentChapterId(null);
  };

  // 初始載入
  useEffect(() => {
    fetchChapters();
  }, []);

  // 定期刷新資料（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChapters(filteredStoryId || undefined);
    }, 30000); // 30秒

    return () => clearInterval(interval);
  }, [filteredStoryId]);

  return {
    chapters,
    loading,
    error,
    refetch,
    filterByStory,
    navigateToChapter,
    clearCurrentChapter,
    filteredStoryId,
    currentChapterId
  };
}
