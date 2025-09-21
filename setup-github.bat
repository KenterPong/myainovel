@echo off
echo 🚀 正在設定 GitHub 儲存庫...

REM 設定變數
set REPO_NAME=nextjs-template
set GITHUB_USERNAME=KenterPong

REM 初始化 Git
git init

REM 加入所有檔案
git add .

REM 建立初始提交
git commit -m "Initial commit: Next.js 企業級樣板"

REM 設定主要分支
git branch -M main

REM 加入遠端儲存庫
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

REM 推送到 GitHub
git push -u origin main

echo ✅ 樣板已成功上傳到 GitHub！
echo 🔗 儲存庫網址: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
echo 📝 接下來您可以：
echo 1. 前往 GitHub 設定儲存庫為 Template Repository
echo 2. 使用 'Use this template' 按鈕建立新專案

pause
