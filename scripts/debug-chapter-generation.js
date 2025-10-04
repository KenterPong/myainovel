#!/usr/bin/env node

/**
 * 調試章節生成問題腳本
 * 使用方法: node scripts/debug-chapter-generation.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function debugChapterGeneration() {
  console.log('🔍 調試章節生成問題...');
  console.log('='.repeat(50));
  
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
    console.log('✅ 資料庫連線成功\n');

    // 1. 檢查所有故事
    console.log('📚 檢查所有故事...');
    const storiesResult = await client.query(`
      SELECT story_id, title, status, created_at
      FROM stories 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('故事列表:');
    storiesResult.rows.forEach((story, index) => {
      console.log(`  ${index + 1}. ${story.title} (${story.status}) - ${story.story_id}`);
    });

    // 2. 檢查所有章節
    console.log('\n📖 檢查所有章節...');
    const chaptersResult = await client.query(`
      SELECT chapter_id, story_id, chapter_number, title, voting_status, created_at
      FROM chapters 
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    console.log('章節列表:');
    chaptersResult.rows.forEach((chapter, index) => {
      console.log(`  ${index + 1}. 第${chapter.chapter_number}章: ${chapter.title} (${chapter.voting_status}) - 故事: ${chapter.story_id}`);
    });

    // 3. 檢查 AI 生成歷史
    console.log('\n🤖 檢查 AI 生成歷史...');
    const aiHistoryResult = await client.query(`
      SELECT generation_id, story_id, chapter_id, generation_type, status, created_at
      FROM ai_generation_history 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    if (aiHistoryResult.rows.length > 0) {
      console.log('AI 生成歷史:');
      aiHistoryResult.rows.forEach((history, index) => {
        console.log(`  ${index + 1}. ${history.generation_id} - 故事: ${history.story_id}, 章節: ${history.chapter_id}, 狀態: ${history.status}`);
      });
    } else {
      console.log('⚠️ 沒有找到 AI 生成歷史記錄');
    }

    // 4. 檢查投票記錄
    console.log('\n🗳️ 檢查投票記錄...');
    const votesResult = await client.query(`
      SELECT chapter_id, story_id, option_id, vote_count
      FROM chapter_vote_totals 
      ORDER BY last_updated DESC
      LIMIT 10
    `);
    
    if (votesResult.rows.length > 0) {
      console.log('投票統計:');
      votesResult.rows.forEach((vote, index) => {
        console.log(`  ${index + 1}. 章節 ${vote.chapter_id} - 選項 ${vote.option_id}: ${vote.vote_count} 票`);
      });
    } else {
      console.log('⚠️ 沒有找到投票記錄');
    }

    // 5. 檢查最近的故事和章節關聯
    console.log('\n🔗 檢查故事和章節關聯...');
    const storyChapterResult = await client.query(`
      SELECT 
        s.story_id,
        s.title as story_title,
        s.status as story_status,
        c.chapter_id,
        c.chapter_number,
        c.title as chapter_title,
        c.voting_status,
        c.created_at as chapter_created_at
      FROM stories s
      LEFT JOIN chapters c ON s.story_id = c.story_id
      ORDER BY s.created_at DESC, c.created_at DESC
      LIMIT 20
    `);
    
    console.log('故事-章節關聯:');
    let currentStory = null;
    storyChapterResult.rows.forEach((row) => {
      if (!currentStory || currentStory.story_id !== row.story_id) {
        currentStory = row;
        console.log(`\n📚 故事: ${row.story_title} (${row.story_status})`);
      }
      if (row.chapter_id) {
        console.log(`  📖 第${row.chapter_number}章: ${row.chapter_title} (${row.voting_status})`);
      } else {
        console.log(`  ⚠️ 沒有章節`);
      }
    });

    // 6. 檢查是否有「已生成」狀態的章節
    console.log('\n✅ 檢查「已生成」狀態的章節...');
    const generatedChaptersResult = await client.query(`
      SELECT 
        c.chapter_id,
        c.story_id,
        c.chapter_number,
        c.title,
        c.voting_status,
        c.created_at,
        s.title as story_title
      FROM chapters c
      JOIN stories s ON c.story_id = s.story_id
      WHERE c.voting_status = '已生成'
      ORDER BY c.created_at DESC
    `);
    
    if (generatedChaptersResult.rows.length > 0) {
      console.log('「已生成」狀態的章節:');
      generatedChaptersResult.rows.forEach((chapter, index) => {
        console.log(`  ${index + 1}. ${chapter.story_title} - 第${chapter.chapter_number}章: ${chapter.title}`);
      });
    } else {
      console.log('⚠️ 沒有找到「已生成」狀態的章節');
    }

    client.release();
    console.log('\n🎉 調試完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 調試失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行調試
debugChapterGeneration().catch(console.error);
