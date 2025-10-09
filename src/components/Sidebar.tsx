'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import LanguageSelector from './LanguageSelector'

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
  ]


  return (
    <div className="w-full bg-gray-100 border-r border-gray-200 h-screen flex flex-col sticky top-0">
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
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-gray-700">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 語言選擇 */}
      <div className="p-3 lg:p-4 border-t border-gray-200">
        <LanguageSelector isMobile={false} />
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
