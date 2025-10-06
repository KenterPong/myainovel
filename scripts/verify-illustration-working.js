#!/usr/bin/env node

/**
 * 驗證插圖功能是否正常運作
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('驗證插圖功能狀態');
console.log('========================================');
console.log();

// 1. 檢查目錄結構
console.log('1. 檢查目錄結構...');
const publicImagesDir = path.join('public', 'images');
const storiesDir = path.join(publicImagesDir, 'stories');

if (fs.existsSync(publicImagesDir)) {
  console.log('   ✅ public/images 目錄存在');
} else {
  console.log('   ❌ public/images 目錄不存在');
}

if (fs.existsSync(storiesDir)) {
  console.log('   ✅ public/images/stories 目錄存在');
} else {
  console.log('   ❌ public/images/stories 目錄不存在');
}

// 2. 檢查已生成的圖片
console.log('\n2. 檢查已生成的圖片...');
if (fs.existsSync(storiesDir)) {
  const storyDirs = fs.readdirSync(storiesDir);
  console.log(`   📁 找到 ${storyDirs.length} 個故事目錄`);
  
  storyDirs.forEach(storyDir => {
    const storyPath = path.join(storiesDir, storyDir);
    if (fs.statSync(storyPath).isDirectory()) {
      const images = fs.readdirSync(storyPath);
      console.log(`   📖 故事 ${storyDir}: ${images.length} 個插圖`);
      images.forEach(image => {
        const imagePath = path.join(storyPath, image);
        const stats = fs.statSync(imagePath);
        console.log(`      🖼️  ${image}: ${(stats.size / 1024).toFixed(2)} KB`);
      });
    }
  });
} else {
  console.log('   ❌ stories 目錄不存在');
}

// 3. 檢查環境變數
console.log('\n3. 檢查環境變數...');
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'OPENAI_IMAGE_MODEL',
  'OPENAI_IMAGE_QUALITY',
  'OPENAI_IMAGE_SIZE',
  'IMAGE_OUTPUT_FORMAT',
  'IMAGE_QUALITY',
  'IMAGE_STORAGE_PATH'
];

let envVarsOk = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: ${process.env[envVar]}`);
  } else {
    console.log(`   ❌ ${envVar}: 未設定`);
    envVarsOk = false;
  }
});

// 4. 檢查資料庫連線（簡單測試）
console.log('\n4. 檢查資料庫連線...');
try {
  const { query } = require('../src/lib/db');
  query('SELECT 1').then(() => {
    console.log('   ✅ 資料庫連線正常');
  }).catch(err => {
    console.log('   ❌ 資料庫連線失敗:', err.message);
  });
} catch (error) {
  console.log('   ❌ 無法載入資料庫模組:', error.message);
}

console.log('\n========================================');
console.log('驗證完成');
console.log('========================================');

if (envVarsOk) {
  console.log('✅ 環境變數設定正確');
} else {
  console.log('❌ 環境變數設定有問題');
}

console.log('\n💡 如果看到生成的圖片檔案，表示插圖功能正常運作！');
