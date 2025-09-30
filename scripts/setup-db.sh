#!/bin/bash

# PostgreSQL 資料庫快速設定腳本
# 使用方法: bash scripts/setup-db.sh

echo "🚀 開始設定 PostgreSQL 資料庫..."

# 檢查 PostgreSQL 是否安裝
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL 未安裝，請先安裝 PostgreSQL"
    echo "Windows: https://www.postgresql.org/download/windows/"
    echo "macOS: brew install postgresql"
    echo "Ubuntu: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

echo "✅ PostgreSQL 已安裝"

# 檢查環境變數檔案
if [ ! -f ".env.local" ]; then
    echo "📝 建立環境變數檔案..."
    cp env.example .env.local
    echo "⚠️  請編輯 .env.local 檔案，設定正確的資料庫連線資訊"
    echo "   編輯完成後請重新執行此腳本"
    exit 1
fi

echo "✅ 環境變數檔案已存在"

# 讀取環境變數
source .env.local

# 檢查必要的環境變數
if [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ 缺少必要的環境變數"
    echo "請確保 .env.local 包含以下變數:"
    echo "POSTGRES_DB=myainovel"
    echo "POSTGRES_USER=your_username"
    echo "POSTGRES_PASSWORD=your_password"
    exit 1
fi

echo "✅ 環境變數設定正確"

# 建立資料庫
echo "📊 建立資料庫..."
createdb -U $POSTGRES_USER $POSTGRES_DB 2>/dev/null || echo "資料庫可能已存在"

# 測試連線
echo "🔍 測試資料庫連線..."
if psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;" &> /dev/null; then
    echo "✅ 資料庫連線成功"
else
    echo "❌ 資料庫連線失敗"
    echo "請檢查以下項目:"
    echo "1. PostgreSQL 服務是否正在運行"
    echo "2. 使用者名稱和密碼是否正確"
    echo "3. 資料庫是否存在"
    exit 1
fi

# 安裝 npm 依賴
echo "📦 安裝 npm 依賴..."
npm install

# 初始化資料庫
echo "🗄️ 初始化資料庫..."
npm run db:init

# 建立範例資料
echo "📝 建立範例資料..."
npm run db:sample

# 檢查狀態
echo "🔍 檢查資料庫狀態..."
npm run db:status

echo ""
echo "🎉 資料庫設定完成！"
echo ""
echo "📚 可用的指令:"
echo "  npm run db:test    - 測試資料庫連線"
echo "  npm run db:init    - 初始化資料庫"
echo "  npm run db:sample  - 建立範例資料"
echo "  npm run db:status  - 檢查資料庫狀態"
echo "  npm run db:reset   - 重置資料庫"
echo ""
echo "🌐 管理介面:"
echo "  http://localhost:3000/admin/database"
echo ""
echo "📖 詳細說明請參考: DATABASE_SETUP.md"
