#!/bin/bash

echo "========================================"
echo "章節插圖功能資料庫完整設定腳本"
echo "========================================"
echo

echo "步驟 1: 執行資料庫遷移..."
psql -U myainovel_user -d myainovel -f scripts/add-illustration-fields.sql

if [ $? -ne 0 ]; then
    echo "❌ 資料庫遷移失敗！"
    echo "請檢查資料庫連線和權限設定"
    exit 1
fi

echo
echo "步驟 2: 驗證遷移結果..."
psql -U myainovel_user -d myainovel -f scripts/verify-illustration-migration.sql

if [ $? -ne 0 ]; then
    echo "❌ 驗證失敗！"
    exit 1
fi

echo
echo "========================================"
echo "✅ 章節插圖功能資料庫設定完成！"
echo "========================================"
echo
echo "📊 已新增欄位："
echo "   - chapters.illustration_url"
echo "   - chapters.illustration_prompt"
echo "   - chapters.illustration_style"
echo "   - chapters.illustration_generated_at"
echo
echo "🔗 已更新約束："
echo "   - story_settings.setting_type 支援「插圖風格」"
echo
echo "⚡ 已建立索引："
echo "   - 插圖相關欄位查詢優化"
echo
echo "📝 插圖風格設定格式已定義"
echo
