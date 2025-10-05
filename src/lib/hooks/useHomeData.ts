/**
 * 首頁資料管理 Hook - 跨故事章節排序
 */

import { useState, useEffect } from 'react';
import { StoryWithChapter, HomePageData } from '@/types/story';

export function useHomeData() {
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredStoryId, setFilteredStoryId] = useState<string | null>(null);
  const [filteredTag, setFilteredTag] = useState<string | null>(null);
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

      setAllChapters(chaptersWithVoting);
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
    if (storyId) {
      // 如果選擇了故事，清除標籤篩選
      setFilteredTag(null);
    }
    fetchChapters(storyId || undefined);
  };

  // 篩選特定標籤的故事
  const filterByTag = (tag: string | null) => {
    setFilteredTag(tag);
    setCurrentChapterId(null); // 清除當前章節
    if (tag) {
      // 如果選擇了標籤，清除故事篩選
      setFilteredStoryId(null);
    }
    
    // 應用標籤過濾
    if (tag) {
      const filteredChapters = allChapters.filter(chapter => {
        const votingResult = chapter.voting_result;
        let tags = [];
        
        if (votingResult) {
          // 如果有投票結果，使用投票結果
          if (votingResult.genre) tags.push(votingResult.genre);
          if (votingResult.background) tags.push(votingResult.background);
          if (votingResult.theme) tags.push(votingResult.theme);
        } else {
          // 如果沒有投票結果，從標題中解析類型
          const title = chapter.story_title || '';
          
          // 故事類型映射
          const genreMap = {
            '科幻': '科幻',
            '奇幻': '奇幻',
            '懸疑': '懸疑',
            '歷史': '歷史',
            '都市': '都市',
            '末日': '末日'
          };
          
          // 故事背景映射
          const backgroundMap = {
            '校園': '校園',
            '職場': '職場',
            '古代': '古代',
            '冒險': '冒險',
            '超能力': '超能力',
            '推理': '推理'
          };
          
          // 故事主題映射
          const themeMap = {
            'B/G': 'B/G',
            'B/B': 'B/B', 
            'G/G': 'G/G',
            'BL': 'B/B',
            'GL': 'G/G',
            'BG': 'B/G',
            '其他': '其他'
          };
          
          // 嘗試從標題中提取類型
          for (const [key, value] of Object.entries(genreMap)) {
            if (title.includes(key)) {
              tags.push(value);
              break;
            }
          }
          
          for (const [key, value] of Object.entries(backgroundMap)) {
            if (title.includes(key)) {
              tags.push(value);
              break;
            }
          }
          
          for (const [key, value] of Object.entries(themeMap)) {
            if (title.includes(key)) {
              tags.push(value);
              break;
            }
          }
        }
        
        return tags.includes(tag);
      });
      setChapters(filteredChapters);
    } else {
      setChapters(allChapters);
    }
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
    filterByTag,
    navigateToChapter,
    clearCurrentChapter,
    filteredStoryId,
    filteredTag,
    currentChapterId
  };
}
