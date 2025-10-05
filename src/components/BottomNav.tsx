'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHomeData } from '@/lib/hooks/useHomeData'
import NotificationPopup from './NotificationPopup'

export default function BottomNav() {
  const pathname = usePathname()
  const { currentChapterId, clearCurrentChapter, filterByStory, filteredStoryId } = useHomeData()

  // 處理首頁按鈕點擊
  const handleHomeClick = (e: React.MouseEvent) => {
    console.log('首頁按鈕被點擊', { currentChapterId, filteredStoryId })
    // 總是執行清除操作，不管狀態如何
    e.preventDefault()
    console.log('清除章節和故事篩選，回到平台首頁')
    
    // 直接導航到首頁，強制重新載入
    window.location.href = '/'
  }

  const navigationItems = [
    { 
      name: '首頁', 
      href: '/', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      onClick: handleHomeClick
    },
    { 
      name: '起源', 
      href: '/origin', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      )
    },
    { 
      name: '收藏', 
      href: '/collection', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
      )
    },
    { 
      name: '通知', 
      href: '/notifications', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )
    },
    { 
      name: '設定', 
      href: null, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      isPopup: true
    }
  ]

  return (
    <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-30 h-12">
      <div className="flex items-center justify-around h-full">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          // 首頁按鈕在單一章節視圖中應該保持可點擊狀態
          const isHomeInChapterView = item.name === '首頁' && currentChapterId
          
          if (item.isPopup) {
            return (
              <div key={item.name} className="flex items-center justify-center p-2 rounded transition-colors">
                <NotificationPopup />
              </div>
            )
          }
          
          return (
            <Link
              key={item.name}
              href={item.href!}
              onClick={item.onClick}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                isActive || isHomeInChapterView
                  ? 'text-primary-700 bg-primary-100 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className={`${isActive || isHomeInChapterView ? 'text-primary-700' : 'text-gray-500'}`}>
                {item.icon}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
