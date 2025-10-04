#!/usr/bin/env node

/**
 * 調試章節號碼問題腳本
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function debugChapterNumber() {
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
    
    // 檢查章節號碼
    const result = await client.query('SELECT chapter_number FROM chapters WHERE chapter_id = 44');
    
    if (result.rows.length > 0) {
      const chapterNumber = result.rows[0].chapter_number;
      console.log('chapter_number:', chapterNumber);
      console.log('type:', typeof chapterNumber);
      console.log('parseInt result:', parseInt(chapterNumber));
      console.log('parseInt + 1:', parseInt(chapterNumber) + 1);
      console.log('String result:', String(parseInt(chapterNumber) + 1).padStart(3, '0'));
    } else {
      console.log('沒有找到章節 44');
    }
    
    client.release();
  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await pool.end();
  }
}

debugChapterNumber().catch(console.error);
