#!/usr/bin/env node

/**
 * 簡單的插圖生成測試
 */

const API_BASE = 'http://localhost:3000/api';

async function testSimpleIllustration() {
  console.log('========================================');
  console.log('簡單插圖生成測試');
  console.log('========================================');
  console.log();

  try {
    // 測試插圖生成 API
    console.log('🎨 測試插圖生成...');
    
    const illustrationRequest = {
      chapterId: 999,
      storyId: 'test-story-' + Date.now(),
      chapterTitle: '測試章節：魔法冒險',
      chapterContent: '在一個充滿魔法的世界中，主角踏上了尋找傳說中魔法石的冒險旅程。他穿過神秘的森林，遇到了友善的精靈，並學會了第一個魔法咒語。',
      storyGenre: '奇幻'
    };

    console.log('📝 請求參數:', {
      chapterId: illustrationRequest.chapterId,
      storyId: illustrationRequest.storyId,
      chapterTitle: illustrationRequest.chapterTitle,
      storyGenre: illustrationRequest.storyGenre
    });

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
    
    console.log('⏱️ 處理時間:', (endTime - startTime) + 'ms');
    console.log('📊 回應狀態:', response.status);
    
    if (result.success) {
      console.log('✅ 插圖生成成功！');
      console.log('   📁 插圖 URL:', result.data.illustrationUrl);
      console.log('   🎨 插圖風格:', result.data.illustrationStyle);
      console.log('   ⏰ 生成時間:', result.data.generatedAt);
      console.log('   🔧 處理時間:', result.data.processingTime + 'ms');
      
      // 檢查檔案是否存在
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join('public', result.data.illustrationUrl);
      
      if (fs.existsSync(imagePath)) {
        const stats = fs.statSync(imagePath);
        console.log('   📏 檔案大小:', (stats.size / 1024).toFixed(2) + ' KB');
        console.log('   📅 檔案時間:', stats.mtime.toLocaleString());
        console.log('   ✅ 檔案存在於:', imagePath);
      } else {
        console.log('   ❌ 檔案不存在於:', imagePath);
      }
    } else {
      console.log('❌ 插圖生成失敗:', result.error);
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
testSimpleIllustration();
