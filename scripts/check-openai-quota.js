#!/usr/bin/env node

/**
 * 檢查 OpenAI 配額和限制腳本
 * 使用方法: node scripts/check-openai-quota.js
 */

const { OpenAI } = require('openai');
require('dotenv').config({ path: '.env.local', override: true });

async function checkOpenAIQuota() {
  console.log('🔍 檢查 OpenAI 配額和限制...');
  console.log('='.repeat(50));
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ 未找到 OPENAI_API_KEY 環境變數');
    console.log('請在 .env.local 中設定您的 OpenAI API Key');
    process.exit(1);
  }
  
  console.log(`🔑 API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  const openai = new OpenAI({
    apiKey: apiKey
  });
  
  try {
    // 1. 檢查 API Key 是否有效
    console.log('\n🔐 檢查 API Key 有效性...');
    const models = await openai.models.list();
    console.log('✅ API Key 有效');
    console.log(`📊 可用模型數量: ${models.data.length}`);
    
    // 2. 檢查 GPT-4 模型可用性
    console.log('\n🤖 檢查 GPT-4 模型可用性...');
    const gpt4Models = models.data.filter(model => 
      model.id.includes('gpt-4') && model.id !== 'gpt-4-vision-preview'
    );
    
    if (gpt4Models.length > 0) {
      console.log('✅ GPT-4 模型可用');
      gpt4Models.forEach(model => {
        console.log(`  - ${model.id} (${model.owned_by})`);
      });
    } else {
      console.log('⚠️ 未找到 GPT-4 模型');
      console.log('💡 您可能需要升級到 GPT-4 計劃');
    }
    
    // 3. 測試簡單的 API 調用
    console.log('\n🧪 測試 API 調用...');
    try {
      const testResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello, this is a test message.' }
        ],
        max_tokens: 10
      });
      
      console.log('✅ API 調用成功');
      console.log(`📝 回應: ${testResponse.choices[0].message.content}`);
      
    } catch (apiError) {
      console.log('❌ API 調用失敗');
      console.log(`錯誤類型: ${apiError.constructor.name}`);
      console.log(`錯誤訊息: ${apiError.message}`);
      
      if (apiError.status === 429) {
        console.log('\n🚨 配額超限解決方案:');
        console.log('1. 等待 1-2 小時後再試');
        console.log('2. 檢查 OpenAI 帳戶使用量');
        console.log('3. 考慮升級到更高配額的計劃');
      } else if (apiError.status === 401) {
        console.log('\n🔑 API Key 問題:');
        console.log('1. 檢查 API Key 是否正確');
        console.log('2. 確認 API Key 是否已啟用');
        console.log('3. 檢查帳戶是否有足夠的信用額度');
      } else if (apiError.status === 403) {
        console.log('\n🚫 權限問題:');
        console.log('1. 檢查 API Key 權限');
        console.log('2. 確認帳戶狀態');
        console.log('3. 檢查是否有地區限制');
      }
    }
    
    // 4. 檢查使用量（如果可能）
    console.log('\n📊 檢查使用量...');
    try {
      // 注意：這個 API 可能不是所有帳戶都可用
      const usage = await openai.usage.retrieve({
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      });
      
      console.log('✅ 使用量查詢成功');
      console.log(`📈 今日使用量: ${usage.total_usage || 'N/A'}`);
      
    } catch (usageError) {
      console.log('⚠️ 無法查詢使用量（這可能是正常的）');
      console.log(`原因: ${usageError.message}`);
    }
    
    console.log('\n🎉 配額檢查完成！');
    console.log('\n💡 建議:');
    console.log('1. 如果遇到 429 錯誤，請等待後再試');
    console.log('2. 定期檢查 OpenAI 帳戶使用量');
    console.log('3. 考慮設定使用量警報');
    
  } catch (error) {
    console.error('❌ 配額檢查失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  }
}

// 執行配額檢查
checkOpenAIQuota().catch(console.error);
