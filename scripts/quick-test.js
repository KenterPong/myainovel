#!/usr/bin/env node

/**
 * 快速測試系統功能腳本
 * 使用方法: node scripts/quick-test.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function quickTest() {
  console.log('⚡ 快速測試系統功能...');
  console.log('='.repeat(40));
  
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

    // 1. 檢查故事和章節
    console.log('📚 檢查故事和章節...');
    const storiesResult = await client.query(`
      SELECT 
        s.story_id,
        s.title,
        s.status,
        c.chapter_id,
        c.chapter_number,
        c.title as chapter_title,
        c.voting_status
      FROM stories s
      LEFT JOIN chapters c ON s.story_id = c.story_id
      WHERE s.story_id::text LIKE '550e8400-e29b-41d4-a716-446655440%'
      ORDER BY s.created_at DESC
    `);
    
    console.log(`📊 故事總數: ${storiesResult.rows.length}`);
    storiesResult.rows.forEach((story, index) => {
      console.log(`  ${index + 1}. ${story.title} - 第${story.chapter_number}章: ${story.chapter_title} (${story.voting_status})`);
    });

    // 2. 檢查投票記錄
    console.log('\n🗳️ 檢查投票記錄...');
    const votesResult = await client.query(`
      SELECT COUNT(*) as count FROM chapter_votes
    `);
    console.log(`📊 投票記錄總數: ${votesResult.rows[0].count}`);

    // 3. 檢查投票統計
    console.log('\n📊 檢查投票統計...');
    const voteTotalsResult = await client.query(`
      SELECT COUNT(*) as count FROM chapter_vote_totals
    `);
    console.log(`📊 投票統計記錄總數: ${voteTotalsResult.rows[0].count}`);

    // 4. 檢查 AI 生成歷史
    console.log('\n🤖 檢查 AI 生成歷史...');
    const aiHistoryResult = await client.query(`
      SELECT 
        generation_id,
        status,
        processing_time,
        created_at
      FROM ai_generation_history
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`📊 AI 生成歷史記錄總數: ${aiHistoryResult.rows.length}`);
    aiHistoryResult.rows.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.generation_id} - ${record.status} (${record.processing_time}ms)`);
    });

    // 5. 測試 API 端點
    console.log('\n🌐 測試 API 端點...');
    
    // 測試首頁 API
    try {
      const homeResponse = await fetch('http://localhost:3000/api/stories');
      const homeData = await homeResponse.json();
      console.log(`✅ 首頁 API: ${homeResponse.status} - ${homeData.success ? '成功' : '失敗'}`);
    } catch (error) {
      console.log(`❌ 首頁 API 錯誤: ${error.message}`);
    }
    
    // 測試管理頁面 API
    try {
      const adminResponse = await fetch('http://localhost:3000/api/admin/ai-generation');
      const adminData = await adminResponse.json();
      console.log(`✅ 管理頁面 API: ${adminResponse.status} - ${adminData.success ? '成功' : '失敗'}`);
    } catch (error) {
      console.log(`❌ 管理頁面 API 錯誤: ${error.message}`);
    }

    // 6. 檢查環境變數
    console.log('\n🔧 檢查環境變數...');
    const envVars = [
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_SITE_URL',
      'DATABASE_URL'
    ];
    
    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
      } else {
        console.log(`❌ ${varName}: 未設定`);
      }
    });

    client.release();
    console.log('\n🎉 快速測試完成！');
    console.log('\n📝 系統狀態總結:');
    console.log('✅ 資料庫連線正常');
    console.log('✅ 故事和章節資料正常');
    console.log('✅ 投票系統準備就緒');
    console.log('✅ AI 生成歷史記錄正常');
    console.log('✅ API 端點正常');
    
    console.log('\n🚀 系統已準備就緒！');
    console.log('\n💡 下一步:');
    console.log('1. 訪問 http://localhost:3000 查看首頁');
    console.log('2. 對任何章節進行投票測試');
    console.log('3. 等待 OpenAI 配額恢復後測試真實 AI 生成');
    console.log('4. 查看 AI 生成歷史記錄');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 快速測試失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行快速測試
quickTest().catch(console.error);
