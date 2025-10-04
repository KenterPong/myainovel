#!/usr/bin/env node

/**
 * 測試 API 端點功能
 * 使用方法: node scripts/test-api-endpoints.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testAPIEndpoints() {
  console.log('🧪 測試 API 端點功能...');
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

    // 1. 建立測試資料
    console.log('📝 建立測試資料...');
    const storyId = '550e8400-e29b-41d4-a716-446655440' + String(Date.now()).slice(-3);
    
    // 建立測試故事
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
    `, [storyId, 'T' + String(Date.now()).slice(-5), 'API 端點測試故事', '投票中']);
    
    console.log('✅ 測試故事建立成功:', storyId);

    // 建立測試章節
    const chapterResult = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId, '001', '第一章：API 端點測試', '這是 API 端點測試章節的內容...', '這是 API 端點測試章節的摘要...',
      '進行中', new Date(Date.now() + 24 * 60 * 60 * 1000),
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：API 測試選項1', description: 'API 測試選項1的描述' },
          { id: 'B', content: '選項B：API 測試選項2', description: 'API 測試選項2的描述' },
          { id: 'C', content: '選項C：API 測試選項3', description: 'API 測試選項3的描述' }
        ],
        total_votes: 0
      })
    ]);
    
    const chapterId = chapterResult.rows[0].chapter_id;
    console.log('✅ 測試章節建立成功:', chapterId);

    // 2. 模擬 API 請求
    console.log('\n🌐 模擬 API 請求...');
    
    // 模擬 GET 請求
    console.log('📥 模擬 GET 請求...');
    const getResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-get'
      }
    });
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET 請求成功');
      console.log('📊 投票統計:', getData.data);
    } else {
      console.log('❌ GET 請求失敗:', getResponse.status, await getResponse.text());
    }

    // 模擬 POST 請求
    console.log('\n📤 模擬 POST 請求...');
    const postData = {
      optionId: 'A',
      voterSession: 'test-session-post'
    };
    
    const postResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-post'
      },
      body: JSON.stringify(postData)
    });
    
    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ POST 請求成功');
      console.log('📊 投票結果:', postResult.data);
    } else {
      console.log('❌ POST 請求失敗:', postResponse.status, await postResponse.text());
    }

    // 3. 檢查資料庫記錄
    console.log('\n🔍 檢查資料庫記錄...');
    
    // 檢查投票記錄
    const votesResult = await client.query(`
      SELECT option_id, voter_ip, voter_session, voted_at
      FROM chapter_votes 
      WHERE chapter_id = $1
      ORDER BY voted_at
    `, [chapterId]);
    
    console.log('投票記錄:');
    if (votesResult.rows.length > 0) {
      votesResult.rows.forEach(row => {
        console.log(`  ${row.option_id} - IP: ${row.voter_ip}, Session: ${row.voter_session}, 時間: ${row.voted_at}`);
      });
    } else {
      console.log('  ❌ 沒有找到投票記錄');
    }

    // 檢查投票統計
    const totalsResult = await client.query(`
      SELECT option_id, vote_count, last_updated
      FROM chapter_vote_totals 
      WHERE chapter_id = $1
      ORDER BY option_id
    `, [chapterId]);
    
    console.log('投票統計:');
    if (totalsResult.rows.length > 0) {
      totalsResult.rows.forEach(row => {
        console.log(`  ${row.option_id}: ${row.vote_count} 票 (更新時間: ${row.last_updated})`);
      });
    } else {
      console.log('  ❌ 沒有找到投票統計記錄');
    }

    // 4. 測試重複投票
    console.log('\n🚫 測試重複投票...');
    
    const duplicateResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-post'
      },
      body: JSON.stringify(postData)
    });
    
    if (duplicateResponse.status === 429) {
      console.log('✅ 重複投票限制正常運作');
    } else {
      console.log('❌ 重複投票限制失效:', duplicateResponse.status, await duplicateResponse.text());
    }

    // 5. 清理測試資料
    console.log('\n🧹 清理測試資料...');
    
    await client.query('DELETE FROM chapter_votes WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapter_vote_totals WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapters WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    
    console.log('✅ 測試資料清理完成');

    client.release();
    console.log('\n🎉 API 端點功能測試完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 檢查是否在開發環境中運行
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️  此腳本僅適用於開發環境');
  process.exit(1);
}

// 執行測試
testAPIEndpoints().catch(console.error);
