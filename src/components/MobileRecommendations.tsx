'use client'
import { useState } from 'react'

export default function MobileRecommendations() {
  const [followedStories, setFollowedStories] = useState<Set<string>>(new Set())

  const recommendedStories = [
    {
      id: 'dragon-legend',
      title: '#龍族傳說',
      description: '奇幻冒險。傳說中的龍族與人類的戰爭即將展開，主角必須選擇自己的立場...',
      type: '奇幻冒險',
      status: '連載中'
    },
    {
      id: 'time-traveler',
      title: '#時空旅者',
      description: '科幻懸疑。一位科學家意外發現了時間旅行的秘密，但代價是什麼？',
      type: '科幻懸疑',
      status: '即將開始'
    },
    {
      id: 'campus-romance',
      title: '#校園戀曲',
      description: '青春愛情。大學校園裡的青澀戀情，友情與愛情的糾葛...',
      type: '青春愛情',
      status: '連載中'
    },
  ]

  const handleFollow = (storyId: string) => {
    setFollowedStories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(storyId)) {
        newSet.delete(storyId)
      } else {
        newSet.add(storyId)
      }
      return newSet
    })
  }

  return (
    <div className="lg:hidden mt-8">
      {/* 推薦故事標題 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">推薦故事</h3>
        <p className="text-sm text-gray-600">發現更多精彩內容</p>
      </div>
      
      {/* 推薦故事列表 */}
      <div className="space-y-4">
        {recommendedStories.map((story) => (
          <div key={story.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-base truncate">{story.title}</h4>
              <button
                onClick={() => handleFollow(story.id)}
                className={`px-3 py-1 text-xs rounded-full transition-colors flex-shrink-0 ml-2 ${
                  followedStories.has(story.id)
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700'
                }`}
              >
                {followedStories.has(story.id) ? '已關注' : '關注'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{story.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary-600 font-medium">{story.type}</span>
              <span className="text-xs text-gray-500">{story.status}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* 行動版廣告 */}
      <div className="mt-6 bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
        <p className="text-xs text-gray-400 mb-2 font-medium">廣告</p>
        <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400 text-sm">320x50</span>
        </div>
      </div>
    </div>
  )
}
