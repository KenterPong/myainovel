'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function DatabaseAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | 'info'>('info');

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setStatus(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleDatabaseAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/db/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();
      
      if (result.success) {
        showMessage(result.message, 'success');
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage('操作失敗: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db/init');
      const result = await response.json();
      
      if (result.success) {
        showMessage('資料庫狀態正常', 'success');
      } else {
        showMessage('資料庫狀態異常', 'error');
      }
    } catch (error) {
      showMessage('檢查失敗: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            資料庫管理
          </h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              status === 'success' ? 'bg-green-100 text-green-800' :
              status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 資料庫初始化 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                資料庫初始化
              </h2>
              <p className="text-gray-600 mb-4">
                建立所有必要的資料表、索引、觸發器和約束條件
              </p>
              <Button
                onClick={() => handleDatabaseAction('init')}
                disabled={loading}
                className="w-full"
              >
                {loading ? '初始化中...' : '初始化資料庫'}
              </Button>
            </div>

            {/* 建立範例資料 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                建立範例資料
              </h2>
              <p className="text-gray-600 mb-4">
                建立測試故事和相關設定資料
              </p>
              <Button
                onClick={() => handleDatabaseAction('sample')}
                disabled={loading}
                className="w-full"
              >
                {loading ? '建立中...' : '建立範例資料'}
              </Button>
            </div>

            {/* 檢查狀態 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                檢查資料庫狀態
              </h2>
              <p className="text-gray-600 mb-4">
                檢查資料庫連線和資料表狀態
              </p>
              <Button
                onClick={handleCheckStatus}
                disabled={loading}
                className="w-full"
              >
                {loading ? '檢查中...' : '檢查狀態'}
              </Button>
            </div>

            {/* 資料庫資訊 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                資料庫資訊
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>資料庫類型:</strong> PostgreSQL</p>
                <p><strong>主要資料表:</strong> stories, chapters, story_settings</p>
                <p><strong>特色功能:</strong> JSONB 支援、自動觸發器、外鍵約束</p>
              </div>
            </div>
          </div>

          {/* 資料表結構說明 */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              資料表結構說明
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">stories (故事主表)</h3>
                <ul className="text-blue-600 space-y-1">
                  <li>• story_id (UUID 主鍵)</li>
                  <li>• story_serial (流水序號)</li>
                  <li>• title (故事名稱)</li>
                  <li>• status (故事狀態)</li>
                  <li>• voting_result (投票結果)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">chapters (章節表)</h3>
                <ul className="text-blue-600 space-y-1">
                  <li>• chapter_id (主鍵)</li>
                  <li>• story_id (外鍵)</li>
                  <li>• full_text (章節內容)</li>
                  <li>• voting_options (投票選項)</li>
                  <li>• voting_status (投票狀態)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">story_settings (設定表)</h3>
                <ul className="text-blue-600 space-y-1">
                  <li>• setting_id (主鍵)</li>
                  <li>• story_id (外鍵)</li>
                  <li>• setting_type (設定類型)</li>
                  <li>• setting_data (JSONB 資料)</li>
                  <li>• last_updated_at (更新時間)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
