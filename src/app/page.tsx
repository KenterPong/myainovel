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
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 story-card border border-gray-100">
      {/* 故事標題和時間 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">#{title}</h2>
        <span className="text-sm text-gray-500">{timeAgo}</span>
      </div>

      {/* 章節標題 */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{chapterTitle}</h3>

      {/* 故事內容 */}
      <p className="text-gray-700 mb-4 leading-relaxed">{content}</p>

      {/* 標籤 */}
      <div className="flex flex-wrap gap-2 mb-4 tags">
        {tags.map((tag, index) => (
          <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full tag">
            {tag}
          </span>
        ))}
      </div>

      {/* 展開內容連結 */}
      <div className="mb-4">
        <a href="#" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          點擊展開完整內容
        </a>
      </div>

      {/* 章節間廣告 */}
      <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
        <p className="text-sm text-gray-500 mb-2">章節間廣告</p>
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
          <div className="mb-4">
            <span className="text-sm text-gray-600">投票截止倒數: </span>
            <span className="text-sm font-mono text-secondary-600">{votingDeadline}</span>
          </div>
          <div className="space-y-2 voting-options">
            {votingOptions?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer vote-option">
                <input type="radio" name={`vote-${storyId}`} value={option} className="text-primary-600" />
                <span className="text-gray-700 text-sm sm:text-base">{option}</span>
              </label>
            ))}
          </div>
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
          <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 btn-animate">
            <span>❤️</span>
            <span className="text-sm">{engagement.likes.toLocaleString()}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 btn-animate">
            <span>💬</span>
            <span className="text-sm">{engagement.comments.toLocaleString()}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500 btn-animate">
            <span>📤</span>
            <span className="text-sm">{engagement.shares}</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-primary-600 text-sm btn-animate">收藏</button>
          <button className="text-gray-600 hover:text-red-600 text-sm btn-animate">檢舉</button>
        </div>
      </div>
    </div>
  )
}
