#!/usr/bin/env node

/**
 * 設定環境變數腳本
 * 使用方法: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

function setupEnvironmentVariables() {
  console.log('🔧 設定環境變數...');
  
  const envContent = `# 資料庫連線設定
DATABASE_URL=postgresql://postgres:1234@localhost:5432/myainovel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1234
POSTGRES_DB=myainovel
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# 網站設定
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# AI 服務設定
OPENAI_API_KEY=your-openai-api-key

# 投票系統設定
NEXT_PUBLIC_VOTING_THRESHOLD=100
NEXT_PUBLIC_VOTING_DURATION_DAYS=7
NEXT_PUBLIC_VOTING_COOLDOWN_HOURS=24

# 章節投票系統設定
NEXT_PUBLIC_CHAPTER_VOTING_THRESHOLD=100
NEXT_PUBLIC_CHAPTER_VOTING_DURATION_HOURS=24
NEXT_PUBLIC_CHAPTER_VOTING_COOLDOWN_HOURS=24
`;

  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local 檔案建立成功');
    console.log('📝 包含以下環境變數:');
    console.log('  - NEXT_PUBLIC_CHAPTER_VOTING_THRESHOLD=100');
    console.log('  - NEXT_PUBLIC_CHAPTER_VOTING_DURATION_HOURS=24');
    console.log('  - NEXT_PUBLIC_CHAPTER_VOTING_COOLDOWN_HOURS=24');
    console.log('  - 以及其他必要的資料庫和網站設定');
  } catch (error) {
    console.error('❌ 建立 .env.local 檔案失敗:', error.message);
    console.log('\n🔧 請手動建立 .env.local 檔案，內容如下:');
    console.log('='.repeat(50));
    console.log(envContent);
    console.log('='.repeat(50));
  }
}

// 執行設定
setupEnvironmentVariables();
