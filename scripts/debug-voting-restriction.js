#!/usr/bin/env node

/**
 * 調試投票限制問題
 * 使用方法: node scripts/debug-voting-restriction.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function debugVotingRestriction() {
  console.log('🔍 調試投票限制問題...');
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

    // 建立測試資料
    const storyId = '550e8400-e29b-41d4-a716-446655440' + String(Date.now()).slice(-3);
    
    // 建立測試故事
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
    `, [storyId, 'T' + String(Date.now()).slice(-5), '投票限制調試故事', '投票中']);
    
    // 建立測試章節
    const chapterResult = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId, '001', '第一章：投票限制調試', '這是投票限制調試章節的內容...', '這是投票限制調試章節的摘要...',
      '進行中', new Date(Date.now() + 24 * 60 * 60 * 1000),
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：調試選項1', description: '調試選項1的描述' },
          { id: 'B', content: '選項B：調試選項2', description: '調試選項2的描述' },
          { id: 'C', content: '選項C：調試選項3', description: '調試選項3的描述' }
        ],
        total_votes: 0
      })
    ]);
    
    const chapterId = chapterResult.rows[0].chapter_id;
    const voterSession = 'debug-session-' + Date.now();
    const voterIP = '192.168.1.100';

    console.log('📝 測試資料建立完成');
    console.log('故事 ID:', storyId);
    console.log('章節 ID:', chapterId);
    console.log('投票會話:', voterSession);
    console.log('投票 IP:', voterIP);

    // 第一次投票
    console.log('\n🗳️ 第一次投票...');
    const firstVoteResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': voterSession
      },
      body: JSON.stringify({
        optionId: 'A',
        voterSession: voterSession
      })
    });

    console.log('第一次投票回應狀態:', firstVoteResponse.status);
    if (firstVoteResponse.ok) {
      const firstVoteData = await firstVoteResponse.json();
      console.log('第一次投票成功:', firstVoteData.success);
    } else {
      const firstVoteError = await firstVoteResponse.text();
      console.log('第一次投票失敗:', firstVoteError);
    }

    // 檢查資料庫記錄
    console.log('\n📊 檢查資料庫記錄...');
    const votesCheck = await client.query(`
      SELECT option_id, voter_ip, voter_session, voted_at
      FROM chapter_votes 
      WHERE chapter_id = $1
      ORDER BY voted_at
    `, [chapterId]);
    
    console.log('投票記錄:');
    votesCheck.rows.forEach(row => {
      console.log(`  ${row.option_id} - IP: ${row.voter_ip}, Session: ${row.voter_session}, 時間: ${row.voted_at}`);
    });

    // 第二次投票（應該被拒絕）
    console.log('\n🗳️ 第二次投票（相同會話）...');
    const secondVoteResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': voterSession
      },
      body: JSON.stringify({
        optionId: 'B',
        voterSession: voterSession
      })
    });

    console.log('第二次投票回應狀態:', secondVoteResponse.status);
    if (secondVoteResponse.status === 429) {
      console.log('✅ 重複投票限制正常運作');
    } else if (secondVoteResponse.ok) {
      console.log('❌ 重複投票限制失效 - 第二次投票成功');
      const secondVoteData = await secondVoteResponse.json();
      console.log('第二次投票資料:', secondVoteData);
    } else {
      const secondVoteError = await secondVoteResponse.text();
      console.log('第二次投票失敗（非預期）:', secondVoteError);
    }

    // 檢查最終資料庫記錄
    console.log('\n📊 檢查最終資料庫記錄...');
    const finalVotesCheck = await client.query(`
      SELECT option_id, voter_ip, voter_session, voted_at
      FROM chapter_votes 
      WHERE chapter_id = $1
      ORDER BY voted_at
    `, [chapterId]);
    
    console.log('最終投票記錄:');
    finalVotesCheck.rows.forEach(row => {
      console.log(`  ${row.option_id} - IP: ${row.voter_ip}, Session: ${row.voter_session}, 時間: ${row.voted_at}`);
    });

    // 測試不同會話的投票
    console.log('\n🗳️ 測試不同會話的投票...');
    const differentSession = 'debug-session-different-' + Date.now();
    const thirdVoteResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': differentSession
      },
      body: JSON.stringify({
        optionId: 'C',
        voterSession: differentSession
      })
    });

    console.log('不同會話投票回應狀態:', thirdVoteResponse.status);
    if (thirdVoteResponse.ok) {
      console.log('✅ 不同會話投票成功');
    } else {
      console.log('❌ 不同會話投票失敗');
    }

    // 清理測試資料
    console.log('\n🧹 清理測試資料...');
    await client.query('DELETE FROM chapter_votes WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapter_vote_totals WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapters WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    
    console.log('✅ 測試資料清理完成');

    client.release();
    console.log('\n🎉 投票限制調試完成！');
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
debugVotingRestriction().catch(console.error);
