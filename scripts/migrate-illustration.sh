#!/bin/bash

echo "========================================"
echo "章節插圖功能資料庫遷移腳本"
echo "========================================"
echo

echo "正在執行資料庫遷移..."
psql -U myainovel_user -d myainovel -f scripts/add-illustration-fields.sql

if [ $? -eq 0 ]; then
    echo
    echo "✅ 資料庫遷移成功完成！"
    echo "📊 已新增插圖相關欄位到 chapters 表"
    echo "🔗 已更新 story_settings 表支援插圖風格設定"
    echo "⚡ 已建立相關索引以提升查詢效能"
else
    echo
    echo "❌ 資料庫遷移失敗！"
    echo "請檢查資料庫連線和權限設定"
    exit 1
fi

echo
echo "遷移完成！"
