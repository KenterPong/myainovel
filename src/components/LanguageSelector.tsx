'use client'
import { useState } from 'react'

interface LanguageSelectorProps {
  isMobile?: boolean
  className?: string
}

export default function LanguageSelector({ isMobile = false, className = '' }: LanguageSelectorProps) {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)

  // 支援的語言列表
  const languages = [
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'zh-CN', name: '簡體中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'th', name: '泰文', flag: '🇹🇭' }
  ]

  // 處理語系選單切換
  const handleLanguageMenuToggle = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen)
  }

  // 處理語言選擇
  const handleLanguageSelect = (language: typeof languages[0]) => {
    console.log('選擇語言:', language.name)
    setIsLanguageMenuOpen(false)
    // 這裡可以添加語言切換邏輯
  }

  // 手機版彈窗樣式
  if (isMobile) {
    return (
      <div className={`relative ${className}`}>
        {/* 語系選單按鈕 */}
        <button
          onClick={handleLanguageMenuToggle}
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            isLanguageMenuOpen
              ? 'text-primary-700 bg-primary-100 font-medium'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className={`${isLanguageMenuOpen ? 'text-primary-700' : 'text-gray-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
        </button>

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
                    onClick={() => handleLanguageSelect(language)}
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

  // 電腦版下拉選單樣式
  return (
    <div className={`relative ${className}`}>
      <select
        onChange={(e) => {
          const selectedLanguage = languages.find(lang => lang.name === e.target.value)
          if (selectedLanguage) {
            handleLanguageSelect(selectedLanguage)
          }
        }}
        className="w-full px-2 lg:px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.name}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  )
}
