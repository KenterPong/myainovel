#!/usr/bin/env node

/**
 * 測試章節插圖生成功能
 */

// 使用內建的 fetch API (Node.js 18+)

const API_BASE = 'http://localhost:3000/api';

async function testIllustrationGeneration() {
  console.log('========================================');
  console.log('測試章節插圖生成功能');
  console.log('========================================');
  console.log();

  try {
    // 1. 測試插圖生成 API
    console.log('1. 測試插圖生成 API...');
    
    const illustrationRequest = {
      chapterId: 1,
      storyId: 'test-story-id',
      chapterTitle: '第一章：故事的開始',
      chapterContent: '在一個充滿魔法的世界中，主角踏上了冒險的旅程。他遇到了神秘的魔法師，學習了古老的咒語，並準備面對未知的挑戰。',
      storyGenre: '奇幻'
    };

    const illustrationResponse = await fetch(`${API_BASE}/illustrations/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(illustrationRequest)
    });

    const illustrationResult = await illustrationResponse.json();
    
    if (illustrationResult.success) {
      console.log('✅ 插圖生成 API 測試成功');
      console.log('   插圖 URL:', illustrationResult.data.illustrationUrl);
      console.log('   插圖風格:', illustrationResult.data.illustrationStyle);
      console.log('   處理時間:', illustrationResult.data.processingTime + 'ms');
    } else {
      console.log('❌ 插圖生成 API 測試失敗:', illustrationResult.error);
    }

    console.log();

    // 2. 測試插圖風格管理 API
    console.log('2. 測試插圖風格管理 API...');
    
    const styleRequest = {
      storyId: 'test-story-id',
      storyGenre: '科幻',
      styleName: '賽博龐克插畫風',
      stylePrompt: 'Cyberpunk illustration style, neon colors, dark atmosphere, futuristic cityscape',
      colorPalette: ['#00FFFF', '#FF00FF', '#FFFF00', '#000000'],
      artStyle: 'Digital illustration with clean lines and vibrant neon colors',
      mood: 'Dark, mysterious, high-tech',
      characterStyle: 'Anime-inspired character design with cyberpunk elements'
    };

    const styleResponse = await fetch(`${API_BASE}/illustrations/styles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(styleRequest)
    });

    const styleResult = await styleResponse.json();
    
    if (styleResult.success) {
      console.log('✅ 插圖風格設定 API 測試成功');
      console.log('   風格名稱:', styleResult.data.style_name);
      console.log('   故事類型:', styleResult.data.story_genre);
    } else {
      console.log('❌ 插圖風格設定 API 測試失敗:', styleResult.error);
    }

    console.log();

    // 3. 測試獲取插圖風格
    console.log('3. 測試獲取插圖風格...');
    
    const getStyleResponse = await fetch(`${API_BASE}/illustrations/styles?storyId=test-story-id`);
    const getStyleResult = await getStyleResponse.json();
    
    if (getStyleResult.success) {
      console.log('✅ 獲取插圖風格 API 測試成功');
      if (getStyleResult.data) {
        console.log('   風格名稱:', getStyleResult.data.style_name);
        console.log('   故事類型:', getStyleResult.data.story_genre);
      } else {
        console.log('   該故事尚未設定插圖風格');
      }
    } else {
      console.log('❌ 獲取插圖風格 API 測試失敗:', getStyleResult.error);
    }

    console.log();

    // 4. 測試章節生成整合插圖功能
    console.log('4. 測試章節生成整合插圖功能...');
    
    // 先建立一個測試故事
    const storyResponse = await fetch(`${API_BASE}/stories/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        outer: '科幻',
        middle: '太空',
        inner: '探索'
      })
    });

    const storyResult = await storyResponse.json();
    
    if (storyResult.success) {
      const storyId = storyResult.storyId;
      console.log('✅ 測試故事建立成功，故事ID:', storyId);
      
      // 生成章節（應該會自動生成插圖）
      const chapterResponse = await fetch(`${API_BASE}/stories/${storyId}/chapters/generate`, {
        method: 'POST'
      });

      const chapterResult = await chapterResponse.json();
      
      if (chapterResult.success) {
        console.log('✅ 章節生成成功');
        console.log('   章節ID:', chapterResult.chapterId);
        console.log('   章節編號:', chapterResult.chapterNumber);
        
        if (chapterResult.illustration) {
          console.log('✅ 插圖生成成功');
          console.log('   插圖 URL:', chapterResult.illustration.url);
          console.log('   插圖風格:', chapterResult.illustration.style);
        } else {
          console.log('⚠️ 插圖生成失敗或未包含在回應中');
        }
      } else {
        console.log('❌ 章節生成失敗:', chapterResult.error);
      }
    } else {
      console.log('❌ 測試故事建立失敗:', storyResult.error);
    }

    console.log();
    console.log('========================================');
    console.log('測試完成');
    console.log('========================================');

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  }
}

// 執行測試
testIllustrationGeneration();
