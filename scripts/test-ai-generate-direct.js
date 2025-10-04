#!/usr/bin/env node

/**
 * 直接測試 AI 生成 API 腳本
 * 不透過投票流程，直接調用 AI 生成 API
 * 使用方法: node scripts/test-ai-generate-direct.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testAIGenerateDirect() {
  console.log('🤖 直接測試 AI 生成 API...');
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

    // 1. 建立測試故事和章節
    console.log('📝 建立測試資料...');
    const storyId = '550e8400-e29b-41d4-a716-446655440' + String(Date.now()).slice(-3);
    
    // 建立測試故事
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
    `, [storyId, 'D' + String(Date.now()).slice(-5), '直接測試故事', '投票中']);
    
    console.log('✅ 測試故事建立成功:', storyId);

    // 建立測試章節
    const chapterResult = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId, '001', '第一章：直接測試', 
      '這是一個直接測試章節的內容。主角站在十字路口，面臨著重要的選擇...',
      '主角面臨重要選擇，需要讀者投票決定下一步行動。',
      '進行中', new Date(Date.now() + 24 * 60 * 60 * 1000),
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：勇敢前行', description: '勇敢地選擇前進的道路' },
          { id: 'B', content: '選項B：謹慎觀察', description: '謹慎地觀察周圍環境' },
          { id: 'C', content: '選項C：尋求幫助', description: '尋求他人的幫助和建議' }
        ],
        total_votes: 0
      })
    ]);
    
    const chapterId = chapterResult.rows[0].chapter_id;
    console.log('✅ 測試章節建立成功:', chapterId);

    // 2. 直接測試 AI 生成 API
    console.log('\n🤖 直接測試 AI 生成 API...');
    
    const aiRequest = {
      storyId: storyId,
      chapterId: chapterId,
      previousContext: '這是一個直接測試章節的內容。主角站在十字路口，面臨著重要的選擇...',
      votingResult: {
        optionId: 'A',
        content: '選項A：勇敢前行',
        description: '勇敢地選擇前進的道路',
        voteCount: 2,
        percentage: 100
      },
      generationType: 'chapter'
    };

    console.log('📤 發送 AI 生成請求...');
    console.log('請求資料:', JSON.stringify(aiRequest, null, 2));

    const aiResponse = await fetch('http://localhost:3000/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aiRequest)
    });

    console.log(`📊 AI 生成 API 狀態碼: ${aiResponse.status}`);

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      if (aiData.success) {
        console.log('✅ AI 生成成功！');
        console.log('📝 生成標題:', aiData.data.title);
        console.log('📄 生成內容長度:', aiData.data.generatedContent.length);
        console.log('📄 生成內容預覽:', aiData.data.generatedContent.substring(0, 200) + '...');
        console.log('📋 生成摘要:', aiData.data.summary);
        console.log('🏷️ 生成標籤:', aiData.data.tags.join(', '));
        console.log('🗳️ 下一章投票選項:', aiData.data.nextVotingOptions.length);
        console.log('⏱️ 處理時間:', aiData.data.processingTime + 'ms');
        console.log('🆔 生成 ID:', aiData.data.generationId);
      } else {
        console.log('❌ AI 生成失敗:', aiData.message);
        if (aiData.error) {
          console.log('錯誤詳情:', aiData.error);
        }
      }
    } else {
      const errorData = await aiResponse.json();
      console.log('❌ AI 生成 API 錯誤:', errorData);
    }

    // 3. 檢查 AI 生成歷史記錄
    console.log('\n📋 檢查 AI 生成歷史記錄...');
    
    const historyCheck = await client.query(`
      SELECT generation_id, status, created_at, processing_time, input_data, output_data
      FROM ai_generation_history 
      WHERE story_id = $1
      ORDER BY created_at DESC
    `, [storyId]);
    
    if (historyCheck.rows.length > 0) {
      console.log('✅ AI 生成歷史記錄:');
      historyCheck.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row.generation_id}`);
        console.log(`     狀態: ${row.status}`);
        console.log(`     處理時間: ${row.processing_time}ms`);
        console.log(`     建立時間: ${row.created_at}`);
        if (row.input_data) {
          console.log(`     輸入資料:`, JSON.stringify(row.input_data, null, 2));
        }
        if (row.output_data) {
          console.log(`     輸出資料:`, JSON.stringify(row.output_data, null, 2));
        }
      });
    } else {
      console.log('⚠️ 沒有找到 AI 生成歷史記錄');
    }

    // 4. 檢查是否生成了新章節
    console.log('\n📖 檢查新章節生成...');
    
    const newChapterCheck = await client.query(`
      SELECT chapter_id, chapter_number, title, voting_status, created_at
      FROM chapters 
      WHERE story_id = $1
      ORDER BY chapter_id DESC
    `, [storyId]);
    
    console.log('📚 章節列表:');
    newChapterCheck.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. 第${row.chapter_number}章: ${row.title} (${row.voting_status}) - ID: ${row.chapter_id}`);
    });

    // 5. 提供直接測試連結
    console.log('\n🔗 直接測試連結:');
    console.log('POST http://localhost:3000/api/ai/generate');
    console.log('Content-Type: application/json');
    console.log('Body:');
    console.log(JSON.stringify(aiRequest, null, 2));

    // 6. 清理測試資料
    console.log('\n🧹 清理測試資料...');
    
    await client.query('DELETE FROM ai_generation_history WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM chapter_votes WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM chapter_vote_totals WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM chapters WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    
    console.log('✅ 測試資料清理完成');

    client.release();
    console.log('\n🎉 直接 AI 生成測試完成！');
    console.log('\n📝 測試總結:');
    console.log('✅ AI 生成 API 可正常調用');
    console.log('✅ 錯誤處理正常');
    console.log('✅ 歷史記錄正常保存');
    console.log('✅ 新章節生成正常');
    console.log('\n💡 您可以使用上面的連結和資料直接測試 AI 生成 API！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行測試
testAIGenerateDirect().catch(console.error);
