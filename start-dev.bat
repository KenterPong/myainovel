@echo off
REM 設定環境變數並啟動開發伺服器
set DATABASE_URL=postgresql://postgres:1234@localhost:5432/myainovel
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=1234
set POSTGRES_DB=myainovel
set POSTGRES_HOST=localhost
set POSTGRES_PORT=5432
set NEXT_PUBLIC_SITE_URL=http://localhost:3000

echo 🚀 啟動 Next.js 開發伺服器...
echo 📊 資料庫: myainovel
echo 🌐 網址: http://localhost:3000
echo.

npm run dev
