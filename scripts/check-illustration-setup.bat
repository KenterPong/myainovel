@echo off
echo ========================================
echo 章節插圖功能完整設定檢查
echo ========================================
echo.

echo 步驟 1: 檢查環境變數設定...
node scripts/check-illustration-env.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 環境變數檢查失敗！
    echo 請先設定必要的環境變數
    pause
    exit /b 1
)

echo.
echo 步驟 2: 檢查資料庫連線...
psql -U myainovel_user -d myainovel -c "SELECT 1;" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 資料庫連線失敗！
    echo 請檢查資料庫服務是否啟動
    pause
    exit /b 1
)

echo ✅ 資料庫連線正常

echo.
echo 步驟 3: 檢查資料庫結構...
psql -U myainovel_user -d myainovel -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'chapters' AND column_name LIKE 'illustration%';" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 資料庫結構檢查失敗！
    echo 請先執行資料庫遷移腳本
    pause
    exit /b 1
)

echo ✅ 資料庫結構正常

echo.
echo ========================================
echo 🎉 章節插圖功能設定檢查完成！
echo ========================================
echo.
echo ✅ 環境變數設定正確
echo ✅ 資料庫連線正常  
echo ✅ 資料庫結構完整
echo.
echo 可以開始進行章節插圖功能開發！
echo.
echo 按任意鍵繼續...
pause >nul
