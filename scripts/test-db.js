#!/usr/bin/env node

/**
 * 資料庫連線測試腳本
 * 使用方法: node scripts/test-db.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testDatabaseConnection() {
  console.log('🔍 開始測試資料庫連線...');
  
  // 跳過環境變數檢查，直接使用硬編碼的連線參數
  console.log('🔧 使用硬編碼的資料庫連線參數');

  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myainovel',
    port: 5432,
    password: '1234', // 正確的密碼
    ssl: false
  });

  try {
    // 測試連線
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功');

    // 測試查詢
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📅 當前時間:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL 版本:', result.rows[0].postgres_version.split(' ')[0]);

    // 檢查資料表是否存在
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('stories', 'chapters', 'story_settings', 'origin_votes', 'origin_vote_totals', 'chapter_votes', 'chapter_vote_totals')
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('📊 已建立的資料表:', tablesResult.rows.map(row => row.table_name).join(', '));
    } else {
      console.log('⚠️  尚未建立資料表，請執行資料庫初始化');
    }

    client.release();
    console.log('✅ 資料庫測試完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error.message);
    console.log('\n🔧 請檢查以下項目:');
    console.log('1. PostgreSQL 服務是否正在運行');
    console.log('2. 資料庫名稱是否存在');
    console.log('3. 使用者名稱和密碼是否正確');
    console.log('4. 連線字串格式是否正確');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行測試
testDatabaseConnection().catch(console.error);
