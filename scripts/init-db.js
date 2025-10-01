#!/usr/bin/env node

/**
 * 資料庫初始化腳本
 * 使用方法: node scripts/init-db.js [action]
 * 
 * 可用的 action:
 * - init: 初始化資料庫（建立資料表）
 * - sample: 建立範例資料
 * - status: 檢查資料庫狀態
 * - reset: 重置資料庫（刪除所有資料）
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function initializeDatabase() {
  console.log('🚀 開始初始化資料庫...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功');

    // 讀取 SQL 腳本
    const sqlPath = path.join(process.cwd(), 'src/lib/init-db.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // 執行 SQL 腳本
    await client.query(sqlScript);
    
    console.log('✅ 資料庫初始化完成！');
    client.release();
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function createSampleData() {
  console.log('📝 建立範例資料...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();

    // 建立範例故事
    const storyResult = await client.query(`
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
    await client.query(`
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
    await client.query(`
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

    console.log('✅ 範例資料建立完成');
    client.release();
  } catch (error) {
    console.error('❌ 建立範例資料失敗:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function checkDatabaseStatus() {
  console.log('🔍 檢查資料庫狀態...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();

    // 檢查資料表是否存在
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('stories', 'chapters', 'story_settings', 'origin_votes', 'origin_vote_totals')
      ORDER BY table_name
    `);

    console.log('📊 已建立的資料表:', tablesResult.rows.map(row => row.table_name).join(', '));

    // 檢查故事數量
    const storiesResult = await client.query('SELECT COUNT(*) as count FROM stories');
    console.log('📚 故事數量:', storiesResult.rows[0].count);

    // 檢查章節數量
    const chaptersResult = await client.query('SELECT COUNT(*) as count FROM chapters');
    console.log('📄 章節數量:', chaptersResult.rows[0].count);

    // 檢查設定數量
    const settingsResult = await client.query('SELECT COUNT(*) as count FROM story_settings');
    console.log('⚙️ 設定數量:', settingsResult.rows[0].count);

    // 檢查投票記錄數量
    const votesResult = await client.query('SELECT COUNT(*) as count FROM origin_votes');
    console.log('🗳️ 投票記錄數量:', votesResult.rows[0].count);

    // 檢查投票統計數量
    const voteTotalsResult = await client.query('SELECT COUNT(*) as count FROM origin_vote_totals');
    console.log('📊 投票統計數量:', voteTotalsResult.rows[0].count);

    client.release();
  } catch (error) {
    console.error('❌ 檢查資料庫狀態失敗:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function resetDatabase() {
  console.log('🔄 重置資料庫...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();

    // 刪除所有資料表
    await client.query('DROP TABLE IF EXISTS story_settings CASCADE');
    await client.query('DROP TABLE IF EXISTS chapters CASCADE');
    await client.query('DROP TABLE IF EXISTS stories CASCADE');
    
    console.log('✅ 資料庫重置完成');
    client.release();
  } catch (error) {
    console.error('❌ 重置資料庫失敗:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// 主程式
async function main() {
  const action = process.argv[2] || 'init';

  try {
    switch (action) {
      case 'init':
        await initializeDatabase();
        break;
      case 'sample':
        await createSampleData();
        break;
      case 'status':
        await checkDatabaseStatus();
        break;
      case 'reset':
        await resetDatabase();
        break;
      default:
        console.log('❌ 無效的操作');
        console.log('可用的操作: init, sample, status, reset');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 操作失敗:', error.message);
    process.exit(1);
  }
}

main();
