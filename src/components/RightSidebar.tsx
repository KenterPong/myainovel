'use client'
import { usePopularStories } from '@/lib/hooks/usePopularStories'

export default function RightSidebar() {
  const { popularStories, loading: popularLoading, error: popularError } = usePopularStories()


  const handlePopularStoryClick = (storyId: string) => {
    // 這裡可以添加點擊熱門故事後的處理邏輯
    // 例如：導航到該故事、篩選該故事的章節等
    console.log('點擊熱門故事:', storyId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '投票中':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
      case '撰寫中':
        return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
      case '已完結':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    }
  }

  return (
    <div className="w-full bg-gray-100 border-l border-gray-200 h-screen p-4 lg:p-6 sticky top-0 overflow-y-auto">
      {/* 熱門故事 */}
      <div className="mb-6 lg:mb-8">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">熱門故事</h3>
        {popularLoading ? (
          <div className="space-y-2 lg:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2 lg:p-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : popularError ? (
          <div className="text-sm text-red-500 text-center py-4">
            載入失敗，請稍後再試
          </div>
        ) : (
          <div className="space-y-2 lg:space-y-3">
            {popularStories.slice(0, 5).map((story, index) => {
              const isTop1 = index === 0
              const isTop2 = index === 1
              return (
                <div 
                  key={story.story_id} 
                  onClick={() => handlePopularStoryClick(story.story_id)}
                  className={`flex items-center justify-between p-2 lg:p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
                    isTop1 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 shadow-sm' 
                      : isTop2 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-sm'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {isTop1 && (
                      <span className="text-yellow-500 text-sm font-bold">🔥</span>
                    )}
                    {isTop2 && (
                      <span className="text-orange-500 text-sm font-bold">⭐</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm lg:text-base truncate ${
                        isTop1 ? 'text-purple-800' : isTop2 ? 'text-orange-800' : 'text-gray-700'
                      }`}>
                        {story.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(story.status)}
                        <span className={`text-xs ${
                          story.status === '投票中' ? 'text-yellow-600' : 
                          story.status === '撰寫中' ? 'text-blue-600' : 
                          story.status === '已完結' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {story.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {story.total_chapters} 章
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>


      {/* 廣告區域 */}
      <div className="bg-gray-100 rounded-lg p-3 lg:p-4 text-center">
        <p className="text-xs lg:text-sm text-gray-500 mb-2">廣告二</p>
        <div className="w-full h-32 lg:h-48 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs lg:text-sm">300x300</span>
        </div>
      </div>
    </div>
  )
}
