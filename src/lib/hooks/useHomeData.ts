/**
 * 首頁資料管理 Hook
 */

import { useState, useEffect } from 'react';
import { StoryWithChapter, HomePageData } from '@/types/story';

export function useHomeData() {
  const [stories, setStories] = useState<StoryWithChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取故事列表和最新章節
  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      // 獲取故事列表
      const storiesResponse = await fetch('/api/stories');
      if (!storiesResponse.ok) {
        throw new Error('獲取故事列表失敗');
      }
      const storiesData = await storiesResponse.json();

      if (!storiesData.success) {
        throw new Error(storiesData.message || '獲取故事列表失敗');
      }

      // 為每個故事獲取最新章節和投票資訊
      const storiesWithChapters = await Promise.all(
        storiesData.data.map(async (story: any) => {
          try {
            // 獲取最新章節
            const chaptersResponse = await fetch(`/api/stories/${story.story_id}/chapters`);
            let currentChapter = null;
            
            if (chaptersResponse.ok) {
              const chaptersData = await chaptersResponse.json();
              if (chaptersData.success && chaptersData.data.length > 0) {
                currentChapter = chaptersData.data[0]; // 假設第一個是最新章節
              }
            }

            // 獲取故事起源投票統計
            let originVoting = null;
            try {
              const originResponse = await fetch(`/api/origin/vote?storyId=${story.story_id}`);
              if (originResponse.ok) {
                const originData = await originResponse.json();
                if (originData.success) {
                  originVoting = originData.data;
                }
              }
            } catch (error) {
              console.warn('獲取故事起源投票統計失敗:', error);
            }

            // 獲取章節投票統計（如果有章節）
            let chapterVoting = null;
            if (currentChapter && currentChapter.voting_status === '進行中') {
              try {
                const chapterVoteResponse = await fetch(
                  `/api/stories/${story.story_id}/chapters/${currentChapter.chapter_id}/vote`
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
              ...story,
              current_chapter: currentChapter || {
                chapter_id: 0,
                chapter_number: '000',
                title: '尚未有章節',
                full_text: '',
                summary: '',
                tags: [],
                voting_status: '已生成' as const,
                created_at: story.created_at
              },
              origin_voting: originVoting,
              chapter_voting: chapterVoting
            };
          } catch (error) {
            console.error(`處理故事 ${story.story_id} 時發生錯誤:`, error);
            return {
              ...story,
              current_chapter: {
                chapter_id: 0,
                chapter_number: '000',
                title: '載入失敗',
                full_text: '',
                summary: '',
                tags: [],
                voting_status: '已生成' as const,
                created_at: story.created_at
              }
            };
          }
        })
      );

      setStories(storiesWithChapters);
    } catch (error) {
      console.error('獲取首頁資料失敗:', error);
      setError(error instanceof Error ? error.message : '獲取資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 重新載入資料
  const refetch = () => {
    fetchStories();
  };

  // 初始載入
  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    error,
    refetch
  };
}
