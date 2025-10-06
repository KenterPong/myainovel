@echo off
echo ========================================
echo 章節插圖功能完整測試
echo ========================================
echo.

echo 步驟 1: 檢查環境變數...
node scripts/check-illustration-env.js

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 環境變數檢查失敗！
    pause
    exit /b 1
)

echo.
echo 步驟 2: 檢查資料庫連線...
$env:PGPASSWORD="1234"; psql -U postgres -d myainovel -c "SELECT 1;" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 資料庫連線失敗！
    pause
    exit /b 1
)

echo ✅ 資料庫連線正常

echo.
echo 步驟 3: 檢查插圖欄位...
$env:PGPASSWORD="1234"; psql -U postgres -d myainovel -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'chapters' AND column_name LIKE 'illustration%';" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 插圖欄位檢查失敗！
    pause
    exit /b 1
)

echo ✅ 插圖欄位存在

echo.
echo 步驟 4: 啟動開發伺服器（背景）...
start /B npm run dev

echo 等待伺服器啟動...
timeout /t 10 /nobreak >nul

echo.
echo 步驟 5: 執行插圖生成測試...
node scripts/test-illustration-generation.js

echo.
echo ========================================
echo 測試完成！
echo ========================================
echo.
echo 如果看到插圖生成成功的訊息，表示功能正常運作。
echo 可以檢查 public/images/stories/ 目錄查看生成的插圖。
echo.
echo 按任意鍵繼續...
pause >nul
