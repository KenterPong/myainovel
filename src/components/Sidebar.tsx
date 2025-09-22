'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const [selectedLanguage, setSelectedLanguage] = useState('繁體中文')
  const pathname = usePathname()

  const navigationItems = [
    { name: '首頁', href: '/', icon: '🏠' },
    { name: '探索', href: '/explore', icon: '🔍' },
    { name: '故事起源', href: '/origin', icon: '📚' },
    { name: '我的收藏', href: '/collection', icon: '❤️' },
    { name: '通知', href: '/notifications', icon: '🔔' },
    { name: '個人檔案', href: '/profile', icon: '👤' },
    { name: 'AI著作權免責聲明', href: '/disclaimer', icon: '⚖️' },
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
                  <span className="text-base lg:text-lg">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
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
