'use client'

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI免責聲明</h1>
        
        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">重要聲明</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              本平台（AI聚作）是一個實驗性的AI故事創作平台，所有內容均由人工智慧系統自動生成。
              請在使用本平台前仔細閱讀以下免責聲明。
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. 內容性質</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>本平台所有故事內容均由AI系統自動生成，不代表任何真實事件或人物</li>
              <li>故事內容可能包含虛構情節、角色和設定，請勿與現實混淆</li>
              <li>AI生成內容可能存在邏輯錯誤、重複或不合適的內容</li>
              <li>我們不保證內容的準確性、完整性或適宜性</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. 使用限制</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>本平台僅供娛樂和學習目的使用</li>
              <li>禁止將AI生成內容用於商業用途或任何營利目的</li>
              <li>禁止將內容用於誤導、欺騙或傷害他人</li>
              <li>禁止上傳或分享不當、違法或有害的內容</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. 免責條款</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>本平台不對AI生成內容的品質、準確性或適宜性負責</li>
              <li>用戶因使用本平台內容而產生的任何損失，本平台概不負責</li>
              <li>本平台不保證服務的連續性、穩定性或無錯誤運行</li>
              <li>我們保留隨時修改、暫停或終止服務的權利</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. 隱私權保護</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>我們會收集必要的使用數據以改善服務品質</li>
              <li>用戶的投票和互動數據將被匿名化處理</li>
              <li>我們不會收集或儲存個人敏感資訊</li>
              <li>詳細隱私政策請參閱相關頁面</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. 智慧財產權</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>AI生成的內容不享有傳統意義上的著作權</li>
              <li>平台技術和介面設計受智慧財產權法保護</li>
              <li>用戶不得複製、修改或逆向工程本平台技術</li>
              <li>如發現侵權行為，請立即聯繫我們</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. 服務條款</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>使用本平台即表示您同意遵守所有條款和條件</li>
              <li>我們保留隨時修改條款的權利，修改後將在平台上公告</li>
              <li>如不同意條款內容，請立即停止使用本平台</li>
              <li>本條款受中華民國法律管轄</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. 聯絡資訊</h2>
            <p className="text-gray-700 leading-relaxed">
              如有任何問題或疑慮，請透過以下方式聯繫我們：
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
              <li>電子郵件：contact@aijuzuo.com</li>
              <li>檢舉內容：report@aijuzuo.com</li>
              <li>技術支援：support@aijuzuo.com</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
            <p className="text-yellow-800 font-medium">
              ⚠️ 請注意：本免責聲明最後更新於 2024年12月。我們建議您定期查看此頁面以了解最新條款。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
