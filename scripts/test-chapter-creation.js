#!/usr/bin/env node

/**
 * 測試章節建立腳本
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testChapterCreation() {
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
    
    // 建立測試故事
    const storyId = '550e8400-e29b-41d4-a716-446655440999';
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (story_id) DO NOTHING
    `, [storyId, 'T999', '測試故事', '投票中']);
    
    console.log('✅ 測試故事建立成功');
    
    // 測試章節建立
    try {
      const result = await client.query(`
        INSERT INTO chapters (
          story_id, chapter_number, title, full_text, summary,
          voting_status, voting_deadline, voting_options, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING chapter_id
      `, [
        storyId,
        '001',
        '測試章節',
        '測試內容',
        '測試摘要',
        '進行中',
        new Date(Date.now() + 24 * 60 * 60 * 1000),
        JSON.stringify({
          options: [
            { id: 'A', content: '選項A', description: '選項A描述' },
            { id: 'B', content: '選項B', description: '選項B描述' },
            { id: 'C', content: '選項C', description: '選項C描述' }
          ],
          total_votes: 0
        }),
        JSON.stringify(['測試', '章節'])
      ]);
      
      console.log('✅ 測試章節建立成功:', result.rows[0].chapter_id);
      
    } catch (error) {
      console.error('❌ 測試章節建立失敗:', error.message);
    }
    
    // 清理測試資料
    await client.query('DELETE FROM chapters WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    console.log('✅ 測試資料清理完成');
    
    client.release();
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    await pool.end();
  }
}

testChapterCreation().catch(console.error);
