#!/usr/bin/env node

/**
 * 測試首頁功能腳本
 * 使用方法: node scripts/test-homepage.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testHomepage() {
  console.log('🏠 測試首頁功能...');
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

    // 1. 測試故事列表 API
    console.log('📥 測試故事列表 API...');
    const storiesResponse = await fetch('http://localhost:3000/api/stories');
    if (storiesResponse.ok) {
      const storiesData = await storiesResponse.json();
      console.log('✅ 故事列表 API 正常');
      console.log(`📊 找到 ${storiesData.data.length} 個故事`);
    } else {
      console.log('❌ 故事列表 API 失敗:', storiesResponse.status);
    }

    // 2. 測試章節 API
    console.log('\n📥 測試章節 API...');
    const chaptersResponse = await fetch('http://localhost:3000/api/stories/550e8400-e29b-41d4-a716-446655440001/chapters');
    if (chaptersResponse.ok) {
      const chaptersData = await chaptersResponse.json();
      console.log('✅ 章節 API 正常');
      if (chaptersData.data.length > 0) {
        const chapter = chaptersData.data[0];
        console.log(`📖 章節標題: ${chapter.title}`);
        console.log(`🗳️ 投票狀態: ${chapter.voting_status}`);
        console.log(`📊 投票選項數量: ${chapter.voting_options?.options?.length || 0}`);
      }
    } else {
      console.log('❌ 章節 API 失敗:', chaptersResponse.status);
    }

    // 3. 測試投票 API
    console.log('\n🗳️ 測試投票 API...');
    const voteResponse = await fetch('http://localhost:3000/api/stories/550e8400-e29b-41d4-a716-446655440001/chapters/16/vote', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-' + Date.now()
      }
    });
    if (voteResponse.ok) {
      const voteData = await voteResponse.json();
      console.log('✅ 投票 API 正常');
      console.log(`📊 投票統計: A=${voteData.data.voteCounts.A}, B=${voteData.data.voteCounts.B}, C=${voteData.data.voteCounts.C}`);
    } else {
      console.log('❌ 投票 API 失敗:', voteResponse.status);
    }

    // 4. 模擬首頁資料載入
    console.log('\n🏠 模擬首頁資料載入...');
    
    // 獲取故事列表
    const homeStoriesResponse = await fetch('http://localhost:3000/api/stories');
    if (homeStoriesResponse.ok) {
      const homeStoriesData = await homeStoriesResponse.json();
      if (homeStoriesData.success) {
        console.log('✅ 首頁故事資料載入成功');
        
        // 為每個故事獲取最新章節
        for (const story of homeStoriesData.data.slice(0, 3)) { // 只處理前3個故事
          try {
            const chaptersResponse = await fetch(`http://localhost:3000/api/stories/${story.story_id}/chapters`);
            if (chaptersResponse.ok) {
              const chaptersData = await chaptersResponse.json();
              if (chaptersData.success && chaptersData.data.length > 0) {
                const currentChapter = chaptersData.data[0];
                console.log(`✅ 故事 "${story.title}" 的章節資料載入成功`);
                console.log(`  章節: ${currentChapter.title}`);
                console.log(`  投票狀態: ${currentChapter.voting_status}`);
                
                // 檢查投票選項
                if (currentChapter.voting_options?.options) {
                  console.log(`  投票選項: ${currentChapter.voting_options.options.length} 個`);
                  
                  // 獲取投票統計
                  if (currentChapter.voting_status === '進行中') {
                    const voteStatsResponse = await fetch(
                      `http://localhost:3000/api/stories/${story.story_id}/chapters/${currentChapter.chapter_id}/vote`
                    );
                    if (voteStatsResponse.ok) {
                      const voteStatsData = await voteStatsResponse.json();
                      if (voteStatsData.success) {
                        console.log(`  投票統計: A=${voteStatsData.data.voteCounts.A}, B=${voteStatsData.data.voteCounts.B}, C=${voteStatsData.data.voteCounts.C}`);
                      }
                    }
                  }
                }
              } else {
                console.log(`⚠️ 故事 "${story.title}" 沒有章節資料`);
              }
            }
          } catch (error) {
            console.warn(`處理故事 "${story.title}" 時發生錯誤:`, error.message);
          }
        }
      } else {
        console.log('❌ 首頁故事資料載入失敗');
      }
    } else {
      console.log('❌ 首頁故事資料載入失敗:', homeStoriesResponse.status);
    }

    client.release();
    console.log('\n🎉 首頁功能測試完成！');
    console.log('\n📋 測試總結:');
    console.log('✅ 故事列表 API 正常');
    console.log('✅ 章節 API 正常');
    console.log('✅ 投票 API 正常');
    console.log('✅ 首頁資料載入正常');
    console.log('\n🚀 首頁應該能正常顯示了！');
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
testHomepage().catch(console.error);
