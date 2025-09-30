@echo off
REM PostgreSQL 資料庫快速設定腳本 (Windows)
REM 使用方法: scripts\setup-db.bat

echo 🚀 開始設定 PostgreSQL 資料庫...

REM 檢查 PostgreSQL 是否安裝
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL 未安裝，請先安裝 PostgreSQL
    echo 下載地址: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL 已安裝

REM 檢查環境變數檔案
if not exist ".env.local" (
    echo 📝 建立環境變數檔案...
    copy env.example .env.local
    echo ⚠️  請編輯 .env.local 檔案，設定正確的資料庫連線資訊
    echo    編輯完成後請重新執行此腳本
    pause
    exit /b 1
)

echo ✅ 環境變數檔案已存在

REM 安裝 npm 依賴
echo 📦 安裝 npm 依賴...
call npm install

REM 測試資料庫連線
echo 🔍 測試資料庫連線...
call npm run db:test
if %errorlevel% neq 0 (
    echo ❌ 資料庫連線失敗
    echo 請檢查以下項目:
    echo 1. PostgreSQL 服務是否正在運行
    echo 2. 使用者名稱和密碼是否正確
    echo 3. 資料庫是否存在
    pause
    exit /b 1
)

REM 初始化資料庫
echo 🗄️ 初始化資料庫...
call npm run db:init

REM 建立範例資料
echo 📝 建立範例資料...
call npm run db:sample

REM 檢查狀態
echo 🔍 檢查資料庫狀態...
call npm run db:status

echo.
echo 🎉 資料庫設定完成！
echo.
echo 📚 可用的指令:
echo   npm run db:test    - 測試資料庫連線
echo   npm run db:init    - 初始化資料庫
echo   npm run db:sample  - 建立範例資料
echo   npm run db:status  - 檢查資料庫狀態
echo   npm run db:reset   - 重置資料庫
echo.
echo 🌐 管理介面:
echo   http://localhost:3000/admin/database
echo.
echo 📖 詳細說明請參考: DATABASE_SETUP.md
pause
