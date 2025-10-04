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
  const { chapters, loading, error, refetch, filterByStory, navigateToChapter, clearCurrentChapter, filteredStoryId, currentChapterId } = useHomeData()

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
    console.log('投票成功！')
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

      {/* 篩選狀態提示 */}
      {filteredStoryId && !currentChapterId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">
              正在顯示特定故事的章節
            </span>
            <button
              onClick={() => filterByStory(null)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              顯示所有章節
            </button>
          </div>
        </div>
      )}

      {/* 章節查看狀態提示 */}
      {currentChapterId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-green-700">
              正在查看第 {currentChapterId} 章
            </span>
            <div className="space-x-2">
              <button
                onClick={clearCurrentChapter}
                className="text-green-600 hover:text-green-800 underline"
              >
                返回章節列表
              </button>
              <button
                onClick={() => filterByStory(null)}
                className="text-green-600 hover:text-green-800 underline"
              >
                顯示所有章節
              </button>
            </div>
          </div>
        </div>
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
                    filteredStoryId={filteredStoryId}
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
                filteredStoryId={filteredStoryId}
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

