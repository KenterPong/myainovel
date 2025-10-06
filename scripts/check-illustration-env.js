#!/usr/bin/env node

/**
 * 章節插圖功能環境變數檢查腳本
 * 檢查所有必要的環境變數是否已正確設定
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('章節插圖功能環境變數檢查');
console.log('========================================');
console.log();

// 讀取 .env.local 檔案
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

try {
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    } else {
        console.log('⚠️  .env.local 檔案不存在，請先建立環境變數檔案');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ 讀取 .env.local 檔案失敗:', error.message);
    process.exit(1);
}

// 定義必要的環境變數
const requiredEnvVars = {
    // AI 服務設定
    'OPENAI_API_KEY': {
        description: 'OpenAI API 金鑰',
        required: true
    },
    
    // AI 插圖生成設定
    'OPENAI_IMAGE_MODEL': {
        description: 'OpenAI 圖片生成模型',
        defaultValue: 'dall-e-3',
        required: true
    },
    'OPENAI_IMAGE_QUALITY': {
        description: '圖片生成品質',
        defaultValue: 'standard',
        required: true
    },
    'OPENAI_IMAGE_SIZE': {
        description: '圖片生成尺寸',
        defaultValue: '1024x1024',
        required: true
    },
    
    // 圖片處理設定
    'IMAGE_OUTPUT_FORMAT': {
        description: '圖片輸出格式',
        defaultValue: 'webp',
        required: true
    },
    'IMAGE_QUALITY': {
        description: '圖片品質參數',
        defaultValue: '85',
        required: true
    },
    'IMAGE_STORAGE_PATH': {
        description: '圖片儲存路徑',
        defaultValue: 'public/images/stories',
        required: true
    }
};

// 解析環境變數
const envVars = {};
envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
        }
    }
});

// 檢查環境變數
let allPassed = true;
const results = [];

console.log('檢查結果：');
console.log('----------');

Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const value = envVars[key];
    const isSet = value !== undefined && value !== '';
    const isCorrect = isSet && (config.defaultValue ? value === config.defaultValue : true);
    
    let status = '❌';
    let message = '';
    
    if (isCorrect) {
        status = '✅';
        message = `已設定: ${value}`;
    } else if (isSet) {
        status = '⚠️';
        message = `已設定但值不正確: ${value} (建議: ${config.defaultValue || '任意值'})`;
    } else {
        status = '❌';
        message = `未設定 (建議: ${config.defaultValue || '需要設定'})`;
        if (config.required) {
            allPassed = false;
        }
    }
    
    console.log(`${status} ${key}: ${message}`);
    console.log(`   說明: ${config.description}`);
    console.log();
    
    results.push({
        key,
        status: isCorrect ? 'pass' : (isSet ? 'warning' : 'fail'),
        value,
        expected: config.defaultValue
    });
});

console.log('========================================');
console.log('環境變數檢查摘要');
console.log('========================================');

const passCount = results.filter(r => r.status === 'pass').length;
const warningCount = results.filter(r => r.status === 'warning').length;
const failCount = results.filter(r => r.status === 'fail').length;

console.log(`✅ 正確設定: ${passCount}`);
console.log(`⚠️  需要調整: ${warningCount}`);
console.log(`❌ 未設定: ${failCount}`);
console.log();

if (allPassed) {
    console.log('🎉 所有必要的環境變數都已正確設定！');
    console.log('可以開始進行章節插圖功能開發。');
} else {
    console.log('⚠️  部分環境變數需要設定或調整。');
    console.log('請參考以下建議：');
    console.log();
    
    results.filter(r => r.status !== 'pass').forEach(result => {
        console.log(`- ${result.key}: ${result.expected ? `建議設定為 "${result.expected}"` : '需要設定適當的值'}`);
    });
    
    console.log();
    console.log('請更新 .env.local 檔案後重新執行此腳本。');
}

console.log('========================================');
