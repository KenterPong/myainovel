#!/usr/bin/env node

/**
 * 建立測試資料腳本
 * 使用方法: node scripts/create-test-data.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function createTestData() {
  console.log('📝 建立測試資料...');
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

    // 清理現有測試資料
    console.log('🧹 清理現有測試資料...');
    await client.query('DELETE FROM chapter_votes WHERE story_id IN ($1, $2, $3)', [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002', 
      '550e8400-e29b-41d4-a716-446655440003'
    ]);
    await client.query('DELETE FROM chapter_vote_totals WHERE story_id IN ($1, $2, $3)', [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003'
    ]);
    await client.query('DELETE FROM chapters WHERE story_id IN ($1, $2, $3)', [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003'
    ]);
    await client.query('DELETE FROM stories WHERE story_id IN ($1, $2, $3)', [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003'
    ]);

    // 建立測試故事 1
    const storyId1 = '550e8400-e29b-41d4-a716-446655440001';
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
    `, [storyId1, 'T001', '測試故事 1：勇者傳說', '投票中']);

    // 為故事 1 建立章節
    const chapter1Result = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId1, '001', '第一章：勇者的開始', 
      '雷歐站在村莊的入口，手中握著父親留給他的古老劍柄。遠處傳來怪物的咆哮聲，他知道自己的冒險即將開始...',
      '雷歐開始了他的勇者之旅，面對未知的挑戰。',
      '進行中', new Date(Date.now() + 24 * 60 * 60 * 1000),
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：直接前往怪物巢穴', description: '勇敢地正面迎戰怪物' },
          { id: 'B', content: '選項B：先收集情報', description: '謹慎地收集更多資訊' },
          { id: 'C', content: '選項C：尋求村民幫助', description: '尋求村民的協助和建議' }
        ],
        total_votes: 0
      })
    ]);

    const chapterId1 = chapter1Result.rows[0].chapter_id;
    console.log('✅ 測試故事 1 建立成功:', storyId1, '章節:', chapterId1);

    // 建立測試故事 2
    const storyId2 = '550e8400-e29b-41d4-a716-446655440002';
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
    `, [storyId2, 'T002', '測試故事 2：魔法學院', '投票中']);

    // 為故事 2 建立章節
    const chapter2Result = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId2, '001', '第一章：入學考試', 
      '莉亞站在魔法學院的考場中，面前有三道不同顏色的魔法門。她必須選擇一扇門來證明自己的魔法天賦...',
      '莉亞參加魔法學院的入學考試，面臨重要的選擇。',
      '進行中', new Date(Date.now() + 12 * 60 * 60 * 1000),
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：選擇火焰之門', description: '展現火系魔法的天賦' },
          { id: 'B', content: '選項B：選擇冰霜之門', description: '展現冰系魔法的天賦' },
          { id: 'C', content: '選項C：選擇自然之門', description: '展現自然魔法的天賦' }
        ],
        total_votes: 0
      })
    ]);

    const chapterId2 = chapter2Result.rows[0].chapter_id;
    console.log('✅ 測試故事 2 建立成功:', storyId2, '章節:', chapterId2);

    // 建立測試故事 3（已完成投票）
    const storyId3 = '550e8400-e29b-41d4-a716-446655440003';
    await client.query(`
      INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, NOW())
    `, [storyId3, 'T003', '測試故事 3：星際冒險', '撰寫中']);

    // 為故事 3 建立章節（投票已結束）
    const chapter3Result = await client.query(`
      INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING chapter_id
    `, [
      storyId3, '001', '第一章：太空船迫降', 
      '艾莉絲的太空船迫降在一個神秘的星球上。周圍的植物散發著淡藍色的光芒，天空中漂浮著巨大的水晶結構...',
      '艾莉絲的太空船迫降在神秘星球，開始探索未知世界。',
      '已生成', new Date(Date.now() - 24 * 60 * 60 * 1000), // 過去時間
      JSON.stringify({
        options: [
          { id: 'A', content: '選項A：謹慎探索環境', description: '小心地探索周圍環境' },
          { id: 'B', content: '選項B：嘗試接觸觀察者', description: '主動與觀察者建立聯繫' },
          { id: 'C', content: '選項C：立即修理太空船', description: '專注於修理太空船準備離開' }
        ],
        total_votes: 150
      })
    ]);

    const chapterId3 = chapter3Result.rows[0].chapter_id;
    console.log('✅ 測試故事 3 建立成功:', storyId3, '章節:', chapterId3);

    // 為故事 3 建立投票統計（模擬已完成的投票）
    await client.query(`
      INSERT INTO chapter_vote_totals (chapter_id, story_id, option_id, vote_count, last_updated)
      VALUES 
        ($1, $2, 'A', 60, NOW()),
        ($1, $2, 'B', 45, NOW()),
        ($1, $2, 'C', 45, NOW())
    `, [chapterId3, storyId3]);

    console.log('✅ 投票統計建立成功');

    client.release();
    console.log('\n🎉 測試資料建立完成！');
    console.log('📊 建立了 3 個測試故事，包含不同的投票狀態');
    process.exit(0);
  } catch (error) {
    console.error('❌ 建立測試資料失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行建立測試資料
createTestData().catch(console.error);
