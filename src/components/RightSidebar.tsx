'use client'
import { useState } from 'react'

export default function RightSidebar() {
  const [followedStories, setFollowedStories] = useState<Set<string>>(new Set())

  const trendingTopics = [
    { name: '#神秘師父', discussions: 1234, rank: 1 },
    { name: '#星際探險', discussions: 856, rank: 2 },
    { name: '#魔法考試', discussions: 743, rank: 3 },
  ]

  const recommendedStories = [
    {
      id: 'dragon-legend',
      title: '#龍族傳說',
      description: '奇幻冒險。傳說中',
      type: '奇幻冒險',
      status: '連載中'
    },
    {
      id: 'time-traveler',
      title: '#時空旅者',
      description: '科幻懸疑。即將開始',
      type: '科幻懸疑',
      status: '即將開始'
    },
    {
      id: 'campus-romance',
      title: '#校園戀曲',
      description: '青春愛情。連眼中',
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
    <div className="w-full bg-gray-100 border-l border-gray-200 h-screen p-4 lg:p-6 sticky top-0 overflow-y-auto">
      {/* 趨勢話題 */}
      <div className="mb-6 lg:mb-8">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">趨勢話題</h3>
        <div className="space-y-2 lg:space-y-3">
          {trendingTopics.map((topic, index) => {
            const isTop1 = topic.rank === 1
            const isTop2 = topic.rank === 2
            return (
              <div key={index} className={`flex items-center justify-between p-2 lg:p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
                isTop1 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 shadow-sm' 
                  : isTop2 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-sm'
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2">
                  {isTop1 && (
                    <span className="text-yellow-500 text-sm font-bold">🔥</span>
                  )}
                  {isTop2 && (
                    <span className="text-orange-500 text-sm font-bold">⭐</span>
                  )}
                  <span className={`font-medium text-sm lg:text-base truncate ${
                    isTop1 ? 'text-purple-800' : isTop2 ? 'text-orange-800' : 'text-gray-700'
                  }`}>{topic.name}</span>
                </div>
                <span className={`text-xs lg:text-sm flex-shrink-0 ml-2 ${
                  isTop1 ? 'text-purple-600 font-semibold' : isTop2 ? 'text-orange-600 font-semibold' : 'text-gray-500'
                }`}>{topic.discussions} 討論</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 推薦故事 */}
      <div className="mb-6 lg:mb-8">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">推薦故事</h3>
        <div className="space-y-3 lg:space-y-4">
          {recommendedStories.map((story) => (
            <div key={story.id} className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">{story.title}</h4>
                <button
                  onClick={() => handleFollow(story.id)}
                  className={`px-2 lg:px-3 py-1 text-xs rounded-full transition-colors flex-shrink-0 ml-2 ${
                    followedStories.has(story.id)
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700'
                  }`}
                >
                  {followedStories.has(story.id) ? '已關注' : '關注'}
                </button>
              </div>
              <p className="text-xs lg:text-sm text-gray-600 mb-2 line-clamp-2">{story.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-600 font-medium">{story.type}</span>
                <span className="text-xs text-gray-500">{story.status}</span>
              </div>
            </div>
          ))}
        </div>
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
