'use client'

export default function AdBanner() {

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-purple-100 border-t border-purple-200 h-16">
      <div className="w-full h-16 bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-500 opacity-80"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-10"></div>
        
        
        {/* 廣告內容 */}
        <div className="flex items-center space-x-3 text-white relative z-10">
          <div className="w-8 h-8 bg-white bg-opacity-25 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold">AI聚作 Premium</div>
            <div className="text-xs opacity-90">解鎖更多故事功能</div>
          </div>
          <div className="ml-2">
            <div className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-semibold">
              立即升級
            </div>
          </div>
        </div>
        
        {/* 點擊區域 */}
        <div className="absolute inset-0 cursor-pointer z-10" onClick={() => {
          // 這裡可以添加點擊廣告的處理邏輯
          console.log('廣告被點擊')
        }} />
      </div>
    </div>
  )
}
