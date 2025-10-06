#!/usr/bin/env node

/**
 * 驗證插圖顯示功能
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('驗證插圖顯示功能');
console.log('========================================');
console.log();

// 1. 檢查生成的插圖檔案
console.log('1. 🖼️ 檢查生成的插圖檔案...');
const storiesDir = path.join('public', 'images', 'stories');

if (fs.existsSync(storiesDir)) {
  const storyDirs = fs.readdirSync(storiesDir);
  console.log(`   找到 ${storyDirs.length} 個故事目錄`);
  
  let totalImages = 0;
  storyDirs.forEach(storyDir => {
    const storyPath = path.join(storiesDir, storyDir);
    if (fs.statSync(storyPath).isDirectory()) {
      const images = fs.readdirSync(storyPath);
      totalImages += images.length;
      console.log(`   📖 ${storyDir}: ${images.length} 個插圖`);
      images.forEach(image => {
        const imagePath = path.join(storyPath, image);
        const stats = fs.statSync(imagePath);
        console.log(`      🖼️  ${image}: ${(stats.size / 1024).toFixed(2)} KB`);
      });
    }
  });
  console.log(`   📊 總共 ${totalImages} 個插圖檔案`);
} else {
  console.log('   ❌ stories 目錄不存在');
}

// 2. 檢查 API 是否包含插圖資料
console.log('\n2. 🔌 檢查 API 插圖資料...');
const fetch = require('node-fetch');

async function checkApiData() {
  try {
    const response = await fetch('http://localhost:3000/api/chapters');
    const data = await response.json();
    
    if (data.success && data.data) {
      const chapters = data.data;
      console.log(`   📚 API 返回 ${chapters.length} 個章節`);
      
      let withIllustration = 0;
      chapters.forEach(chapter => {
        if (chapter.illustration_url) {
          withIllustration++;
          console.log(`   ✅ ${chapter.title}: ${chapter.illustration_url}`);
        } else {
          console.log(`   ❌ ${chapter.title}: 無插圖`);
        }
      });
      
      console.log(`   📊 有插圖的章節: ${withIllustration}/${chapters.length}`);
    } else {
      console.log('   ❌ API 返回失敗');
    }
  } catch (error) {
    console.log(`   ❌ API 檢查失敗: ${error.message}`);
  }
}

checkApiData().then(() => {
  console.log('\n========================================');
  console.log('驗證完成');
  console.log('========================================');
  console.log('💡 如果看到插圖 URL，表示首頁應該能正確顯示插圖！');
  console.log('💡 請重新整理首頁查看效果');
});
