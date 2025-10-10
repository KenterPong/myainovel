/**
 * 章節卡片組件 - 跨故事章節排序顯示
 */

import React, { useState, useEffect } from 'react';
import { ChapterVotingSection } from './ChapterVotingSection';
import { ChapterNavigation } from './ChapterNavigation';
import { ChapterListModal } from './ChapterListModal';
import ChapterIllustration from './ChapterIllustration';
import { getOriginTags } from '@/lib/utils/originTags';
import { 
  SatisfactionVoteType, 
  SatisfactionVoteStats, 
  SatisfactionVoteRequest,
  SharePlatform,
  ShareStats,
  ShareRequest
} from '@/types/voting';
import { FaXTwitter, FaFacebookF, FaLine, FaThreads } from 'react-icons/fa6';

interface ChapterCardProps {
  chapter: any; // 章節資料
  onVoteSuccess?: () => void;
  onViewDetails?: (storyId: string) => void;
  onNewChapterGenerated?: () => void;
  onStoryTitleClick?: (storyId: string) => void;
  onChapterNavigate?: (storyId: string, chapterNumber: string) => void;
  onTagClick?: (tag: string) => void;
  onBackToHome?: () => void;
  filteredStoryId?: string | null;
  filteredTag?: string | null;
}

export function StoryCard({ 
  chapter, 
  onVoteSuccess, 
  onViewDetails, 
  onNewChapterGenerated,
  onStoryTitleClick,
  onChapterNavigate,
  onTagClick,
  onBackToHome,
  filteredStoryId,
  filteredTag
}: ChapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 調試日誌：追蹤 isExpanded 狀態變化
  useEffect(() => {
    console.log(`StoryCard 章節 ${chapter.chapter_number} - isExpanded 變更為: ${isExpanded}`);
  }, [isExpanded, chapter.chapter_number]);
  const [localVotingStatus, setLocalVotingStatus] = useState(chapter.voting_status);
  const [navigationInfo, setNavigationInfo] = useState<any>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [storyChapters, setStoryChapters] = useState<any[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  
  // 階段2功能狀態
  const [satisfactionStats, setSatisfactionStats] = useState<SatisfactionVoteStats | null>(null);
  const [shareStats, setShareStats] = useState<ShareStats | null>(null);
  const [satisfactionLoading, setSatisfactionLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // 同步本地投票狀態
  useEffect(() => {
    setLocalVotingStatus(chapter.voting_status);
  }, [chapter.voting_status]);

  // 獲取章節導航資訊
  useEffect(() => {
    const fetchNavigationInfo = async () => {
      try {
        setNavigationLoading(true);
        const response = await fetch(
          `/api/stories/${chapter.story_id}/chapters/navigation?currentChapter=${chapter.chapter_number}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNavigationInfo(data.data);
          }
        }
      } catch (error) {
        console.error('獲取章節導航資訊失敗:', error);
      } finally {
        setNavigationLoading(false);
      }
    };

    fetchNavigationInfo();
    fetchSatisfactionStats();
  }, [chapter.story_id, chapter.chapter_number]);

  // 格式化投票選項
  const votingOptions = Array.isArray(chapter.voting_options) 
    ? chapter.voting_options.map((option: any) => ({
        id: option.id,
        content: option.content,
        description: option.description,
        votes: option.votes || 0
      }))
    : chapter.voting_options?.options?.map((option: any) => ({
        id: option.id,
        content: option.content,
        description: option.description,
        votes: option.votes || 0
      })) || [];

  // 檢查是否有投票選項（不管投票狀態如何都顯示）
  const hasVotingOptions = votingOptions.length > 0;
  const isVotingActive = localVotingStatus === '投票中';


  // 處理內容點擊展開
  const handleContentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasExpanded = isExpanded;
    setIsExpanded(!isExpanded);
    
    // 如果從展開狀態收合，滾動到章節頂部
    if (wasExpanded) {
      // 先保存當前目標元素
      const currentTarget = e.currentTarget;
      setTimeout(() => {
        if (currentTarget) {
          const chapterElement = currentTarget.closest('.bg-white.rounded-lg.shadow-md');
          if (chapterElement) {
            chapterElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }
      }, 100); // 稍微延遲以確保收合動畫完成
    }
  };

  // 處理滑動手勢（禁用）
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  // 階段2功能處理函數
  // 獲取滿意度投票統計
  const fetchSatisfactionStats = async () => {
    try {
      setSatisfactionLoading(true);
      console.log('獲取滿意度統計:', { chapterId: chapter.chapter_id });
      
      const response = await fetch(
        `/api/stories/${chapter.story_id}/chapters/${chapter.chapter_id}/satisfaction`
      );
      const data = await response.json();
      
      console.log('滿意度統計回應:', data);
      
      if (data.success) {
        setSatisfactionStats(data.data);
      } else {
        console.error('獲取滿意度統計失敗:', data.message);
      }
    } catch (error) {
      console.error('獲取滿意度投票統計失敗:', error);
    } finally {
      setSatisfactionLoading(false);
    }
  };

  // 提交滿意度投票
  const handleSatisfactionVote = async (voteType: SatisfactionVoteType) => {
    // 防止重複點擊
    if (satisfactionLoading || satisfactionStats?.userVoted) {
      return;
    }

    try {
      setSatisfactionLoading(true);
      console.log('提交滿意度投票:', { voteType, chapterId: chapter.chapter_id });
      
      const response = await fetch(
        `/api/stories/${chapter.story_id}/chapters/${chapter.chapter_id}/satisfaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ voteType } as SatisfactionVoteRequest),
        }
      );

      const data = await response.json();
      console.log('投票回應:', data);
      
      if (data.success) {
        setSatisfactionStats(data.data);
        // 投票成功後不要收合文章，保持展開狀態
        // 不調用 setIsExpanded(false)
      } else {
        console.error('投票失敗:', data.message);
      }
    } catch (error) {
      console.error('投票失敗:', error);
    } finally {
      setSatisfactionLoading(false);
    }
  };

  // 獲取分享統計
  const fetchShareStats = async () => {
    try {
      setShareLoading(true);
      const response = await fetch(
        `/api/stories/${chapter.story_id}/chapters/${chapter.chapter_id}/share`
      );
      const data = await response.json();
      
      if (data.success) {
        setShareStats(data.data);
      }
    } catch (error) {
      console.error('獲取分享統計失敗:', error);
    } finally {
      setShareLoading(false);
    }
  };

  // 處理分享
  const handleShare = async (platform: SharePlatform) => {
    try {
      setShareLoading(true);
      
      // 記錄分享到資料庫
      const response = await fetch(
        `/api/stories/${chapter.story_id}/chapters/${chapter.chapter_id}/share`,
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
        setShareStats(data.data);
      }

      // 生成分享內容並開啟分享視窗
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
      const chapterUrl = `${baseUrl}/stories/${chapter.story_id}/chapters/${chapter.chapter_id}`;
      
      const shareContent = {
        text: `📖 ${chapter.story_title} - ${chapter.title}\n\n${chapter.summary?.substring(0, 100)}...\n\n#AIStepMasterS1 #AI小說`,
        url: chapterUrl
      };

      const shareUrl = getShareUrl(platform, shareContent);
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }

    } catch (error) {
      console.error('分享失敗:', error);
    } finally {
      setShareLoading(false);
    }
  };

  // 獲取各平台的分享URL
  const getShareUrl = (platform: SharePlatform, content: any): string | null => {
    const encodedText = encodeURIComponent(content.text);
    const encodedUrl = encodeURIComponent(content.url);

    switch (platform) {
      case SharePlatform.TWITTER:
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      case SharePlatform.FACEBOOK:
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      case SharePlatform.LINE:
        return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;
      case SharePlatform.THREADS:
        return `https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`;
      default:
        return null;
    }
  };

  // 處理章節導航
  const handleChapterNavigate = (direction: 'prev' | 'next') => {
    if (!navigationInfo) return;
    
    const targetChapter = direction === 'prev' ? navigationInfo.prevChapter : navigationInfo.nextChapter;
    if (targetChapter && onChapterNavigate) {
      onChapterNavigate(chapter.story_id, targetChapter.chapter_number);
    }
  };

  // 獲取故事的所有章節
  const fetchStoryChapters = async () => {
    try {
      setChaptersLoading(true);
      const response = await fetch(`/api/stories/${chapter.story_id}/chapters`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStoryChapters(data.data);
        }
      }
    } catch (error) {
      console.error('獲取章節列表失敗:', error);
    } finally {
      setChaptersLoading(false);
    }
  };

  // 處理顯示章節列表
  const handleShowChapterList = () => {
    if (storyChapters.length === 0) {
      fetchStoryChapters();
    }
    setShowChapterList(true);
  };

  // 處理章節選擇
  const handleChapterSelect = (chapterId: number) => {
    const selectedChapter = storyChapters.find(ch => ch.chapter_id === chapterId);
    if (selectedChapter && onChapterNavigate) {
      onChapterNavigate(chapter.story_id, selectedChapter.chapter_number);
    }
  };

  // 處理返回首頁
  const handleBackToHome = () => {
    setShowChapterList(false);
    if (onBackToHome) {
      onBackToHome();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* 章節內容 */}
      <div className="p-6">
        <div className="mb-4">
          {/* 故事標題 */}
          <div className="mb-2">
            <h2 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
              onClick={() => onStoryTitleClick?.(chapter.story_id)}
            >
              {chapter.story_title}
            </h2>
          </div>
          
          {/* 故事類型標籤 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {(() => {
              // 從 voting_result 中獲取故事的三個類型標籤
              const votingResult = chapter.voting_result;
              let tags = [];
              
              if (votingResult) {
                // 如果有投票結果，使用投票結果
                if (votingResult.genre) tags.push(votingResult.genre);
                if (votingResult.background) tags.push(votingResult.background);
                if (votingResult.theme) tags.push(votingResult.theme);
              } else {
                // 如果沒有投票結果，嘗試從故事標題中解析類型
                const title = chapter.story_title || '';
                
                // 從標題中提取類型資訊（例如：「科幻職場BL的奇幻冒險」）
                // 科幻 -> 故事類型
                // 職場 -> 故事背景  
                // BL -> 故事主題
                
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
              
              return tags.map((tag, index) => {
                // 檢查是否為當前選中的標籤
                const isSelected = filteredTag === tag;
                
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                    className={`px-2 py-1 text-xs rounded-full transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-green-100 text-green-800 border-2 border-green-600 hover:bg-green-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800'
                    }`}
                  >
                    {tag}
                  </button>
                );
              });
            })()}
          </div>
          
          {/* 章節標題和投票狀態 */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-gray-800 flex-1">
              <span className="font-bold">{chapter.chapter_number}</span> <span className="font-bold">{chapter.title}</span>
            </h3>
            
            {/* 投票狀態 - 右邊 */}
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium ml-2
              ${localVotingStatus === '投票中' ? 'bg-purple-100 text-purple-800' :
                localVotingStatus === '已投票' ? 'bg-green-100 text-green-800' :
                localVotingStatus === '投票截止' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {localVotingStatus}
            </span>
          </div>


          {/* 章節插圖 */}
          {chapter.illustration_url && (
            <div className="mb-4">
              <ChapterIllustration
                illustrationUrl={chapter.illustration_url}
                illustrationPrompt={chapter.illustration_prompt}
                illustrationStyle={chapter.illustration_style}
                chapterTitle={chapter.title}
                className="w-full"
              />
            </div>
          )}
          <div 
            className="text-gray-700 leading-relaxed cursor-pointer"
            onClick={handleContentClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {(() => {
              const text = isExpanded ? chapter.full_text : chapter.full_text.substring(0, 200) + '...';
              // 按段落分割文字（以兩個換行符或句號+空格為分隔符）
              const paragraphs = text.split(/\n\s*\n|\.\s+(?=[A-Z\u4e00-\u9fff])/).filter((p: string) => p.trim());
              
              return (
                <div className="space-y-3">
                  {paragraphs.map((paragraph: string, index: number) => (
                    <p key={index} className="text-justify indent-8">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              );
            })()}
            {!isExpanded && chapter.full_text.length > 200 && (
              <span className="text-purple-600 hover:text-purple-800 font-medium ml-1">
                點擊展開完整內容
              </span>
            )}
            {isExpanded && chapter.full_text.length > 200 && (
              <span className="text-purple-600 hover:text-purple-800 font-medium ml-1">
                點擊收合
              </span>
            )}
            
            {/* 滿意度投票區域 - 在展開的文章內容中，章節投票之前 */}
            {isExpanded && (
              <div className="mt-6 mb-4">
                <div className="flex items-center justify-start px-2 py-2 bg-gray-50 rounded-lg">
                  <div className="flex space-x-1">
                    {Object.values(SatisfactionVoteType)
                      .filter((v): v is SatisfactionVoteType => typeof v === 'number')
                      .map((voteType) => {
                      const isSelected = satisfactionStats?.userVoted && satisfactionStats?.userVoteType === voteType;
                      const count = satisfactionStats?.voteCounts[voteType] || 0;
                      const emoji = {
                        [SatisfactionVoteType.LIKE]: '👍',
                        [SatisfactionVoteType.STAR]: '⭐',
                        [SatisfactionVoteType.FIRE]: '🔥',
                        [SatisfactionVoteType.HEART]: '💖'
                      }[voteType] || '❓';

                      return (
                        <button
                          key={voteType}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // 阻止事件冒泡，避免觸發文章收合
                            if (!satisfactionStats) {
                              fetchSatisfactionStats();
                            }
                            handleSatisfactionVote(voteType);
                          }}
                          disabled={satisfactionStats?.userVoted}
                            className={`
                              relative p-2 rounded-lg border-2 transition-all duration-200 text-lg
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : satisfactionStats?.userVoted
                                  ? 'border-gray-300 bg-gray-100 text-gray-500'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }
                              ${satisfactionStats?.userVoted ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                          title={satisfactionStats?.userVoted ? '已投票，無法再次投票' : '點擊投票'}
                        >
                          {emoji}
                          {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* 章節投票區域 - 只在展開時顯示 */}
            {isExpanded && hasVotingOptions && (
              <div className="mt-6">
                <ChapterVotingSection
                  storyId={chapter.story_id}
                  chapterId={chapter.chapter_id}
                  votingOptions={votingOptions}
                  onVoteSuccess={onVoteSuccess}
                  onVotingStatusChange={setLocalVotingStatus}
                  isVotingActive={isVotingActive}
                  onNewChapterGenerated={onNewChapterGenerated}
                />
              </div>
            )}

          </div>
        </div>


        {/* 社群分享區域 - 在章節導航上方 */}
        <div className="flex items-center justify-end mb-3 px-2 sm:px-4 py-2 bg-gray-50 rounded-lg">
          <div className="flex space-x-1">
            {Object.values(SharePlatform).map((platform) => {
              const count = shareStats?.shareCounts[platform] || 0;
              const icon = { 
                'twitter': <FaXTwitter className="text-black" />, 
                'facebook': <FaFacebookF className="text-blue-600" />, 
                'line': <FaLine className="text-green-500" />,
                'threads': <FaThreads className="text-black" />
              }[platform] || <FaXTwitter />;
              const label = { 'twitter': 'X', 'facebook': 'Facebook', 'line': 'Line', 'threads': 'Threads' }[platform] || platform;

              return (
                <button
                  key={platform}
                  onClick={() => {
                    if (!shareStats) {
                      fetchShareStats();
                    }
                    handleShare(platform);
                  }}
                    className="relative p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer text-lg"
                  title={`分享到 ${label}`}
                >
                  {icon}
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 章節導航區域 */}
        <ChapterNavigation
          storyId={chapter.story_id}
          currentChapterNumber={chapter.chapter_number}
          onNavigate={handleChapterNavigate}
          onShowChapterList={handleShowChapterList}
          hasPrev={!!navigationInfo?.prevChapter}
          hasNext={!!navigationInfo?.nextChapter}
          loading={navigationLoading}
          showChapterList={showChapterList}
        />

        {/* 章節列表彈窗 */}
        {showChapterList && (
          <ChapterListModal
            storyId={chapter.story_id}
            storyTitle={chapter.story_title || '未知故事'}
            chapters={storyChapters}
            currentChapterId={chapter.chapter_id}
            onChapterSelect={handleChapterSelect}
            onClose={() => setShowChapterList(false)}
            loading={chaptersLoading}
          />
        )}

      </div>
    </div>
  );
}
