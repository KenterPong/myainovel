'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const [selectedLanguage, setSelectedLanguage] = useState('繁體中文')
  const pathname = usePathname()

  const navigationItems = [
    { 
      name: '首頁', 
      href: '/', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
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
      href: '/settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    },
  ]

  const settingsSubItems = [
    { name: 'AI免責聲明', href: '/settings#disclaimer', icon: '⚖️' },
    { name: '檢舉內容', href: '/settings#report', icon: '🚨' },
    { name: '幫助中心', href: '/settings#help', icon: '❓' },
  ]

  const languages = ['繁體中文', 'English', '日本語', '한국어']

  return (
    <div className="w-full bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src="/images/logo.png" 
            alt="AI聚作 Logo" 
            className="w-8 h-8 lg:w-10 lg:h-10"
          />
          <h1 className="text-xl lg:text-2xl font-bold text-purple-600">AI聚作</h1>
        </div>
      </div>

      {/* 導航選單 */}
      <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
        <ul className="space-y-1 lg:space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const isSettings = item.name === '設定'
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-gray-700">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
                {/* 設定子選單 */}
                {isSettings && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {settingsSubItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.href}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-xs lg:text-sm text-gray-600 hover:bg-gray-50"
                        >
                          <span className="text-sm">{subItem.icon}</span>
                          <span className="truncate">{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 語言選擇 */}
      <div className="p-3 lg:p-4 border-t border-gray-200">
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-2 lg:px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 廣告區域 */}
      <div className="p-3 lg:p-4 border-t border-gray-200">
        <div className="bg-gray-100 rounded-lg p-3 lg:p-4 text-center">
          <p className="text-xs lg:text-sm text-gray-500 mb-2">廣告一</p>
          <div className="w-full h-32 lg:h-48 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs lg:text-sm">300x300</span>
          </div>
        </div>
      </div>
    </div>
  )
}
