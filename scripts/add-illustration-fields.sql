-- 章節插圖功能資料庫遷移腳本
-- 執行日期：2024年
-- 說明：為 chapters 表新增插圖相關欄位，並更新 story_settings 表的設定類型約束

-- 1. 為 chapters 表新增插圖相關欄位
ALTER TABLE chapters 
ADD COLUMN IF NOT EXISTS illustration_url TEXT,
ADD COLUMN IF NOT EXISTS illustration_prompt TEXT,
ADD COLUMN IF NOT EXISTS illustration_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS illustration_generated_at TIMESTAMP WITH TIME ZONE;

-- 2. 為插圖相關欄位添加註解
COMMENT ON COLUMN chapters.illustration_url IS '章節插圖 URL，本地儲存的圖片連結，格式：/images/stories/{story_id}/{chapter_id}.webp';
COMMENT ON COLUMN chapters.illustration_prompt IS '插圖生成提示詞，用於生成插圖的 AI 提示詞';
COMMENT ON COLUMN chapters.illustration_style IS '插圖風格，繼承自故事類型的固定風格';
COMMENT ON COLUMN chapters.illustration_generated_at IS '插圖生成時間，記錄插圖生成完成時間';

-- 3. 更新 story_settings 表的設定類型約束，新增 '插圖風格' 類型
ALTER TABLE story_settings 
DROP CONSTRAINT IF EXISTS chk_story_settings_type;

ALTER TABLE story_settings 
ADD CONSTRAINT chk_story_settings_type 
CHECK (setting_type IN ('角色', '世界觀', '大綱', '插圖風格'));

-- 4. 為插圖相關欄位建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_chapters_illustration_url ON chapters(illustration_url);
CREATE INDEX IF NOT EXISTS idx_chapters_illustration_style ON chapters(illustration_style);
CREATE INDEX IF NOT EXISTS idx_chapters_illustration_generated_at ON chapters(illustration_generated_at);

-- 5. 建立插圖風格設定的範例資料結構說明
-- 在 story_settings 表中，setting_type = '插圖風格' 的 setting_data 格式：
/*
{
  "story_genre": "科幻",
  "style_name": "賽博龐克插畫風",
  "style_prompt": "Cyberpunk illustration style, neon colors, dark atmosphere, futuristic cityscape, detailed character design, high contrast lighting, digital art aesthetic",
  "color_palette": ["#00FFFF", "#FF00FF", "#FFFF00", "#000000"],
  "art_style": "Digital illustration with clean lines and vibrant neon colors",
  "mood": "Dark, mysterious, high-tech",
  "character_style": "Anime-inspired character design with cyberpunk elements"
}
*/

-- 6. 顯示遷移完成訊息
DO $$
BEGIN
    RAISE NOTICE '✅ 章節插圖功能資料庫遷移完成！';
    RAISE NOTICE '📊 已新增欄位：chapters.illustration_url, illustration_prompt, illustration_style, illustration_generated_at';
    RAISE NOTICE '🔗 已更新約束：story_settings.setting_type 新增「插圖風格」類型';
    RAISE NOTICE '⚡ 已建立索引：插圖相關欄位查詢優化';
    RAISE NOTICE '📝 插圖風格設定格式已定義，可開始使用';
END $$;
