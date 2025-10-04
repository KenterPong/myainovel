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
  const { stories, loading, error, refetch } = useHomeData()

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

  // 處理查看詳情
  const handleViewDetails = (storyId: string) => {
    // 可以導航到故事詳情頁面
    console.log('查看故事詳情:', storyId)
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
      {!loading && !error && stories.length === 0 && (
        <EmptyState 
          title="暫無故事"
          message="目前沒有可顯示的故事，請稍後再來查看"
          actionText="重新載入"
          onAction={refetch}
        />
      )}

      {/* 故事列表 */}
      {!loading && !error && stories.length > 0 && (
        <div className="space-y-6">
          {stories.map((story) => (
            <StoryCard
              key={story.story_id}
              story={story}
              onVoteSuccess={handleVoteSuccess}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
      
             {/* 管理頁面連結 */}
             <AdminLink />
           </div>
         );
       }

