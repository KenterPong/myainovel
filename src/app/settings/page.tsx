'use client'
import { useState } from 'react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('disclaimer')

  const settingsOptions = [
    {
      id: 'disclaimer',
      title: 'AI免責聲明',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">AI免責聲明</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              本平台使用人工智慧技術生成故事內容，請注意以下事項：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>所有生成的故事內容僅供娛樂用途，不代表任何真實事件或人物</li>
              <li>AI生成內容可能存在不準確、不完整或不合適的資訊</li>
              <li>用戶應自行判斷內容的適當性，平台不承擔任何責任</li>
              <li>禁止將AI生成內容用於非法、有害或誤導性目的</li>
              <li>平台保留隨時修改或刪除不當內容的權利</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              如有任何疑問，請聯繫我們的客服團隊。
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'report',
      title: '檢舉內容',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">檢舉內容</h3>
          <div className="space-y-4">
            <p className="text-gray-700">
              如果您發現任何不當內容，請透過以下方式檢舉：
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">檢舉原因</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">暴力或血腥內容</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">色情或成人內容</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">仇恨言論或歧視</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">垃圾訊息或廣告</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">其他不當內容</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                詳細說明
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                placeholder="請詳細描述檢舉原因..."
              />
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
              提交檢舉
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'help',
      title: '幫助中心',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">幫助中心</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">常見問題</h4>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800">如何開始投票？</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    在故事起源頁面選擇您喜歡的故事類型、背景和主題，然後點擊「投下一票」按鈕。
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800">如何查看我的收藏？</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    點擊底部導航的「收藏」圖示，即可查看您收藏的所有故事。
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800">如何獲得通知？</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    當您關注的故事有更新時，系統會自動發送通知到您的通知中心。
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">聯絡我們</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">客服信箱：support@ai-creation.com</p>
                <p className="text-sm text-gray-700 mb-2">客服電話：02-1234-5678</p>
                <p className="text-sm text-gray-700">服務時間：週一至週五 9:00-18:00</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 p-6">設定</h1>
        </div>
        
        <div className="flex">
          {/* 側邊選單 */}
          <div className="w-64 border-r border-gray-200">
            <nav className="p-4">
              <ul className="space-y-2">
                {settingsOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      onClick={() => setActiveTab(option.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeTab === option.id
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* 內容區域 */}
          <div className="flex-1 p-6">
            {settingsOptions.find(option => option.id === activeTab)?.content}
          </div>
        </div>
      </div>
    </div>
  )
}
