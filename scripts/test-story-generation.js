const { testConnection, query } = require('../src/lib/db');

async function testStoryGeneration() {
  console.log('🧪 開始測試故事生成流程...\n');

  try {
    // 1. 測試資料庫連線
    console.log('1. 測試資料庫連線...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('資料庫連線失敗');
    }
    console.log('✅ 資料庫連線成功\n');

    // 2. 測試 API 端點
    console.log('2. 測試 AI 故事生成 API...');
    const testData = {
      genre: '奇幻',
      background: '校園',
      theme: 'B/G'
    };

    const response = await fetch('http://localhost:3000/api/stories/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ API 請求成功');
    console.log('📖 生成的故事標題:', result.storyData.title);
    console.log('🎭 故事類型:', result.storyData.genre);
    console.log('👥 角色數量:', result.storyData.characters?.length || 0);
    console.log('📝 故事ID:', result.storyId);
    console.log('');

    // 3. 驗證資料庫儲存
    console.log('3. 驗證資料庫儲存...');
    
    // 檢查 stories 表
    const storyResult = await query(
      'SELECT * FROM stories WHERE story_id = $1',
      [result.storyId]
    );
    
    if (storyResult.rows.length === 0) {
      throw new Error('故事記錄未找到');
    }
    console.log('✅ 故事主表記錄已建立');
    console.log('   標題:', storyResult.rows[0].title);
    console.log('   狀態:', storyResult.rows[0].status);
    console.log('   建立時間:', storyResult.rows[0].created_at);

    // 檢查 story_settings 表
    const settingsResult = await query(
      'SELECT * FROM story_settings WHERE story_id = $1 ORDER BY setting_type',
      [result.storyId]
    );
    
    if (settingsResult.rows.length === 0) {
      throw new Error('故事設定記錄未找到');
    }
    console.log('✅ 故事設定記錄已建立');
    console.log('   設定類型數量:', settingsResult.rows.length);
    
    settingsResult.rows.forEach(row => {
      console.log(`   - ${row.setting_type}: ${JSON.stringify(row.setting_data).substring(0, 50)}...`);
    });

    console.log('\n🎉 所有測試通過！故事生成流程運作正常。');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  testStoryGeneration();
}

module.exports = { testStoryGeneration };
