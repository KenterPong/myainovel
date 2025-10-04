#!/usr/bin/env node

/**
 * 調試投票觸發 AI 生成流程腳本
 * 使用方法: node scripts/test-voting-trigger-debug.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testVotingTriggerDebug() {
  console.log('🔍 調試投票觸發 AI 生成流程...');
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

    // 1. 獲取可測試的章節
    console.log('📚 獲取可測試的章節...');
    const chaptersResult = await client.query(`
      SELECT 
        c.chapter_id,
        c.story_id,
        c.chapter_number,
        c.title,
        c.voting_status,
        s.title as story_title
      FROM chapters c
      JOIN stories s ON c.story_id = s.story_id
      WHERE c.voting_status = '進行中'
      ORDER BY c.created_at DESC
      LIMIT 1
    `);
    
    if (chaptersResult.rows.length === 0) {
      console.log('❌ 沒有找到可測試的章節');
      return;
    }
    
    const testChapter = chaptersResult.rows[0];
    console.log(`🎯 選擇測試章節: ${testChapter.story_title} - ${testChapter.title} (ID: ${testChapter.chapter_id})`);

    // 2. 第一次投票
    console.log('\n🗳️ 第一次投票...');
    const vote1Response = await fetch(`http://localhost:3000/api/stories/${testChapter.story_id}/chapters/${testChapter.chapter_id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        optionId: 'A',
        voterIp: '192.168.1.100',
        voterSession: 'debug_session_1'
      })
    });
    
    const vote1Data = await vote1Response.json();
    console.log(`📊 第一次投票結果: ${vote1Response.status} - ${JSON.stringify(vote1Data)}`);

    // 3. 第二次投票（觸發 AI 生成）
    console.log('\n🗳️ 第二次投票（觸發 AI 生成）...');
    const vote2Response = await fetch(`http://localhost:3000/api/stories/${testChapter.story_id}/chapters/${testChapter.chapter_id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        optionId: 'A',
        voterIp: '192.168.1.101',
        voterSession: 'debug_session_2'
      })
    });
    
    const vote2Data = await vote2Response.json();
    console.log(`📊 第二次投票結果: ${vote2Response.status} - ${JSON.stringify(vote2Data)}`);

    // 4. 檢查章節狀態
    console.log('\n📊 檢查章節狀態...');
    const chapterStatus = await client.query(`
      SELECT voting_status, created_at
      FROM chapters WHERE chapter_id = $1
    `, [testChapter.chapter_id]);
    
    console.log(`✅ 章節狀態: ${chapterStatus.rows[0].voting_status}`);

    // 5. 檢查 AI 生成歷史
    console.log('\n🤖 檢查 AI 生成歷史...');
    const aiHistoryResult = await client.query(`
      SELECT 
        generation_id,
        status,
        processing_time,
        input_data,
        output_data,
        created_at
      FROM ai_generation_history
      WHERE story_id = $1 AND chapter_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [testChapter.story_id, testChapter.chapter_id]);
    
    if (aiHistoryResult.rows.length > 0) {
      const record = aiHistoryResult.rows[0];
      console.log(`📋 AI 生成記錄:`);
      console.log(`  - ID: ${record.generation_id}`);
      console.log(`  - 狀態: ${record.status}`);
      console.log(`  - 處理時間: ${record.processing_time}ms`);
      console.log(`  - 輸入資料: ${JSON.stringify(record.input_data, null, 2)}`);
      console.log(`  - 輸出資料: ${JSON.stringify(record.output_data, null, 2)}`);
    } else {
      console.log('❌ 沒有找到 AI 生成歷史記錄');
    }

    // 6. 檢查新章節
    console.log('\n📖 檢查新章節...');
    const newChaptersResult = await client.query(`
      SELECT 
        chapter_id,
        chapter_number,
        title,
        voting_status,
        created_at
      FROM chapters
      WHERE story_id = $1
      ORDER BY created_at DESC
      LIMIT 2
    `, [testChapter.story_id]);
    
    console.log(`📚 章節列表:`);
    newChaptersResult.rows.forEach((chapter, index) => {
      console.log(`  ${index + 1}. 第${chapter.chapter_number}章: ${chapter.title} (${chapter.voting_status}) - ID: ${chapter.chapter_id}`);
    });

    // 7. 直接測試 AI 生成 API
    console.log('\n🤖 直接測試 AI 生成 API...');
    try {
      const aiResponse = await fetch('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: testChapter.story_id,
          chapterId: testChapter.chapter_id,
          previousContext: '這是測試章節的內容...',
          votingResult: {
            optionId: 'A',
            content: '選項A：測試選項',
            description: '測試描述',
            voteCount: 2,
            percentage: 100
          },
          generationType: 'chapter'
        })
      });
      
      const aiData = await aiResponse.json();
      console.log(`📊 AI 生成 API 結果: ${aiResponse.status} - ${JSON.stringify(aiData, null, 2)}`);
    } catch (aiError) {
      console.log(`❌ AI 生成 API 錯誤: ${aiError.message}`);
    }

    client.release();
    console.log('\n🎉 調試測試完成！');
    
  } catch (error) {
    console.error('❌ 調試測試失敗:', error.message);
    console.error('詳細錯誤:', error);
  } finally {
    await pool.end();
  }
}

// 執行調試測試
testVotingTriggerDebug().catch(console.error);
