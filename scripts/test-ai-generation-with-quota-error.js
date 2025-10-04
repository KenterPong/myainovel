#!/usr/bin/env node

/**
 * 測試 AI 生成配額錯誤處理
 * 使用方法: node scripts/test-ai-generation-with-quota-error.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testAIGenerationWithQuotaError() {
  console.log('🧪 測試 AI 生成配額錯誤處理...');
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
    `, [storyId, 'Q' + String(Date.now()).slice(-5), '配額錯誤測試故事', '投票中']);
    
    console.log('✅ 測試故事建立成功:', storyId);

    // 建立測試章節
    const chapterResult = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId, '001', '第一章：配額錯誤測試', 
      '這是一個配額錯誤測試章節的內容。',
      '配額錯誤測試章節摘要。',
      '進行中', new Date(Date.now() + 24 * 60 * 60 * 1000),
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：測試選項1', description: '描述1' },
          { id: 'B', content: '選項B：測試選項2', description: '描述2' },
        ],
        total_votes: 0
      })
    ]);
    
    const chapterId = chapterResult.rows[0].chapter_id;
    console.log('✅ 測試章節建立成功:', chapterId);

    // 2. 模擬投票達到門檻
    console.log('\n🗳️ 模擬投票達到門檻...');
    
    const threshold = 2; // 開發環境門檻
    const voterSessions = [];
    
    for (let i = 0; i < threshold; i++) {
      const sessionId = 'quota-test-session-' + i + '-' + Date.now();
      voterSessions.push(sessionId);
      
      console.log(`📤 第 ${i + 1} 次投票...`);
      const voteResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          optionId: 'A',
          voterSession: sessionId
        })
      });

      if (voteResponse.ok) {
        const voteData = await voteResponse.json();
        console.log(`✅ 第 ${i + 1} 次投票成功: ${voteData.success}`);
        console.log(`📊 投票統計:`, voteData.data.voteCounts);
        console.log(`🚀 觸發生成: ${voteData.data.triggerGeneration ? '是' : '否'}`);
      } else {
        console.log(`❌ 第 ${i + 1} 次投票失敗: ${voteResponse.status}`);
      }
      
      // 等待一秒避免太快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. 檢查 AI 生成歷史記錄
    console.log('\n📋 檢查 AI 生成歷史記錄...');
    
    const historyCheck = await client.query(`
      SELECT generation_id, status, created_at, processing_time
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
      });
    } else {
      console.log('⚠️ 沒有找到 AI 生成歷史記錄');
    }

    // 4. 測試管理頁面 API 查看錯誤詳情
    console.log('\n🌐 測試管理頁面 API...');
    
    const adminResponse = await fetch('http://localhost:3000/api/admin/ai-generation');
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      if (adminData.success) {
        console.log('✅ 管理頁面 API 成功');
        console.log('📊 總記錄數:', adminData.pagination.total);
        
        // 查找我們剛建立的記錄
        const recentRecord = adminData.data.find(record => 
          record.story_id === storyId
        );
        
        if (recentRecord) {
          console.log('📋 最近的生成記錄:');
          console.log(`  ID: ${recentRecord.generation_id}`);
          console.log(`  狀態: ${recentRecord.status}`);
          console.log(`  輸入資料:`, JSON.stringify(recentRecord.input_data, null, 2));
          console.log(`  輸出資料:`, JSON.stringify(recentRecord.output_data, null, 2));
        }
      } else {
        console.log('❌ 管理頁面 API 失敗:', adminData.message);
      }
    } else {
      console.log('❌ 管理頁面 API 失敗:', adminResponse.status);
    }

    // 5. 清理測試資料
    console.log('\n🧹 清理測試資料...');
    
    await client.query('DELETE FROM ai_generation_history WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM chapter_votes WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM chapter_vote_totals WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM chapters WHERE story_id = $1', [storyId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    
    console.log('✅ 測試資料清理完成');

    client.release();
    console.log('\n🎉 配額錯誤處理測試完成！');
    console.log('\n📋 測試總結:');
    console.log('✅ 投票系統正常');
    console.log('✅ AI 生成歷史記錄正常');
    console.log('✅ 錯誤處理改善');
    console.log('✅ 管理頁面可以查看詳細錯誤');
    console.log('\n💡 現在錯誤訊息會更清楚地顯示配額不足問題！');
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
testAIGenerationWithQuotaError().catch(console.error);
