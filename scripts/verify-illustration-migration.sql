-- 驗證章節插圖功能資料庫遷移結果
-- 檢查新增的欄位和約束是否正確建立

-- 1. 檢查 chapters 表是否包含插圖相關欄位
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'chapters' 
AND column_name IN (
    'illustration_url', 
    'illustration_prompt', 
    'illustration_style', 
    'illustration_generated_at'
)
ORDER BY column_name;

-- 2. 檢查 story_settings 表的設定類型約束
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE table_name = 'story_settings' 
AND constraint_name = 'chk_story_settings_type';

-- 3. 檢查插圖相關索引是否建立
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'chapters' 
AND indexname LIKE '%illustration%'
ORDER BY indexname;

-- 4. 測試插入插圖風格設定資料
INSERT INTO story_settings (story_id, setting_type, setting_data)
SELECT 
    story_id,
    '插圖風格',
    '{
        "story_genre": "科幻",
        "style_name": "賽博龐克插畫風",
        "style_prompt": "Cyberpunk illustration style, neon colors, dark atmosphere, futuristic cityscape, detailed character design, high contrast lighting, digital art aesthetic",
        "color_palette": ["#00FFFF", "#FF00FF", "#FFFF00", "#000000"],
        "art_style": "Digital illustration with clean lines and vibrant neon colors",
        "mood": "Dark, mysterious, high-tech",
        "character_style": "Anime-inspired character design with cyberpunk elements"
    }'::jsonb
FROM stories 
WHERE story_id NOT IN (
    SELECT story_id 
    FROM story_settings 
    WHERE setting_type = '插圖風格'
)
LIMIT 1;

-- 5. 驗證插圖風格設定插入結果
SELECT 
    s.title as story_title,
    ss.setting_type,
    ss.setting_data->>'story_genre' as genre,
    ss.setting_data->>'style_name' as style_name
FROM stories s
JOIN story_settings ss ON s.story_id = ss.story_id
WHERE ss.setting_type = '插圖風格'
ORDER BY ss.last_updated_at DESC
LIMIT 5;

-- 6. 顯示驗證結果摘要
DO $$
DECLARE
    column_count INTEGER;
    constraint_exists BOOLEAN;
    index_count INTEGER;
    setting_count INTEGER;
BEGIN
    -- 檢查欄位數量
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'chapters' 
    AND column_name IN ('illustration_url', 'illustration_prompt', 'illustration_style', 'illustration_generated_at');
    
    -- 檢查約束是否存在
    SELECT EXISTS(
        SELECT 1 FROM information_schema.check_constraints 
        WHERE table_name = 'story_settings' 
        AND constraint_name = 'chk_story_settings_type'
    ) INTO constraint_exists;
    
    -- 檢查索引數量
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'chapters' 
    AND indexname LIKE '%illustration%';
    
    -- 檢查插圖風格設定數量
    SELECT COUNT(*) INTO setting_count
    FROM story_settings 
    WHERE setting_type = '插圖風格';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '章節插圖功能資料庫遷移驗證結果';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 chapters 表插圖欄位數量: %', column_count;
    RAISE NOTICE '🔗 story_settings 約束更新: %', CASE WHEN constraint_exists THEN '✅ 成功' ELSE '❌ 失敗' END;
    RAISE NOTICE '⚡ 插圖相關索引數量: %', index_count;
    RAISE NOTICE '📝 插圖風格設定數量: %', setting_count;
    
    IF column_count = 4 AND constraint_exists AND index_count >= 3 THEN
        RAISE NOTICE '🎉 所有驗證項目通過！資料庫遷移成功！';
    ELSE
        RAISE NOTICE '⚠️ 部分驗證項目未通過，請檢查遷移腳本';
    END IF;
    RAISE NOTICE '========================================';
END $$;
