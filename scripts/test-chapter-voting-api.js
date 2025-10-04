#!/usr/bin/env node

/**
 * 章節投票 API 測試腳本
 * 使用方法: node scripts/test-chapter-voting-api.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testChapterVotingAPI() {
  console.log('🧪 開始測試章節投票 API...');
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
    
    // 建立測試故事
    const storyResult = await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING story_id
    `, [
      'test-story-' + Date.now(),
      'T' + String(Date.now()).slice(-5),
      '測試故事',
      '投票中'
    ]);
    
    const storyId = storyResult.rows[0].story_id;
    console.log('✅ 測試故事建立成功:', storyId);

    // 建立測試章節
    const chapterResult = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId,
      '001',
      '第一章：開始',
      '這是測試章節的內容...',
      '這是測試章節的摘要...',
      '進行中',
      new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小時後截止
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：前往森林', description: '勇敢地探索未知的森林' },
          { id: 'B', content: '選項B：前往城市', description: '前往繁華的城市尋找機會' },
          { id: 'C', content: '選項C：留在原地', description: '謹慎地留在安全的地方' }
        ],
        total_votes: 0
      })
    ]);
    
    const chapterId = chapterResult.rows[0].chapter_id;
    console.log('✅ 測試章節建立成功:', chapterId);

    // 2. 測試 GET API - 獲取投票統計
    console.log('\n🔍 測試 GET API - 獲取投票統計...');
    
    const getResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-123'
      }
    });
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET API 成功');
      console.log('📊 投票統計:', getData.data);
    } else {
      console.log('❌ GET API 失敗:', getResponse.status, await getResponse.text());
    }

    // 3. 測試 POST API - 提交投票
    console.log('\n🗳️ 測試 POST API - 提交投票...');
    
    const voteData = {
      optionId: 'A',
      voterSession: 'test-session-123'
    };
    
    const postResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-123'
      },
      body: JSON.stringify(voteData)
    });
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST API 成功');
      console.log('📊 投票結果:', postData.data);
    } else {
      console.log('❌ POST API 失敗:', postResponse.status, await postResponse.text());
    }

    // 4. 測試重複投票限制
    console.log('\n🚫 測試重複投票限制...');
    
    const duplicateResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-123'
      },
      body: JSON.stringify(voteData)
    });
    
    if (duplicateResponse.status === 429) {
      console.log('✅ 重複投票限制正常運作');
    } else {
      console.log('❌ 重複投票限制失效:', duplicateResponse.status, await duplicateResponse.text());
    }

    // 5. 測試不同會話的投票
    console.log('\n👥 測試不同會話的投票...');
    
    const differentSessionData = {
      optionId: 'B',
      voterSession: 'test-session-456'
    };
    
    const differentSessionResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-456'
      },
      body: JSON.stringify(differentSessionData)
    });
    
    if (differentSessionResponse.ok) {
      const differentSessionData = await differentSessionResponse.json();
      console.log('✅ 不同會話投票成功');
      console.log('📊 投票結果:', differentSessionData.data);
    } else {
      console.log('❌ 不同會話投票失敗:', differentSessionResponse.status, await differentSessionResponse.text());
    }

    // 6. 檢查資料庫記錄
    console.log('\n📊 檢查資料庫記錄...');
    
    // 檢查投票記錄
    const votesResult = await client.query(`
      SELECT option_id, voter_ip, voter_session, voted_at
      FROM chapter_votes 
      WHERE chapter_id = $1
      ORDER BY voted_at
    `, [chapterId]);
    
    console.log('🗳️ 投票記錄:', votesResult.rows);

    // 檢查投票統計
    const totalsResult = await client.query(`
      SELECT option_id, vote_count, last_updated
      FROM chapter_vote_totals 
      WHERE chapter_id = $1
      ORDER BY option_id
    `, [chapterId]);
    
    console.log('📈 投票統計:', totalsResult.rows);

    // 7. 清理測試資料
    console.log('\n🧹 清理測試資料...');
    
    await client.query('DELETE FROM chapter_votes WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapter_vote_totals WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapters WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    
    console.log('✅ 測試資料清理完成');

    client.release();
    console.log('\n🎉 章節投票 API 測試完成！');
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
testChapterVotingAPI().catch(console.error);
