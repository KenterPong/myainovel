#!/usr/bin/env node

/**
 * 測試 API 資料庫寫入功能
 * 使用方法: node scripts/test-api-database-write.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testAPIDatabaseWrite() {
  console.log('🧪 測試 API 資料庫寫入功能...');
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
    `, [storyId, 'T' + String(Date.now()).slice(-5), 'API 測試故事', '投票中']);
    
    console.log('✅ 測試故事建立成功:', storyId);

    // 建立測試章節
    const chapterResult = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId, '001', '第一章：API 測試', '這是 API 測試章節的內容...', '這是 API 測試章節的摘要...',
      '進行中', new Date(Date.now() + 24 * 60 * 60 * 1000),
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：測試選項1', description: '測試選項1的描述' },
          { id: 'B', content: '選項B：測試選項2', description: '測試選項2的描述' },
          { id: 'C', content: '選項C：測試選項3', description: '測試選項3的描述' }
        ],
        total_votes: 0
      })
    ]);
    
    const chapterId = chapterResult.rows[0].chapter_id;
    console.log('✅ 測試章節建立成功:', chapterId);

    // 2. 模擬 API 投票請求
    console.log('\n🗳️ 模擬 API 投票請求...');
    
    // 模擬投票記錄插入（模擬 API 的 POST 請求）
    const voteData = {
      optionId: 'A',
      voterSession: 'test-session-' + Date.now()
    };
    
    const voterIP = '192.168.1.100';
    const userAgent = 'Test User Agent';
    
    // 檢查投票限制
    const limitCheck = await client.query(`
      SELECT COUNT(*) as vote_count
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
    `, [chapterId, voterIP, voteData.voterSession]);
    
    const canVote = parseInt(limitCheck.rows[0].vote_count) === 0;
    console.log('投票限制檢查:', canVote ? '✅ 可以投票' : '❌ 不能投票');

    if (canVote) {
      // 插入投票記錄
      await client.query(`
        INSERT INTO chapter_votes (
          chapter_id, story_id, voter_ip, voter_session, 
          option_id, voted_at, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        chapterId, storyId, voterIP, voteData.voterSession,
        voteData.optionId, new Date(), userAgent
      ]);
      
      console.log('✅ 投票記錄插入成功');
    }

    // 3. 檢查觸發器是否更新統計
    console.log('\n📊 檢查投票統計...');
    
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
      console.log('  ❌ 沒有找到投票統計記錄');
    }

    // 4. 檢查投票記錄
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

    // 5. 測試重複投票限制
    console.log('\n🚫 測試重複投票限制...');
    
    const duplicateCheck = await client.query(`
      SELECT COUNT(*) as vote_count
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
    `, [chapterId, voterIP, voteData.voterSession]);
    
    const duplicateCount = parseInt(duplicateCheck.rows[0].vote_count);
    console.log(`重複投票檢查: ${duplicateCount} 次投票 (應該為 1)`);

    // 6. 測試不同會話的投票
    console.log('\n👥 測試不同會話的投票...');
    
    const differentSession = 'test-session-different-' + Date.now();
    const differentIP = '192.168.1.101';
    
    const differentLimitCheck = await client.query(`
      SELECT COUNT(*) as vote_count
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
    `, [chapterId, differentIP, differentSession]);
    
    const canVoteDifferent = parseInt(differentLimitCheck.rows[0].vote_count) === 0;
    console.log('不同會話投票限制檢查:', canVoteDifferent ? '✅ 可以投票' : '❌ 不能投票');

    if (canVoteDifferent) {
      await client.query(`
        INSERT INTO chapter_votes (
          chapter_id, story_id, voter_ip, voter_session, 
          option_id, voted_at, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        chapterId, storyId, differentIP, differentSession,
        'B', new Date(), userAgent
      ]);
      
      console.log('✅ 不同會話投票記錄插入成功');
    }

    // 7. 最終統計檢查
    console.log('\n📈 最終統計檢查...');
    
    const finalTotalsResult = await client.query(`
      SELECT option_id, vote_count
      FROM chapter_vote_totals 
      WHERE chapter_id = $1
      ORDER BY option_id
    `, [chapterId]);
    
    console.log('最終投票統計:');
    finalTotalsResult.rows.forEach(row => {
      console.log(`  ${row.option_id}: ${row.vote_count} 票`);
    });

    // 8. 清理測試資料
    console.log('\n🧹 清理測試資料...');
    
    await client.query('DELETE FROM chapter_votes WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapter_vote_totals WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM chapters WHERE chapter_id = $1', [chapterId]);
    await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
    
    console.log('✅ 測試資料清理完成');

    client.release();
    console.log('\n🎉 API 資料庫寫入功能測試完成！');
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
testAPIDatabaseWrite().catch(console.error);
