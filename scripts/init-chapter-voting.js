#!/usr/bin/env node

/**
 * 章節投票系統資料庫初始化腳本
 * 使用方法: node scripts/init-chapter-voting.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local', override: true });

async function initializeChapterVoting() {
  console.log('🚀 開始初始化章節投票系統...');
  
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myainovel',
    port: 5432,
    password: '1234',
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功');

    // 讀取 SQL 腳本中的章節投票部分
    const sqlPath = path.join(process.cwd(), 'src/lib/init-db.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // 提取章節投票相關的 SQL（從 "-- 9. 建立章節投票相關資料表" 開始）
    const chapterVotingSQL = sqlScript.split('-- 9. 建立章節投票相關資料表')[1].split('-- 10. 插入範例資料')[0];
    
    // 執行章節投票相關的 SQL
    await client.query(chapterVotingSQL);
    
    console.log('✅ 章節投票資料表建立完成');

    // 檢查建立的資料表
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chapter_votes', 'chapter_vote_totals')
      ORDER BY table_name
    `);

    console.log('📊 新建立的章節投票資料表:', tablesResult.rows.map(row => row.table_name).join(', '));

    // 檢查觸發器
    const triggersResult = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_update_chapter_vote_totals'
    `);

    if (triggersResult.rows.length > 0) {
      console.log('⚡ 觸發器建立成功:', triggersResult.rows[0].trigger_name);
    }

    // 檢查約束條件
    const constraintsResult = await client.query(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints 
      WHERE table_name IN ('chapter_votes', 'chapter_vote_totals')
      AND constraint_type = 'CHECK'
      ORDER BY table_name, constraint_name
    `);

    console.log('🔒 建立的約束條件:', constraintsResult.rows.map(row => `${row.table_name}.${row.constraint_name}`).join(', '));

    client.release();
    console.log('✅ 章節投票系統初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 章節投票系統初始化失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行初始化
initializeChapterVoting().catch(console.error);
