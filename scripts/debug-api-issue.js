#!/usr/bin/env node

/**
 * 診斷 API 問題腳本
 * 使用方法: node scripts/debug-api-issue.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function debugAPIIssue() {
  console.log('🔍 診斷 API 問題...');
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

    // 1. 檢查環境變數
    console.log('🔧 檢查環境變數...');
    console.log('NEXT_PUBLIC_CHAPTER_VOTING_THRESHOLD:', process.env.NEXT_PUBLIC_CHAPTER_VOTING_THRESHOLD);
    console.log('NEXT_PUBLIC_CHAPTER_VOTING_DURATION_HOURS:', process.env.NEXT_PUBLIC_CHAPTER_VOTING_DURATION_HOURS);
    console.log('NEXT_PUBLIC_CHAPTER_VOTING_COOLDOWN_HOURS:', process.env.NEXT_PUBLIC_CHAPTER_VOTING_COOLDOWN_HOURS);

    // 2. 建立測試資料
    console.log('\n📝 建立測試資料...');
    const storyId = '550e8400-e29b-41d4-a716-446655440' + String(Date.now()).slice(-3);
    
    // 建立測試故事
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
    `, [storyId, 'T' + String(Date.now()).slice(-5), '診斷測試故事', '投票中']);
    
    console.log('✅ 測試故事建立成功:', storyId);

    // 建立測試章節
    const chapterResult = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId, '001', '第一章：診斷測試', '這是診斷測試章節的內容...', '這是診斷測試章節的摘要...',
      '進行中', new Date(Date.now() + 24 * 60 * 60 * 1000),
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：診斷測試選項1', description: '診斷測試選項1的描述' },
          { id: 'B', content: '選項B：診斷測試選項2', description: '診斷測試選項2的描述' },
          { id: 'C', content: '選項C：診斷測試選項3', description: '診斷測試選項3的描述' }
        ],
        total_votes: 0
      })
    ]);
    
    const chapterId = chapterResult.rows[0].chapter_id;
    console.log('✅ 測試章節建立成功:', chapterId);

    // 3. 模擬 API 內部邏輯
    console.log('\n🧪 模擬 API 內部邏輯...');
    
    const voterIP = '192.168.1.200';
    const voterSession = 'debug-session-' + Date.now();
    const optionId = 'A';
    const userAgent = 'Debug User Agent';
    
    // 檢查投票限制
    console.log('🔍 檢查投票限制...');
    const limitCheck = await client.query(`
      SELECT COUNT(*) as vote_count
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
    `, [chapterId, voterIP, voterSession]);
    
    const canVote = parseInt(limitCheck.rows[0].vote_count) === 0;
    console.log('可以投票:', canVote);

    if (canVote) {
      // 插入投票記錄
      console.log('📝 插入投票記錄...');
      await client.query(`
        INSERT INTO chapter_votes (
          chapter_id, story_id, voter_ip, voter_session, 
          option_id, voted_at, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        chapterId, storyId, voterIP, voterSession,
        optionId, new Date(), userAgent
      ]);
      
      console.log('✅ 投票記錄插入成功');
    }

    // 4. 檢查觸發器是否工作
    console.log('\n⚡ 檢查觸發器是否工作...');
    
    const totalsResult = await client.query(`
      SELECT option_id, vote_count, last_updated
      FROM chapter_vote_totals 
      WHERE chapter_id = $1
      ORDER BY option_id
    `, [chapterId]);
    
    console.log('投票統計結果:');
    if (totalsResult.rows.length > 0) {
      totalsResult.rows.forEach(row => {
        console.log(`  ${row.option_id}: ${row.vote_count} 票 (更新時間: ${row.last_updated})`);
      });
    } else {
      console.log('  ❌ 沒有找到投票統計記錄 - 觸發器可能沒有工作');
    }

    // 5. 檢查投票記錄
    console.log('\n🔍 檢查投票記錄...');
    
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

    // 6. 測試重複投票限制
    console.log('\n🚫 測試重複投票限制...');
    
    const duplicateCheck = await client.query(`
      SELECT COUNT(*) as vote_count
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
    `, [chapterId, voterIP, voterSession]);
    
    const duplicateCount = parseInt(duplicateCheck.rows[0].vote_count);
    console.log(`重複投票檢查: ${duplicateCount} 次投票 (應該為 1)`);

    // 7. 檢查觸發器是否存在
    console.log('\n🔍 檢查觸發器是否存在...');
    
    const triggerCheck = await client.query(`
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_update_chapter_vote_totals'
    `);
    
    if (triggerCheck.rows.length > 0) {
      console.log('✅ 觸發器存在:', triggerCheck.rows[0].trigger_name);
    } else {
      console.log('❌ 觸發器不存在');
    }

    // 8. 手動測試觸發器
    console.log('\n🧪 手動測試觸發器...');
    
    // 插入另一筆投票記錄
    const testVoterIP = '192.168.1.201';
    const testVoterSession = 'debug-session-test-' + Date.now();
    
    await client.query(`
      INSERT INTO chapter_votes (
        chapter_id, story_id, voter_ip, voter_session, 
        option_id, voted_at, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      chapterId, storyId, testVoterIP, testVoterSession,
      'B', new Date(), userAgent
    ]);
    
    console.log('✅ 測試投票記錄插入成功');
    
    // 再次檢查統計
    const finalTotalsResult = await client.query(`
      SELECT option_id, vote_count, last_updated
      FROM chapter_vote_totals 
      WHERE chapter_id = $1
      ORDER BY option_id
    `, [chapterId]);
    
    console.log('最終投票統計:');
    finalTotalsResult.rows.forEach(row => {
      console.log(`  ${row.option_id}: ${row.vote_count} 票 (更新時間: ${row.last_updated})`);
    });

    // 9. 清理測試資料
    console.log('\n🧹 清理測試資料...');
    
    await client.query('DELETE FROM chapter_votes WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapter_vote_totals WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapters WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    
    console.log('✅ 測試資料清理完成');

    client.release();
    console.log('\n🎉 API 問題診斷完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 診斷失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行診斷
debugAPIIssue().catch(console.error);
