# 章節插圖功能資料庫設定指南

## 📋 概述

本指南說明如何設定章節插圖功能的資料庫結構和環境變數。

## 🚀 快速開始

### Windows 用戶
```bash
# 1. 執行資料庫遷移
scripts\setup-illustration-db.bat

# 2. 檢查完整設定
scripts\check-illustration-setup.bat
```

### Linux/macOS 用戶
```bash
# 1. 執行資料庫遷移
bash scripts/setup-illustration-db.sh

# 2. 檢查完整設定
bash scripts/check-illustration-setup.sh
```

## 📊 資料庫變更

### 新增欄位到 `chapters` 表
- `illustration_url` (TEXT) - 本地儲存的圖片連結
- `illustration_prompt` (TEXT) - 插圖生成提示詞
- `illustration_style` (VARCHAR(100)) - 插圖風格
- `illustration_generated_at` (TIMESTAMP) - 插圖生成時間

### 更新 `story_settings` 表
- 新增 `插圖風格` 作為有效的 `setting_type` 值

### 新增索引
- `idx_chapters_illustration_url` - 插圖 URL 查詢優化
- `idx_chapters_illustration_style` - 插圖風格查詢優化
- `idx_chapters_illustration_generated_at` - 插圖生成時間查詢優化

## 🔧 環境變數設定

在 `.env.local` 檔案中新增以下環境變數：

```env
# AI 插圖生成設定
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_IMAGE_QUALITY=standard
OPENAI_IMAGE_SIZE=1024x1024

# 圖片處理設定
IMAGE_OUTPUT_FORMAT=webp
IMAGE_QUALITY=85
IMAGE_STORAGE_PATH=public/images/stories
```

## 📝 插圖風格設定格式

在 `story_settings` 表中，`setting_type = '插圖風格'` 的 `setting_data` 格式：

```json
{
  "story_genre": "科幻",
  "style_name": "賽博龐克插畫風",
  "style_prompt": "Cyberpunk illustration style, neon colors, dark atmosphere, futuristic cityscape, detailed character design, high contrast lighting, digital art aesthetic",
  "color_palette": ["#00FFFF", "#FF00FF", "#FFFF00", "#000000"],
  "art_style": "Digital illustration with clean lines and vibrant neon colors",
  "mood": "Dark, mysterious, high-tech",
  "character_style": "Anime-inspired character design with cyberpunk elements"
}
```

## 🔍 驗證設定

### 檢查環境變數
```bash
node scripts/check-illustration-env.js
```

### 檢查資料庫結構
```sql
-- 檢查新增的欄位
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chapters' 
AND column_name LIKE 'illustration%';

-- 檢查約束更新
SELECT constraint_name, check_clause
FROM information_schema.check_constraints 
WHERE table_name = 'story_settings' 
AND constraint_name = 'chk_story_settings_type';
```

## 📁 檔案說明

- `add-illustration-fields.sql` - 資料庫遷移腳本
- `verify-illustration-migration.sql` - 遷移驗證腳本
- `check-illustration-env.js` - 環境變數檢查腳本
- `setup-illustration-db.bat/.sh` - 完整設定腳本
- `check-illustration-setup.bat/.sh` - 設定檢查腳本

## ⚠️ 注意事項

1. **備份資料庫**：執行遷移前請先備份資料庫
2. **權限檢查**：確保資料庫用戶有 ALTER TABLE 權限
3. **環境變數**：確保所有必要的環境變數都已設定
4. **測試環境**：建議先在測試環境中執行遷移

## 🐛 故障排除

### 資料庫連線失敗
- 檢查 PostgreSQL 服務是否啟動
- 確認資料庫連線參數正確
- 檢查用戶權限

### 環境變數檢查失敗
- 確認 `.env.local` 檔案存在
- 檢查環境變數格式是否正確
- 確認沒有多餘的空格或特殊字符

### 遷移腳本執行失敗
- 檢查 SQL 語法是否正確
- 確認資料庫版本相容性
- 檢查約束衝突

## 📞 支援

如有問題，請檢查：
1. 資料庫日誌
2. 應用程式日誌
3. 環境變數設定
4. 網路連線狀態
