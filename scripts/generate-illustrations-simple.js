#!/usr/bin/env node

/**
 * 簡單的批次生成插圖腳本
 */

require('dotenv').config({ path: '.env.local' });

const API_BASE = 'http://localhost:3000/api';

// 章節資料（手動輸入，避免模組載入問題）
const chapters = [
  { chapter_id: 71, story_id: '550e8400-e29b-41d4-a716-446655440001', title: '第一章：入學的開始', genre: '奇幻' },
  { chapter_id: 72, story_id: '550e8400-e29b-41d4-a716-446655440002', title: '第一章：未知星球的發現', genre: '科幻' },
  { chapter_id: 73, story_id: '550e8400-e29b-41d4-a716-446655440003', title: '第一章：沉睡的王者', genre: '冒險' },
  { chapter_id: 74, story_id: '550e8400-e29b-41d4-a716-446655440001', title: '第002章：A的發展', genre: '奇幻' },
  { chapter_id: 75, story_id: '550e8400-e29b-41d4-a716-446655440001', title: '第003章：B的發展', genre: '奇幻' }
];

async function generateIllustrations() {
  console.log('========================================');
  console.log('批次生成章節插圖');
  console.log('========================================');
  console.log();

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    console.log(`\n📖 處理章節 ${i + 1}/${chapters.length}: ${chapter.title}`);
    console.log(`   ID: ${chapter.chapter_id}, 類型: ${chapter.genre}`);

    try {
      const illustrationRequest = {
        chapterId: chapter.chapter_id,
        storyId: chapter.story_id,
        chapterTitle: chapter.title,
        chapterContent: `這是${chapter.title}的內容。故事繼續發展，主角面臨新的挑戰和機遇。`,
        storyGenre: chapter.genre
      };

      const startTime = Date.now();
      const response = await fetch(`${API_BASE}/illustrations/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(illustrationRequest)
      });

      const result = await response.json();
      const endTime = Date.now();

      if (result.success) {
        console.log(`   ✅ 成功 (${endTime - startTime}ms)`);
        console.log(`   🖼️  URL: ${result.data.illustrationUrl}`);
        console.log(`   🎨 風格: ${result.data.illustrationStyle}`);
        successCount++;
      } else {
        console.log(`   ❌ 失敗: ${result.error}`);
        failCount++;
      }

      // 延遲避免 API 限制
      if (i < chapters.length - 1) {
        console.log('   ⏳ 等待 3 秒...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.log(`   ❌ 錯誤: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n========================================');
  console.log('生成結果摘要');
  console.log('========================================');
  console.log(`📊 總章節數: ${chapters.length}`);
  console.log(`✅ 成功生成: ${successCount}`);
  console.log(`❌ 生成失敗: ${failCount}`);
  console.log('\n💡 插圖已儲存到 public/images/stories/ 目錄');
}

generateIllustrations();
