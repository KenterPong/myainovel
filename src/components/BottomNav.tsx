'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHomeData } from '@/lib/hooks/useHomeData'
import { useState } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const { currentChapterId, clearCurrentChapter, filterByStory, filteredStoryId } = useHomeData()
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)

  // 處理首頁按鈕點擊
  const handleHomeClick = (e: React.MouseEvent) => {
    console.log('首頁按鈕被點擊', { currentChapterId, filteredStoryId })
    // 總是執行清除操作，不管狀態如何
    e.preventDefault()
    console.log('清除章節和故事篩選，回到平台首頁')
    
    // 直接導航到首頁，強制重新載入
    window.location.href = '/'
  }

  // 處理語系選單切換
  const handleLanguageMenuToggle = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen)
  }

  // 支援的語言列表
  const languages = [
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'zh-CN', name: '簡體中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'th', name: '泰文', flag: '🇹🇭' }
  ]

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
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    { 
      name: '暫存', 
      href: '/collection', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
      )
    },
    { 
      name: '免責聲明', 
      href: '/disclaimer', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    },
    { 
      name: '語系選單', 
      href: null, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      onClick: handleLanguageMenuToggle,
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
                <button
                  onClick={item.onClick}
                  className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                    isLanguageMenuOpen
                      ? 'text-primary-700 bg-primary-100 font-medium'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`${isLanguageMenuOpen ? 'text-primary-700' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                </button>
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
      
      {/* 語系選單彈窗 */}
      {isLanguageMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsLanguageMenuOpen(false)}>
          <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">選擇語言</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    console.log('選擇語言:', language.name)
                    setIsLanguageMenuOpen(false)
                    // 這裡可以添加語言切換邏輯
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-2xl">{language.flag}</span>
                  <span className="text-sm font-medium text-gray-700">{language.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsLanguageMenuOpen(false)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
