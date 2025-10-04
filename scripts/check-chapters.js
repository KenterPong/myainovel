#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function checkChapters() {
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
    
    const result = await client.query('SELECT story_id, chapter_number, title FROM chapters ORDER BY story_id, chapter_number');
    
    console.log('現有章節:');
    result.rows.forEach(row => {
      console.log(`  - ${row.story_id} 第${row.chapter_number}章: ${row.title}`);
    });
    
    client.release();
  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await pool.end();
  }
}

checkChapters().catch(console.error);
