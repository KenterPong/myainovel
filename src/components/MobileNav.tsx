'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const pathname = usePathname()

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsExploreOpen(false)
      setIsClosing(false)
    }, 300)
  }

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

    if (isLeftSwipe && !isExploreOpen) {
      setIsExploreOpen(true)
    } else if (isRightSwipe && !isExploreOpen) {
      setIsExploreOpen(true)
    }
    
    // 重置觸控狀態
    setTouchStart(null)
    setTouchEnd(null)
  }

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 向下滾動且超過100px時隱藏header
        setIsHeaderVisible(false)
      } else {
        // 向上滾動時顯示header
        setIsHeaderVisible(true)
      }
      
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const trendingTopics = [
    { name: '#神秘師父', discussions: 1234 },
    { name: '#星際探險', discussions: 856 },
    { name: '#魔法考試', discussions: 743 },
    { name: '#校園戀曲', discussions: 621 },
    { name: '#時空旅者', discussions: 589 },
  ]

  const navigationItems = [
    { name: '首頁', href: '/', icon: '🏠' },
    { name: '探索', href: '/explore', icon: '🔍' },
    { name: '故事起源', href: '/origin', icon: '📚' },
    { name: '我的收藏', href: '/collection', icon: '❤️' },
    { name: '通知', href: '/notifications', icon: '🔔' },
    { name: '個人檔案', href: '/profile', icon: '👤' },
  ]

  return (
    <>
      {/* 移動端頂部導航欄 */}
      <div 
        className={`lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 transition-transform duration-300 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center space-x-2">
          <img 
            src="/images/logo.png" 
            alt="AI聚作 Logo" 
            className="w-6 h-6"
          />
          <h1 className="text-xl font-bold text-purple-600">AI聚作</h1>
        </div>
        <button
          onClick={() => setIsExploreOpen(!isExploreOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>

      {/* 移動端探索側邊欄 */}
      {isExploreOpen && (
        <div className={`lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 ${isClosing ? 'fade-out' : 'fade-in'}`} onClick={handleClose}>
          <div className={`w-80 bg-white h-full shadow-xl ml-auto ${isClosing ? 'slide-out-to-right' : 'slide-in-from-right'}`} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-xl font-bold text-primary-600">趨勢話題</h1>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto h-full">
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <span className="text-gray-700 font-medium text-sm truncate">{topic.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{topic.discussions} 討論</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
