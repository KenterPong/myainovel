#!/usr/bin/env node

/**
 * 清理並重新建立資料庫測試資料腳本
 * 使用方法: node scripts/clean-and-setup-database.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function cleanAndSetupDatabase() {
  console.log('🧹 清理並重新建立資料庫...');
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

    // 1. 清理現有測試資料
    console.log('🧹 清理現有測試資料...');
    
    // 清理所有測試相關的資料
    await client.query('DELETE FROM chapter_votes WHERE story_id::text LIKE \'550e8400-e29b-41d4-a716-446655440%\'');
    await client.query('DELETE FROM chapter_vote_totals WHERE story_id::text LIKE \'550e8400-e29b-41d4-a716-446655440%\'');
    await client.query('DELETE FROM chapters WHERE story_id::text LIKE \'550e8400-e29b-41d4-a716-446655440%\'');
    await client.query('DELETE FROM stories WHERE story_id::text LIKE \'550e8400-e29b-41d4-a716-446655440%\'');
    
    // 清理其他測試資料
    await client.query('DELETE FROM chapter_votes WHERE story_id::text LIKE \'test%\'');
    await client.query('DELETE FROM chapter_vote_totals WHERE story_id::text LIKE \'test%\'');
    await client.query('DELETE FROM chapters WHERE story_id::text LIKE \'test%\'');
    await client.query('DELETE FROM stories WHERE story_id::text LIKE \'test%\'');
    
    console.log('✅ 測試資料清理完成');

    // 2. 建立新的測試故事
    console.log('\n📖 建立新的測試故事...');
    
    const stories = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        serial: 'T001',
        title: '勇者傳說',
        status: '投票中'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002', 
        serial: 'T002',
        title: '魔法學院',
        status: '投票中'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        serial: 'T003', 
        title: '星際冒險',
        status: '投票中'
      }
    ];

    for (const story of stories) {
      await client.query(`
        INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
        VALUES ($1, $2, $3, $4, NOW())
      `, [story.id, story.serial, story.title, story.status]);
      console.log(`✅ 故事建立成功: ${story.title}`);
    }

    // 3. 建立新的測試章節
    console.log('\n📝 建立新的測試章節...');
    
    const chapters = [
      {
        storyId: '550e8400-e29b-41d4-a716-446655440001',
        chapterNumber: '001',
        title: '第一章：勇者的開始',
        content: '在一個遙遠的村莊裡，住著一個名叫艾倫的年輕人。他從小就夢想成為一名勇者，拯救世界於危難之中。今天，他終於收到了來自王宮的召喚信，邀請他前往王宮接受重要的任務。艾倫站在村口，望著遠方的王宮，心中既興奮又緊張...',
        summary: '艾倫收到王宮召喚，準備踏上勇者之路',
        votingOptions: {
          options: [
            { id: 'A', content: '選項A：直接前往王宮', description: '立即前往王宮接受任務' },
            { id: 'B', content: '選項B：先準備裝備', description: '先去武器店購買裝備' },
            { id: 'C', content: '選項C：詢問村民意見', description: '向村長和村民請教' }
          ],
          total_votes: 0
        }
      },
      {
        storyId: '550e8400-e29b-41d4-a716-446655440002',
        chapterNumber: '001', 
        title: '第一章：入學考試',
        content: '艾莉亞站在魔法學院的大門前，心中既興奮又緊張。今天是入學考試的日子，她必須通過嚴格的測試才能成為一名真正的魔法師。學院的大門高聳入雲，上面刻滿了古老的魔法符文，散發著神秘的光芒...',
        summary: '艾莉亞參加魔法學院入學考試',
        votingOptions: {
          options: [
            { id: 'A', content: '選項A：選擇火系魔法', description: '專精火系魔法，攻擊力強' },
            { id: 'B', content: '選項B：選擇水系魔法', description: '專精水系魔法，治療能力強' },
            { id: 'C', content: '選項C：選擇風系魔法', description: '專精風系魔法，速度最快' }
          ],
          total_votes: 0
        }
      },
      {
        storyId: '550e8400-e29b-41d4-a716-446655440003',
        chapterNumber: '001',
        title: '第一章：太空船迫降',
        content: '太空船「探索者號」在執行任務時遭遇了未知的太空風暴，被迫降落在一個神秘的星球上。船長傑克必須帶領船員們在這個陌生的環境中生存下去。星球表面覆蓋著奇異的植物，天空中懸掛著三個不同顏色的月亮...',
        summary: '太空船迫降在神秘星球，船長帶領船員求生',
        votingOptions: {
          options: [
            { id: 'A', content: '選項A：探索星球表面', description: '派出探險隊探索星球' },
            { id: 'B', content: '選項B：修復太空船', description: '優先修復太空船離開' },
            { id: 'C', content: '選項C：建立基地', description: '在星球上建立永久基地' }
          ],
          total_votes: 0
        }
      }
    ];

    for (const chapter of chapters) {
      const chapterResult = await client.query(`
        INSERT INTO chapters (
          story_id, chapter_number, title, full_text, summary, 
          voting_status, voting_deadline, voting_options, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING chapter_id
      `, [
        chapter.storyId,
        chapter.chapterNumber,
        chapter.title,
        chapter.content,
        chapter.summary,
        '進行中',
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小時後截止
        JSON.stringify(chapter.votingOptions),
        JSON.stringify(['小說', '測試', '互動'])
      ]);
      
      const chapterId = chapterResult.rows[0].chapter_id;
      console.log(`✅ 章節建立成功: ${chapter.title} (ID: ${chapterId})`);
    }

    // 4. 驗證資料建立結果
    console.log('\n📊 驗證資料建立結果...');
    
    // 檢查故事數量
    const storiesCount = await client.query('SELECT COUNT(*) as count FROM stories');
    console.log(`📚 故事總數: ${storiesCount.rows[0].count}`);
    
    // 檢查章節數量
    const chaptersCount = await client.query('SELECT COUNT(*) as count FROM chapters');
    console.log(`📝 章節總數: ${chaptersCount.rows[0].count}`);
    
    // 檢查投票記錄數量
    const votesCount = await client.query('SELECT COUNT(*) as count FROM chapter_votes');
    console.log(`🗳️ 投票記錄總數: ${votesCount.rows[0].count}`);
    
    // 檢查投票統計
    const voteTotalsCount = await client.query('SELECT COUNT(*) as count FROM chapter_vote_totals');
    console.log(`📊 投票統計記錄總數: ${voteTotalsCount.rows[0].count}`);

    // 5. 顯示可測試的故事列表
    console.log('\n🎯 可測試的故事列表:');
    const storiesList = await client.query(`
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
    
    storiesList.rows.forEach((story, index) => {
      console.log(`  ${index + 1}. ${story.title}`);
      if (story.chapter_id) {
        console.log(`     📖 第${story.chapter_number}章: ${story.chapter_title} (${story.voting_status})`);
        console.log(`     🔗 測試連結: http://localhost:3000/api/stories/${story.story_id}/chapters/${story.chapter_id}/vote`);
      }
    });

    client.release();
    console.log('\n🎉 資料庫整理完成！');
    console.log('\n📝 準備就緒:');
    console.log('1. 訪問首頁查看故事列表');
    console.log('2. 對章節進行投票（開發環境門檻：2票）');
    console.log('3. 投票達到門檻後會自動觸發 AI 生成');
    console.log('4. 查看 AI 生成歷史記錄');
    console.log('5. 檢查是否生成了新章節');
    console.log('\n🚀 現在可以開始測試了！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 資料庫整理失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行資料庫整理
cleanAndSetupDatabase().catch(console.error);
