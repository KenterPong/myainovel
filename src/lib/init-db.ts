import { query, testConnection } from './db';

/**
 * 初始化資料庫 - 建立所有必要的資料表和約束條件
 */
export async function initializeDatabase() {
  try {
    console.log('🚀 開始初始化資料庫...');
    
    // 測試資料庫連線
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('無法連接到資料庫');
    }

    // 讀取 SQL 腳本
    const fs = await import('fs');
    const path = await import('path');
    const sqlPath = path.join(process.cwd(), 'src/lib/init-db.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // 執行 SQL 腳本
    await query(sqlScript);
    
    console.log('✅ 資料庫初始化完成！');
    return true;
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
    throw error;
  }
}

/**
 * 建立範例故事資料
 */
export async function createSampleStory() {
  try {
    console.log('📝 建立範例故事...');
    
    // 建立範例故事
    const storyResult = await query(`
      INSERT INTO stories (story_serial, title, status, origin_voting_start_date) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (story_serial) DO NOTHING
      RETURNING story_id
    `, ['A00001', '測試故事', '投票中', new Date()]);

    if (storyResult.rows.length === 0) {
      console.log('📝 範例故事已存在');
      return;
    }

    const storyId = storyResult.rows[0].story_id;

    // 建立角色設定
    await query(`
      INSERT INTO story_settings (story_id, setting_type, setting_data)
      VALUES ($1, $2, $3)
      ON CONFLICT (story_id, setting_type) DO NOTHING
    `, [
      storyId,
      '角色',
      JSON.stringify({
        name: "叢雲清",
        archetype: "主角",
        appearance: "銀色短髮，右眼角有微小疤痕。",
        personality: "冷靜、聰明、內斂，優先考慮邏輯而非情感。",
        motto: "「行動勝於空談。」",
        goal: "尋找失蹤的家族遺物。",
        status: "健康，擁有基礎駭客能力。"
      })
    ]);

    // 建立世界觀設定
    await query(`
      INSERT INTO story_settings (story_id, setting_type, setting_data)
      VALUES ($1, $2, $3)
      ON CONFLICT (story_id, setting_type) DO NOTHING
    `, [
      storyId,
      '世界觀',
      JSON.stringify({
        era: "近未來 (2077 年)",
        location: "新東京，一座賽博龐克城市。",
        technology_level: "高度發達，但貧富差距懸殊，企業控制一切。",
        magic_rules: "無魔法，僅有先進的生物義肢和 AI 網路。",
        key_factions: [
          { name: "宙斯企業", role: "主要反派" },
          { name: "黑市網絡", role: "情報中介" }
        ]
      })
    ]);

    // 建立章節大綱設定
    await query(`
      INSERT INTO story_settings (story_id, setting_type, setting_data)
      VALUES ($1, $2, $3)
      ON CONFLICT (story_id, setting_type) DO NOTHING
    `, [
      storyId,
      '大綱',
      JSON.stringify({
        chapter_summaries: [
          {
            chapter_number: "001",
            title: "覺醒",
            summary: "叢雲清在廢棄實驗室中醒來，發現自己擁有特殊能力...",
            key_events: ["能力覺醒", "遇到神秘組織", "發現身世線索"],
            character_development: "主角從迷茫到堅定，開始接受自己的使命"
          }
        ],
        overall_arc: "主角的成長歷程，從普通人到拯救世界的英雄",
        current_status: "第一章完成，準備進入第二章"
      })
    ]);

    console.log('✅ 範例故事建立完成');
  } catch (error) {
    console.error('❌ 建立範例故事失敗:', error);
    throw error;
  }
}

/**
 * 檢查資料庫狀態
 */
export async function checkDatabaseStatus() {
  try {
    console.log('🔍 檢查資料庫狀態...');
    
    // 檢查資料表是否存在
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('stories', 'chapters', 'story_settings', 'origin_votes', 'origin_vote_totals', 'chapter_votes', 'chapter_vote_totals')
      ORDER BY table_name
    `);

    console.log('📊 已建立的資料表:', tablesResult.rows.map((row: any) => row.table_name));

    // 檢查故事數量
    const storiesResult = await query('SELECT COUNT(*) as count FROM stories');
    console.log('📚 故事數量:', storiesResult.rows[0].count);

    // 檢查章節數量
    const chaptersResult = await query('SELECT COUNT(*) as count FROM chapters');
    console.log('📄 章節數量:', chaptersResult.rows[0].count);

    // 檢查設定數量
    const settingsResult = await query('SELECT COUNT(*) as count FROM story_settings');
    console.log('⚙️ 設定數量:', settingsResult.rows[0].count);

    return true;
  } catch (error) {
    console.error('❌ 檢查資料庫狀態失敗:', error);
    throw error;
  }
}

/**
 * 重置資料庫（刪除所有資料）
 */
export async function resetDatabase() {
  try {
    console.log('🔄 重置資料庫...');
    
    // 刪除所有資料表（會自動處理外鍵約束）
    await query('DROP TABLE IF EXISTS chapter_vote_totals CASCADE');
    await query('DROP TABLE IF EXISTS chapter_votes CASCADE');
    await query('DROP TABLE IF EXISTS origin_vote_totals CASCADE');
    await query('DROP TABLE IF EXISTS origin_votes CASCADE');
    await query('DROP TABLE IF EXISTS story_settings CASCADE');
    await query('DROP TABLE IF EXISTS chapters CASCADE');
    await query('DROP TABLE IF EXISTS stories CASCADE');
    
    console.log('✅ 資料庫重置完成');
  } catch (error) {
    console.error('❌ 重置資料庫失敗:', error);
    throw error;
  }
}
