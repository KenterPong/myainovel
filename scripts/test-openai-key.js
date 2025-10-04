#!/usr/bin/env node

/**
 * 測試 OpenAI API Key 有效性腳本
 * 使用方法: node scripts/test-openai-key.js
 */

require('dotenv').config({ path: '.env.local', override: true });

async function testOpenAIKey() {
  console.log('🔑 測試 OpenAI API Key 有效性...');
  console.log('='.repeat(50));

  // 1. 檢查環境變數
  console.log('📋 檢查環境變數...');
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY 未設定');
    console.log('請在 .env.local 中設定您的 OpenAI API Key');
    process.exit(1);
  }

  // 隱藏 API Key 的大部分內容
  const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`✅ API Key 已設定: ${maskedKey}`);

  // 2. 測試 API Key 格式
  console.log('\n🔍 檢查 API Key 格式...');
  if (!apiKey.startsWith('sk-')) {
    console.log('⚠️ API Key 格式可能不正確，應該以 "sk-" 開頭');
  } else {
    console.log('✅ API Key 格式正確');
  }

  // 3. 測試簡單的 API 調用
  console.log('\n🧪 測試 API 調用...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 HTTP 狀態碼: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ API Key 有效！');
      console.log(`📚 可用模型數量: ${data.data.length}`);
      
      // 顯示一些可用的模型
      console.log('🤖 可用模型（前5個）:');
      data.data.slice(0, 5).forEach((model, index) => {
        console.log(`  ${index + 1}. ${model.id} (${model.owned_by})`);
      });
    } else if (response.status === 401) {
      console.log('❌ API Key 無效或已過期');
      const errorData = await response.json();
      console.log('錯誤詳情:', errorData);
    } else if (response.status === 429) {
      console.log('⚠️ API 調用次數超限，但 Key 可能有效');
      const errorData = await response.json();
      console.log('錯誤詳情:', errorData);
    } else {
      console.log('❌ API 調用失敗');
      const errorData = await response.json();
      console.log('錯誤詳情:', errorData);
    }
  } catch (error) {
    console.log('❌ 網路錯誤:', error.message);
  }

  // 4. 測試聊天完成 API
  console.log('\n💬 測試聊天完成 API...');
  
  try {
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message. Please respond with "API Key is working!"'
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    console.log(`📊 聊天 API 狀態碼: ${chatResponse.status}`);

    if (chatResponse.status === 200) {
      const chatData = await chatResponse.json();
      console.log('✅ 聊天 API 測試成功！');
      console.log('🤖 AI 回應:', chatData.choices[0].message.content);
      
      // 顯示使用量資訊
      if (chatData.usage) {
        console.log('📊 使用量統計:');
        console.log(`  提示詞 tokens: ${chatData.usage.prompt_tokens}`);
        console.log(`  完成 tokens: ${chatData.usage.completion_tokens}`);
        console.log(`  總 tokens: ${chatData.usage.total_tokens}`);
      }
    } else {
      const errorData = await chatResponse.json();
      console.log('❌ 聊天 API 測試失敗');
      console.log('錯誤詳情:', errorData);
    }
  } catch (error) {
    console.log('❌ 聊天 API 網路錯誤:', error.message);
  }

  // 5. 測試我們的 AI 生成服務
  console.log('\n🤖 測試我們的 AI 生成服務...');
  
  try {
    const aiResponse = await fetch('http://localhost:3000/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        storyId: 'test-story-id',
        chapterId: 999,
        previousContext: '這是一個測試上下文。',
        votingResult: {
          optionId: 'A',
          content: '選項A：測試選項',
          description: '這是一個測試選項',
          voteCount: 2,
          percentage: 100
        },
        generationType: 'chapter'
      })
    });

    console.log(`📊 AI 生成服務狀態碼: ${aiResponse.status}`);

    if (aiResponse.status === 200) {
      const aiData = await aiResponse.json();
      if (aiData.success) {
        console.log('✅ AI 生成服務測試成功！');
        console.log('📝 生成標題:', aiData.data.title);
        console.log('📄 生成內容長度:', aiData.data.generatedContent.length);
      } else {
        console.log('❌ AI 生成服務失敗:', aiData.message);
      }
    } else {
      const errorData = await aiResponse.json();
      console.log('❌ AI 生成服務錯誤:', errorData);
    }
  } catch (error) {
    console.log('❌ AI 生成服務網路錯誤:', error.message);
  }

  // 6. 檢查帳戶餘額（如果可能）
  console.log('\n💰 檢查帳戶資訊...');
  
  try {
    const usageResponse = await fetch('https://api.openai.com/v1/usage', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (usageResponse.status === 200) {
      const usageData = await usageResponse.json();
      console.log('✅ 帳戶使用量資訊:');
      console.log('📊 使用量數據:', JSON.stringify(usageData, null, 2));
    } else if (usageResponse.status === 401) {
      console.log('❌ 無法獲取帳戶資訊，API Key 可能無效');
    } else {
      console.log('⚠️ 無法獲取帳戶資訊，狀態碼:', usageResponse.status);
    }
  } catch (error) {
    console.log('⚠️ 無法獲取帳戶資訊:', error.message);
  }

  console.log('\n🎉 OpenAI API Key 測試完成！');
  console.log('\n📝 測試總結:');
  console.log('1. 檢查 API Key 是否設定');
  console.log('2. 驗證 API Key 格式');
  console.log('3. 測試模型列表 API');
  console.log('4. 測試聊天完成 API');
  console.log('5. 測試我們的 AI 生成服務');
  console.log('6. 檢查帳戶使用量');
  console.log('\n💡 如果所有測試都通過，您的 API Key 是有效的！');
}

// 執行測試
testOpenAIKey().catch(console.error);
