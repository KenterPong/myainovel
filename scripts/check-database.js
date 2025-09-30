const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// 建立資料庫連線池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkDatabase() {
  try {
    console.log('🔍 檢查資料庫內容...');
    
    // 測試連線
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功');
    
    // 檢查 stories 表
    const storiesResult = await client.query('SELECT * FROM stories ORDER BY created_at DESC LIMIT 5');
    console.log('📚 Stories 表記錄數:', storiesResult.rows.length);
    
    if (storiesResult.rows.length > 0) {
      console.log('📖 最新故事:');
      storiesResult.rows.forEach((story, index) => {
        console.log(`  ${index + 1}. ${story.title} (${story.story_serial}) - ${story.status}`);
        console.log(`     投票結果:`, story.voting_result);
      });
    }
    
    // 檢查 story_settings 表
    const settingsResult = await client.query('SELECT * FROM story_settings ORDER BY last_updated_at DESC LIMIT 10');
    console.log('⚙️ Story Settings 表記錄數:', settingsResult.rows.length);
    
    if (settingsResult.rows.length > 0) {
      console.log('🔧 最新設定:');
      settingsResult.rows.forEach((setting, index) => {
        console.log(`  ${index + 1}. ${setting.setting_type} - ${setting.story_id}`);
        const data = setting.setting_data;
        if (setting.setting_type === '角色' && data.characters) {
          console.log(`     角色數量: ${data.characters.length}`);
        }
      });
    }
    
    client.release();
    console.log('✅ 檢查完成');
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
