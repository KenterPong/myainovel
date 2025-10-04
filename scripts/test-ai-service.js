#!/usr/bin/env node

/**
 * 測試 AI 生成服務腳本
 */

const { aiGenerationService } = require('./src/lib/services/ai-generation');

async function testAIService() {
  console.log('🤖 測試 AI 生成服務...');
  
  try {
    const request = {
      storyId: '550e8400-e29b-41d4-a716-446655440001',
      chapterId: 1,
      previousContext: '這是一個測試章節的內容。主角站在十字路口，面臨著重要的選擇...',
      votingResult: {
        optionId: 'A',
        content: '選項A：勇敢前行',
        description: '勇敢地選擇前進的道路',
        voteCount: 2,
        percentage: 100
      },
      generationType: 'chapter'
    };
    
    console.log('📤 發送 AI 生成請求...');
    const response = await aiGenerationService.generateChapter(request);
    
    console.log('📊 AI 生成回應:');
    console.log(JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ AI 生成服務錯誤:', error.message);
    console.error('詳細錯誤:', error);
  }
}

testAIService().catch(console.error);
