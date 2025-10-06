#!/usr/bin/env node

/**
 * 為剩餘章節生成插圖
 */

require('dotenv').config({ path: '.env.local' });

const API_BASE = 'http://localhost:3000/api';

// 剩餘的章節資料（沒有插圖的章節）
const remainingChapters = [
  { chapter_id: 76, story_id: '550e8400-e29b-41d4-a716-446655440001', title: '第004章：A的發展', genre: '奇幻' },
  { chapter_id: 77, story_id: 'b337f81d-0c7f-4643-97fe-bf89ae2f868f', title: '第001章：故事開始', genre: '都市' },
  { chapter_id: 78, story_id: 'e9122fb8-41fe-4675-bdd7-f21c0dd9683e', title: '第001章：故事開始', genre: '都市' },
  { chapter_id: 79, story_id: 'e9122fb8-41fe-4675-bdd7-f21c0dd9683e', title: '第002章：故事發展', genre: '都市' },
  { chapter_id: 80, story_id: 'e9122fb8-41fe-4675-bdd7-f21c0dd9683e', title: '第003章：故事發展', genre: '都市' }
];

async function generateRemainingIllustrations() {
  console.log('========================================');
  console.log('為剩餘章節生成插圖');
  console.log('========================================');
  console.log();

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < remainingChapters.length; i++) {
    const chapter = remainingChapters[i];
    console.log(`\n📖 處理章節 ${i + 1}/${remainingChapters.length}: ${chapter.title}`);
    console.log(`   ID: ${chapter.chapter_id}, 類型: ${chapter.genre}`);

    try {
      const illustrationRequest = {
        chapterId: chapter.chapter_id,
        storyId: chapter.story_id,
        chapterTitle: chapter.title,
        chapterContent: `這是${chapter.title}的內容。故事繼續發展，主角面臨新的挑戰和機遇。在${chapter.genre}的世界中，情節自然推進，為讀者帶來更多驚喜和期待。`,
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
      if (i < remainingChapters.length - 1) {
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
  console.log(`📊 剩餘章節數: ${remainingChapters.length}`);
  console.log(`✅ 成功生成: ${successCount}`);
  console.log(`❌ 生成失敗: ${failCount}`);
  console.log('\n💡 現在所有章節都應該有插圖了！');
}

generateRemainingIllustrations();
