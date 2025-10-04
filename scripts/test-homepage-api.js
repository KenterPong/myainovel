#!/usr/bin/env node

/**
 * 測試首頁 API 腳本
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function testHomepageAPI() {
  console.log('🏠 測試首頁 API...');
  console.log('='.repeat(40));
  
  try {
    // 測試首頁 API
    const homeResponse = await fetch('http://localhost:3000/api/stories');
    const homeData = await homeResponse.json();
    
    console.log(`📊 首頁 API 狀態碼: ${homeResponse.status}`);
    console.log(`📊 首頁 API 成功: ${homeData.success}`);
    
    if (homeData.success && homeData.data) {
      console.log(`📚 故事總數: ${homeData.data.length}`);
      
      // 測試每個故事的章節 API
      for (const story of homeData.data) {
        console.log(`\n📖 測試故事: ${story.title} (${story.story_id})`);
        
        try {
          const chaptersResponse = await fetch(`http://localhost:3000/api/stories/${story.story_id}/chapters`);
          const chaptersData = await chaptersResponse.json();
          
          if (chaptersData.success && chaptersData.data.length > 0) {
            const latestChapter = chaptersData.data[0]; // 第一個應該是最新章節
            console.log(`  ✅ 最新章節: 第${latestChapter.chapter_number}章 - ${latestChapter.title} (${latestChapter.voting_status})`);
          } else {
            console.log(`  ❌ 沒有章節`);
          }
        } catch (error) {
          console.log(`  ❌ 章節 API 錯誤: ${error.message}`);
        }
      }
    } else {
      console.log('❌ 首頁 API 失敗:', homeData.message);
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testHomepageAPI().catch(console.error);
