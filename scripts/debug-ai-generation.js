#!/usr/bin/env node

/**
 * 調試 AI 生成問題腳本
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function debugAIGeneration() {
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
    const storyId = '550e8400-e29b-41d4-a716-446655440888';
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (story_id) DO NOTHING
    `, [storyId, 'T888', '調試故事', '投票中']);
    
    console.log('✅ 測試故事建立成功');
    
    // 建立測試章節
    const chapterResult = await client.query(`
      INSERT INTO chapters (
        story_id, chapter_number, title, full_text, summary,
        voting_status, voting_deadline, voting_options, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING chapter_id
    `, [
      storyId,
      '001',
      '調試章節',
      '調試內容',
      '調試摘要',
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
      JSON.stringify(['調試', '章節'])
    ]);
    
    const chapterId = chapterResult.rows[0].chapter_id;
    console.log('✅ 測試章節建立成功:', chapterId);
    
    // 測試最大章節號碼查詢
    console.log('\n🔍 測試最大章節號碼查詢...');
    try {
      const maxChapterResult = await client.query(`
        SELECT MAX(CAST(REGEXP_REPLACE(chapter_number, '[^0-9]', '', 'g') AS INTEGER)) as max_chapter
        FROM chapters 
        WHERE story_id = $1 AND chapter_number ~ '^[0-9]+$'
      `, [storyId]);
      
      console.log('最大章節號碼查詢結果:', maxChapterResult.rows[0]);
      const maxChapter = maxChapterResult.rows[0].max_chapter || 0;
      const nextChapterNumber = String(maxChapter + 1).padStart(3, '0');
      console.log('下一個章節號碼:', nextChapterNumber);
      
    } catch (error) {
      console.error('❌ 最大章節號碼查詢失敗:', error.message);
    }
    
    // 測試建立新章節
    console.log('\n🔍 測試建立新章節...');
    try {
      const newChapterResult = await client.query(`
        INSERT INTO chapters (
          story_id, chapter_number, title, full_text, summary,
          voting_status, voting_deadline, voting_options, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING chapter_id
      `, [
        storyId,
        '002',
        '新章節',
        '新章節內容',
        '新章節摘要',
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
        JSON.stringify(['新', '章節'])
      ]);
      
      console.log('✅ 新章節建立成功:', newChapterResult.rows[0].chapter_id);
      
    } catch (error) {
      console.error('❌ 新章節建立失敗:', error.message);
    }
    
    // 清理測試資料
    await client.query('DELETE FROM chapters WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    console.log('\n✅ 測試資料清理完成');
    
    client.release();
  } catch (error) {
    console.error('❌ 調試失敗:', error.message);
  } finally {
    await pool.end();
  }
}

debugAIGeneration().catch(console.error);
