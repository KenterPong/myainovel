'use client'
import { useState } from 'react'
import MobileRecommendations from '@/components/MobileRecommendations'

export default function Home() {
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">最新章節</h1>
        <p className="text-gray-600">跟隨故事的最新發展</p>
      </div>

      {/* 故事內容區域 */}
      <div className="space-y-6">
        {/* 故事 1: 勇者傳說 */}
        <StoryCard
          storyId="hero-legend"
          title="勇者傳說"
          timeAgo="2小時前"
          chapterTitle="第15章:意想不到的發展"
          content="雷歐站在古老神殿的中央，手中的聖劍散發著微弱的光芒。突然，一個熟悉的身影從陰影中走出——是他失蹤多年的師父艾德里安。但雷歐注意到，師父的眼神似乎有些不同尋常..."
          tags={["#奇幻冒險", "#勇者雷歐", "#神秘師父"]}
          hasVoting={true}
          votingDeadline="23:45:03"
          votingOptions={[
            "選項A: 直接詢問師父為何出現在此處",
            "選項B: 保持警戒,暗中觀察師父的異常",
            "選項C: 假裝沒有發現異常,跟師父進入神殿",
            "選項D: 立即使用聖劍的力量測試師父的真實性"
          ]}
          engagement={{ likes: 5800, comments: 1200, shares: 234 }}
        />

        {/* 故事 2: 星際冒險 */}
        <StoryCard
          storyId="space-adventure"
          title="星際冒險"
          timeAgo="5小時前"
          chapterTitle="第8章:未知星球的秘密"
          content="艾莉絲的太空船迫降在這個神秘的星球上。周圍的植物散發著淡藍色的光芒，天空中漂浮著巨大的水晶結構。她感覺到有什麼東西正在觀察著她..."
          tags={["#科幻", "#太空探險", "#神秘星球"]}
          hasVoting={false}
          votingResults={[
            { option: "A. 謹慎探索周圍環境", percentage: 45, color: "bg-accent-500" },
            { option: "B. 嘗試與觀察者接觸", percentage: 30, color: "bg-secondary-500" },
            { option: "C. 立即修理太空船準備離開", percentage: 25, color: "bg-primary-500" }
          ]}
          engagement={{ likes: 3200, comments: 856, shares: 167 }}
        />

        {/* 故事 3: 魔法學院 */}
        <StoryCard
          storyId="magic-academy"
          title="魔法學院"
          timeAgo="1天前"
          chapterTitle="第12章:期末考試的挑戰"
          content="莉亞站在魔法陣的中央，面前有三扇不同顏色的門。紅色的門內傳來火焰的咆哮聲，藍色的門散發著刺骨的寒氣，綠色的門則蘊含著神秘的自然力量。她必須選擇一扇門來證明自己的實力..."
          tags={["#魔法學院", "#校園生活", "#考試挑戰"]}
          hasVoting={true}
          votingDeadline="明天 18:00"
          votingOptions={[
            "選項A: 選擇紅色的火焰之門",
            "選項B: 選擇藍色的冰霜之門",
            "選項C: 選擇綠色的自然之門",
            "選項D: 嘗試同時打開三道門"
          ]}
          engagement={{ likes: 2500, comments: 743, shares: 89 }}
        />
      </div>
      
      {/* 行動版推薦故事 */}
      <MobileRecommendations />
    </div>
  );
}

// 故事卡片組件
function StoryCard({ 
  storyId, 
  title, 
  timeAgo, 
  chapterTitle, 
  content, 
  tags, 
  hasVoting, 
  votingDeadline, 
  votingOptions, 
  votingResults, 
  engagement 
}: {
  storyId: string
  title: string
  timeAgo: string
  chapterTitle: string
  content: string
  tags: string[]
  hasVoting: boolean
  votingDeadline?: string
  votingOptions?: string[]
  votingResults?: Array<{ option: string; percentage: number; color: string }>
  engagement: { likes: number; comments: number; shares: number }
}) {
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [showVoteFeedback, setShowVoteFeedback] = useState(false)
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({
    '選項A: 直接詢問師父為何出現在此處': 1240,
    '選項B: 保持警戒,暗中觀察師父的異常': 890,
    '選項C: 假裝沒有發現異常,跟師父進入神殿': 650,
    '選項D: 立即使用聖劍的力量測試師父的真實性': 420
  })

  const handleVote = (option: string) => {
    setSelectedVote(option)
    setShowVoteFeedback(true)
    // 模擬投票計數更新
    setVoteCounts(prev => ({
      ...prev,
      [option]: prev[option] + 1
    }))
    
    // 3秒後隱藏回饋
    setTimeout(() => setShowVoteFeedback(false), 3000)
  }
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 story-card border border-gray-100">
      {/* 故事標題和時間 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">#{title}</h2>
        <span className="text-sm text-gray-500">{timeAgo}</span>
      </div>

      {/* 章節標題與追蹤按鈕 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900 flex-1">{chapterTitle}</h3>
        <button className="ml-4 px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors duration-200 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a10 10 0 1 1 20 0v5z" />
          </svg>
          <span>追蹤故事</span>
        </button>
      </div>

      {/* 故事內容 */}
      <p className="text-gray-700 mb-4 leading-relaxed" style={{ lineHeight: '1.6em' }}>{content}</p>

      {/* 標籤 */}
      <div className="flex flex-wrap gap-2 mb-4 tags">
        {tags.map((tag, index) => (
          <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full tag">
            {tag}
          </span>
        ))}
      </div>

      {/* 展開內容連結與行動版操作按鈕 */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <a href="#" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          點擊展開完整內容
        </a>
        {/* 行動版收藏/檢舉按鈕 */}
        <div className="flex items-center space-x-4 lg:hidden">
          <button className="text-gray-600 hover:text-primary-600 text-sm btn-animate px-2 py-1 rounded-lg hover:bg-primary-50 transition-all duration-200">收藏</button>
          <button className="text-gray-600 hover:text-red-600 text-sm btn-animate px-2 py-1 rounded-lg hover:bg-red-50 transition-all duration-200">檢舉</button>
        </div>
      </div>

      {/* 章節間廣告 */}
      <div className="bg-gray-50 rounded-lg p-3 text-center mb-4 border border-gray-200">
        <p className="text-xs text-gray-400 mb-2 font-medium">廣告</p>
        <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400 text-sm">728x90</span>
        </div>
      </div>

      {/* 投票區域 */}
      {hasVoting ? (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            請選擇下一章的故事走向
          </h4>
          <div className="mb-4 flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span className="text-sm text-gray-600">投票截止倒數: </span>
            <span className="text-sm font-mono text-red-500 font-semibold">{votingDeadline}</span>
          </div>
          <div className="space-y-3 voting-options">
            {votingOptions?.map((option, index) => {
              const isSelected = selectedVote === option
              const voteCount = voteCounts[option] || 0
              const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0)
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
              
              return (
                <label 
                  key={index} 
                  className={`group flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer vote-option transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                  onClick={() => handleVote(option)}
                >
                  <div className="relative">
                    <input 
                      type="radio" 
                      name={`vote-${storyId}`} 
                      value={option} 
                      checked={isSelected}
                      onChange={() => handleVote(option)}
                      className="sr-only peer" 
                    />
                    <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-500' 
                        : 'border-gray-300 group-hover:border-primary-400'
                    }`}>
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className={`text-base sm:text-lg font-medium transition-colors duration-200 ${
                      isSelected ? 'text-primary-700' : 'text-gray-700 group-hover:text-primary-700'
                    }`}>{option}</span>
                    {isSelected && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-primary-600">
                        <span className="font-semibold">✓ 你已投票</span>
                        <span>•</span>
                        <span>{voteCount} 票 ({percentage}%)</span>
                      </div>
                    )}
                  </div>
                  {!isSelected && (
                    <div className="text-sm text-gray-500">
                      {voteCount} 票
                    </div>
                  )}
                </label>
              )
            })}
          </div>
          
          {/* 投票回饋提示 */}
          {showVoteFeedback && selectedVote && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 animate-pulse">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-green-700 font-medium">投票成功！你的選擇已記錄</span>
            </div>
          )}
        </div>
      ) : votingResults ? (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">投票結果 (已截止)</h4>
          <div className="space-y-3">
            {votingResults.map((result, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{result.option}</span>
                  <span className="text-gray-600">{result.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${result.color}`}
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 互動統計 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 gap-4">
        <div className="flex items-center space-x-4 sm:space-x-6 engagement-stats">
          <button className="group flex items-center space-x-1 text-gray-600 hover:text-red-500 btn-animate px-2 py-1 rounded-lg hover:bg-red-50 transition-all duration-200">
            <span className="group-hover:scale-110 transition-transform duration-200">❤️</span>
            <span className="text-sm font-medium group-hover:scale-105 transition-transform duration-200">{engagement.likes.toLocaleString()}</span>
          </button>
          <button className="group flex items-center space-x-1 text-gray-600 hover:text-blue-500 btn-animate px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200">
            <span className="group-hover:scale-110 transition-transform duration-200">💬</span>
            <span className="text-sm font-medium group-hover:scale-105 transition-transform duration-200">{engagement.comments.toLocaleString()}</span>
          </button>
          <button className="group flex items-center space-x-1 text-gray-600 hover:text-green-500 btn-animate px-2 py-1 rounded-lg hover:bg-green-50 transition-all duration-200">
            <span className="group-hover:scale-110 transition-transform duration-200">📤</span>
            <span className="text-sm font-medium group-hover:scale-105 transition-transform duration-200">{engagement.shares}</span>
          </button>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <button className="text-gray-600 hover:text-primary-600 text-sm btn-animate px-2 py-1 rounded-lg hover:bg-primary-50 transition-all duration-200">收藏</button>
          <button className="text-gray-600 hover:text-red-600 text-sm btn-animate px-2 py-1 rounded-lg hover:bg-red-50 transition-all duration-200">檢舉</button>
        </div>
      </div>
    </div>
  )
}
