const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function checkChapterData() {
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
    const result = await client.query(`
      SELECT c.title, c.summary, LENGTH(c.full_text) as text_length, s.title as story_title
      FROM chapters c
      JOIN stories s ON c.story_id = s.story_id
      ORDER BY c.created_at DESC LIMIT 3
    `);
    
    console.log('章節資料:');
    result.rows.forEach(row => {
      console.log(`故事: ${row.story_title}`);
      console.log(`章節: ${row.title}`);
      console.log(`摘要: ${row.summary}`);
      console.log(`全文長度: ${row.text_length} 字元`);
      console.log('---');
    });
    
    client.release();
  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await pool.end();
  }
}

checkChapterData();
