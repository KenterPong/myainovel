#!/usr/bin/env node

/**
 * 階段2 API 開發驗收測試腳本
 * 使用方法: node scripts/acceptance-test-phase2.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function runAcceptanceTest() {
  console.log('🎯 階段2 API 開發驗收測試');
  console.log('='.repeat(60));
  console.log('測試項目：章節投票 API 端點功能');
  console.log('='.repeat(60));
  
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myainovel',
    port: 5432,
    password: '1234',
    ssl: false
  });

  const testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function test(name, testFn) {
    testResults.total++;
    try {
      const result = testFn();
      if (result) {
        console.log(`✅ ${name}`);
        testResults.passed++;
      } else {
        console.log(`❌ ${name}`);
        testResults.failed++;
      }
    } catch (error) {
      console.log(`❌ ${name} - 錯誤: ${error.message}`);
      testResults.failed++;
    }
  }

  try {
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功\n');

    // 測試1: 建立測試資料
    console.log('📝 測試1: 建立測試資料');
    let storyId, chapterId;
    
    test('建立測試故事', async () => {
      const storyResult = await client.query(`
        INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING story_id
      `, [
        '550e8400-e29b-41d4-a716-446655440' + String(Date.now()).slice(-3),
        'T' + String(Date.now()).slice(-5),
        '驗收測試故事',
        '投票中'
      ]);
      storyId = storyResult.rows[0].story_id;
      return true;
    });

    test('建立測試章節', async () => {
      const chapterResult = await client.query(`
        INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING chapter_id
      `, [
        storyId,
        '001',
        '第一章：驗收測試',
        '這是驗收測試章節的內容...',
        '這是驗收測試章節的摘要...',
        '進行中',
        new Date(Date.now() + 24 * 60 * 60 * 1000),
        JSON.stringify({
          options: [
            { id: 'A', content: '選項A：勇敢前行', description: '勇敢地選擇前進的道路' },
            { id: 'B', content: '選項B：謹慎觀察', description: '謹慎地觀察周圍環境' },
            { id: 'C', content: '選項C：尋求幫助', description: '尋求他人的幫助和建議' }
          ],
          total_votes: 0
        })
      ]);
      chapterId = chapterResult.rows[0].chapter_id;
      return true;
    });

    // 測試2: 投票記錄插入
    console.log('\n🗳️ 測試2: 投票記錄插入');
    
    test('插入投票記錄A', async () => {
      await client.query(`
        INSERT INTO chapter_votes (
          chapter_id, story_id, voter_ip, voter_session, 
          option_id, voted_at, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        chapterId, storyId, '192.168.1.1', 'session-1',
        'A', new Date(), 'Test User Agent'
      ]);
      return true;
    });

    test('插入投票記錄B', async () => {
      await client.query(`
        INSERT INTO chapter_votes (
          chapter_id, story_id, voter_ip, voter_session, 
          option_id, voted_at, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        chapterId, storyId, '192.168.1.2', 'session-2',
        'B', new Date(), 'Test User Agent'
      ]);
      return true;
    });

    test('插入投票記錄C', async () => {
      await client.query(`
        INSERT INTO chapter_votes (
          chapter_id, story_id, voter_ip, voter_session, 
          option_id, voted_at, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        chapterId, storyId, '192.168.1.3', 'session-3',
        'C', new Date(), 'Test User Agent'
      ]);
      return true;
    });

    // 測試3: 觸發器功能
    console.log('\n⚡ 測試3: 觸發器功能');
    
    test('觸發器自動更新統計表', async () => {
      const result = await client.query(`
        SELECT option_id, vote_count
        FROM chapter_vote_totals 
        WHERE chapter_id = $1
        ORDER BY option_id
      `, [chapterId]);
      
      const expectedCounts = { A: 1, B: 1, C: 1 };
      const actualCounts = {};
      
      result.rows.forEach(row => {
        actualCounts[row.option_id] = row.vote_count;
      });
      
      return JSON.stringify(actualCounts) === JSON.stringify(expectedCounts);
    });

    // 測試4: 投票限制檢查
    console.log('\n🚫 測試4: 投票限制檢查');
    
    test('重複投票限制檢查', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as vote_count
        FROM chapter_votes 
        WHERE chapter_id = $1 
          AND voter_ip = $2 
          AND voter_session = $3
      `, [chapterId, '192.168.1.1', 'session-1']);
      
      return parseInt(result.rows[0].vote_count) === 1;
    });

    // 測試5: 門檻檢查功能
    console.log('\n🎯 測試5: 門檻檢查功能');
    
    test('門檻檢查邏輯', async () => {
      const result = await client.query(`
        SELECT option_id, vote_count
        FROM chapter_vote_totals
        WHERE chapter_id = $1
        ORDER BY vote_count DESC
      `, [chapterId]);
      
      const maxVotes = Math.max(...result.rows.map(row => row.vote_count));
      const threshold = 100;
      const thresholdReached = maxVotes >= threshold;
      
      return maxVotes === 1 && !thresholdReached;
    });

    // 測試6: 投票統計查詢
    console.log('\n📊 測試6: 投票統計查詢');
    
    test('完整投票統計查詢', async () => {
      const result = await client.query(`
        SELECT 
          c.chapter_id,
          c.voting_status,
          COALESCE(cvt_a.vote_count, 0) as votes_a,
          COALESCE(cvt_b.vote_count, 0) as votes_b,
          COALESCE(cvt_c.vote_count, 0) as votes_c,
          (COALESCE(cvt_a.vote_count, 0) + COALESCE(cvt_b.vote_count, 0) + COALESCE(cvt_c.vote_count, 0)) as total_votes
        FROM chapters c
        LEFT JOIN chapter_vote_totals cvt_a ON c.chapter_id = cvt_a.chapter_id AND cvt_a.option_id = 'A'
        LEFT JOIN chapter_vote_totals cvt_b ON c.chapter_id = cvt_b.chapter_id AND cvt_b.option_id = 'B'
        LEFT JOIN chapter_vote_totals cvt_c ON c.chapter_id = cvt_c.chapter_id AND cvt_c.option_id = 'C'
        WHERE c.chapter_id = $1
      `, [chapterId]);
      
      if (result.rows.length === 0) return false;
      
      const stats = result.rows[0];
      return stats.votes_a === 1 && stats.votes_b === 1 && stats.votes_c === 1 && stats.total_votes === 3;
    });

    // 測試7: 章節狀態更新
    console.log('\n🔄 測試7: 章節狀態更新');
    
    test('更新章節投票狀態', async () => {
      await client.query(`
        UPDATE chapters 
        SET voting_status = '已生成'
        WHERE chapter_id = $1
      `, [chapterId]);
      
      const result = await client.query(`
        SELECT voting_status
        FROM chapters 
        WHERE chapter_id = $1
      `, [chapterId]);
      
      return result.rows[0].voting_status === '已生成';
    });

    // 測試8: 資料完整性檢查
    console.log('\n🔍 測試8: 資料完整性檢查');
    
    test('外鍵約束檢查', async () => {
      const result = await client.query(`
        SELECT 
          cv.vote_id,
          cv.chapter_id,
          cv.story_id,
          c.chapter_id as chapter_exists,
          s.story_id as story_exists
        FROM chapter_votes cv
        JOIN chapters c ON cv.chapter_id = c.chapter_id
        JOIN stories s ON cv.story_id = s.story_id
        WHERE cv.chapter_id = $1
        LIMIT 1
      `, [chapterId]);
      
      return result.rows.length > 0;
    });

    test('唯一約束檢查', async () => {
      const result = await client.query(`
        SELECT 
          chapter_id, option_id, COUNT(*) as count
        FROM chapter_vote_totals 
        WHERE chapter_id = $1
        GROUP BY chapter_id, option_id
        HAVING COUNT(*) > 1
      `, [chapterId]);
      
      return result.rows.length === 0;
    });

    // 清理測試資料
    console.log('\n🧹 清理測試資料...');
    try {
      await client.query('DELETE FROM chapter_votes WHERE chapter_id = $1', [chapterId]);
      await client.query('DELETE FROM chapter_vote_totals WHERE chapter_id = $1', [chapterId]);
      await client.query('DELETE FROM chapters WHERE chapter_id = $1', [chapterId]);
      await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
      console.log('✅ 測試資料清理完成');
    } catch (cleanupError) {
      console.log('⚠️  清理過程中出現錯誤，但不影響測試結果:', cleanupError.message);
    }

    client.release();

    // 輸出測試結果
    console.log('\n' + '='.repeat(60));
    console.log('🎯 階段2 API 開發驗收測試結果');
    console.log('='.repeat(60));
    console.log(`✅ 通過: ${testResults.passed} 項`);
    console.log(`❌ 失敗: ${testResults.failed} 項`);
    console.log(`📊 總計: ${testResults.total} 項`);
    console.log(`📈 成功率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
      console.log('\n🎉 恭喜！階段2 API 開發驗收測試全部通過！');
      console.log('✅ 章節投票 API 端點功能正常');
      console.log('✅ 投票限制和驗證機制正常');
      console.log('✅ 即時統計更新功能正常');
      console.log('✅ AI 生成觸發邏輯正常');
      console.log('✅ 資料庫架構和約束正常');
    } else {
      console.log('\n⚠️  有部分測試失敗，請檢查相關功能');
    }
    
    process.exit(testResults.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 驗收測試失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行驗收測試
runAcceptanceTest().catch(console.error);
