#!/usr/bin/env node

/**
 * 批次生成所有現有章節的插圖
 */

require('dotenv').config({ path: '.env.local' });

const API_BASE = 'http://localhost:3000/api';

async function generateAllChapterIllustrations() {
  console.log('========================================');
  console.log('批次生成所有章節插圖');
  console.log('========================================');
  console.log();

  try {
    // 1. 獲取所有章節資料
    console.log('1. 📚 獲取章節資料...');
    const chaptersResponse = await fetch(`${API_BASE}/chapters`);
    
    if (!chaptersResponse.ok) {
      throw new Error(`獲取章節資料失敗: ${chaptersResponse.status}`);
    }
    
    const chaptersData = await chaptersResponse.json();
    const chapters = chaptersData.chapters || [];
    
    console.log(`   找到 ${chapters.length} 個章節`);
    
    if (chapters.length === 0) {
      console.log('   ⚠️ 沒有找到章節資料');
      return;
    }

    // 2. 為每個章節生成插圖
    console.log('\n2. 🎨 開始生成插圖...');
    
    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      console.log(`\n   📖 處理章節 ${i + 1}/${chapters.length}: ${chapter.title}`);
      console.log(`      ID: ${chapter.chapter_id}, 故事: ${chapter.story_id}`);
      
      try {
        // 檢查是否已有插圖
        if (chapter.illustration_url) {
          console.log('      ⏭️ 跳過（已有插圖）');
          continue;
        }

        // 確定故事類型
        let storyGenre = '都市'; // 預設類型
        
        // 根據章節標題或內容推測類型
        const title = chapter.title.toLowerCase();
        const content = chapter.full_text?.toLowerCase() || '';
        
        if (title.includes('魔法') || title.includes('學院') || content.includes('魔法') || content.includes('咒語')) {
          storyGenre = '奇幻';
        } else if (title.includes('星球') || title.includes('太空') || content.includes('太空') || content.includes('科技')) {
          storyGenre = '科幻';
        } else if (title.includes('王者') || title.includes('冒險') || content.includes('冒險') || content.includes('探索')) {
          storyGenre = '冒險';
        }

        console.log(`      🎭 故事類型: ${storyGenre}`);

        // 生成插圖
        const illustrationRequest = {
          chapterId: chapter.chapter_id,
          storyId: chapter.story_id,
          chapterTitle: chapter.title,
          chapterContent: chapter.full_text || '',
          storyGenre: storyGenre
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
          console.log(`      ✅ 成功 (${endTime - startTime}ms)`);
          console.log(`         🖼️  URL: ${result.data.illustrationUrl}`);
          console.log(`         🎨 風格: ${result.data.illustrationStyle}`);
          successCount++;
          results.push({
            chapterId: chapter.chapter_id,
            title: chapter.title,
            success: true,
            illustrationUrl: result.data.illustrationUrl,
            style: result.data.illustrationStyle,
            processingTime: endTime - startTime
          });
        } else {
          console.log(`      ❌ 失敗: ${result.error}`);
          failCount++;
          results.push({
            chapterId: chapter.chapter_id,
            title: chapter.title,
            success: false,
            error: result.error
          });
        }

        // 避免 API 限制，稍作延遲
        if (i < chapters.length - 1) {
          console.log('      ⏳ 等待 2 秒...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.log(`      ❌ 錯誤: ${error.message}`);
        failCount++;
        results.push({
          chapterId: chapter.chapter_id,
          title: chapter.title,
          success: false,
          error: error.message
        });
      }
    }

    // 3. 顯示結果摘要
    console.log('\n========================================');
    console.log('生成結果摘要');
    console.log('========================================');
    console.log(`📊 總章節數: ${chapters.length}`);
    console.log(`✅ 成功生成: ${successCount}`);
    console.log(`❌ 生成失敗: ${failCount}`);
    console.log(`⏭️ 跳過（已有插圖）: ${chapters.length - successCount - failCount}`);

    if (successCount > 0) {
      console.log('\n🎉 成功生成的插圖:');
      results.filter(r => r.success).forEach(result => {
        console.log(`   📖 ${result.title} (ID: ${result.chapterId})`);
        console.log(`      🖼️  ${result.illustrationUrl}`);
        console.log(`      🎨 ${result.style} (${result.processingTime}ms)`);
      });
    }

    if (failCount > 0) {
      console.log('\n❌ 生成失敗的章節:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   📖 ${result.title} (ID: ${result.chapterId})`);
        console.log(`      ❌ ${result.error}`);
      });
    }

    console.log('\n💡 插圖已儲存到 public/images/stories/ 目錄');
    console.log('💡 現在可以在首頁看到章節插圖了！');

  } catch (error) {
    console.error('❌ 批次生成過程中發生錯誤:', error);
  }
}

// 執行批次生成
generateAllChapterIllustrations();
