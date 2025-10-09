'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHomeData } from '@/lib/hooks/useHomeData'
import { StoryCard } from '@/components/StoryCard'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { AdminLink } from '@/components/AdminLink'

export default function Home() {
  const router = useRouter()
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // 使用首頁資料 Hook
  const { chapters, loading, error, refetch, filterByStory, navigateToChapter, clearCurrentChapter, filteredStoryId, currentChapterId, filterByTag, filteredTag } = useHomeData()

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      // 向左滑動，下一個頁面
      router.push('/origin')
    } else if (isRightSwipe) {
      // 向右滑動，上一個頁面（首頁沒有上一個，所以不處理）
      return
    }
  }

  // 處理投票成功
  const handleVoteSuccess = () => {
    // 可以添加投票成功後的處理邏輯
    console.log('🎉 首頁收到投票成功回調')
  }

  // 處理新章節生成
  const handleNewChapterGenerated = () => {
    console.log('新章節已生成，正在刷新首頁...')
    // 立即刷新首頁資料
    refetch()
  }

  // 處理查看詳情
  const handleViewDetails = (storyId: string) => {
    // 可以導航到故事詳情頁面
    console.log('查看故事詳情:', storyId)
  }

  // 處理故事標題點擊（篩選功能）
  const handleStoryTitleClick = (storyId: string) => {
    if (filteredStoryId === storyId) {
      // 如果已經在篩選該故事，則取消篩選
      filterByStory(null)
    } else {
      // 篩選該故事的章節
      filterByStory(storyId)
    }
  }

  // 處理標籤點擊（篩選功能）
  const handleTagClick = (tag: string) => {
    if (filteredTag === tag) {
      // 如果已經在篩選該標籤，則取消篩選
      filterByTag(null)
    } else {
      // 篩選該標籤的故事
      filterByTag(tag)
    }
  }

  // 處理章節導航
  const handleChapterNavigate = (storyId: string, chapterNumber: string) => {
    console.log('導航到章節:', { storyId, chapterNumber });
    navigateToChapter(storyId, chapterNumber);
  }


  return (
    <div 
      className="space-y-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* 載入狀態 */}
      {loading && <LoadingState message="載入故事中..." />}

      {/* 錯誤狀態 */}
      {error && (
        <ErrorState 
          message={error} 
          onRetry={refetch}
        />
      )}




      {/* 空資料狀態 */}
      {!loading && !error && chapters.length === 0 && (
        <EmptyState 
          title="暫無章節"
          message="目前沒有可顯示的章節，請稍後再來查看"
          actionText="重新載入"
          onAction={refetch}
        />
      )}

      {/* 章節列表 */}
      {!loading && !error && chapters.length > 0 && (
        <div className="space-y-6">
          {(() => {
            // 如果有當前章節，只顯示該章節
            if (currentChapterId) {
              const targetChapter = chapters.find(chapter => chapter.chapter_number === currentChapterId);
              if (targetChapter) {
                return (
                  <StoryCard
                    key={`${targetChapter.story_id}-${targetChapter.chapter_id}`}
                    chapter={targetChapter}
                    onVoteSuccess={handleVoteSuccess}
                    onViewDetails={handleViewDetails}
                    onNewChapterGenerated={handleNewChapterGenerated}
                    onStoryTitleClick={handleStoryTitleClick}
                    onChapterNavigate={handleChapterNavigate}
                    onTagClick={handleTagClick}
                    filteredStoryId={filteredStoryId}
                    filteredTag={filteredTag}
                  />
                );
              }
            }
            
            // 否則顯示所有章節
            return chapters.map((chapter) => (
              <StoryCard
                key={`${chapter.story_id}-${chapter.chapter_id}`}
                chapter={chapter}
                onVoteSuccess={handleVoteSuccess}
                onViewDetails={handleViewDetails}
                onNewChapterGenerated={handleNewChapterGenerated}
                onStoryTitleClick={handleStoryTitleClick}
                onChapterNavigate={handleChapterNavigate}
                onTagClick={handleTagClick}
                filteredStoryId={filteredStoryId}
                filteredTag={filteredTag}
              />
            ));
          })()}
        </div>
      )}
      
             {/* 管理頁面連結 */}
             <AdminLink />
           </div>
         );
       }

