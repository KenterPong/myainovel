-- 完整驗證章節插圖功能資料庫設定
-- 檢查所有必要的欄位、約束和索引

-- 1. 檢查 chapters 表插圖相關欄位
SELECT 
    'chapters 表插圖欄位檢查' as check_type,
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ 通過'
        ELSE '❌ 失敗'
    END as result,
    COUNT(*) as found_count,
    '4' as expected_count
FROM information_schema.columns 
WHERE table_name = 'chapters' 
AND column_name IN (
    'illustration_url', 
    'illustration_prompt', 
    'illustration_style', 
    'illustration_generated_at'
);

-- 2. 檢查 story_settings 表約束更新
SELECT 
    'story_settings 約束檢查' as check_type,
    CASE 
        WHEN check_clause LIKE '%插圖風格%' THEN '✅ 通過'
        ELSE '❌ 失敗'
    END as result,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'chk_story_settings_type';

-- 3. 檢查插圖相關索引
SELECT 
    '插圖索引檢查' as check_type,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ 通過'
        ELSE '❌ 失敗'
    END as result,
    COUNT(*) as found_count,
    '3+' as expected_count
FROM pg_indexes 
WHERE tablename = 'chapters' 
AND indexname LIKE '%illustration%';

-- 4. 顯示所有插圖相關欄位詳細資訊
SELECT 
    'chapters 表插圖欄位詳情' as info_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'chapters' 
AND column_name LIKE 'illustration%'
ORDER BY column_name;

-- 5. 顯示所有插圖相關索引
SELECT 
    '插圖索引詳情' as info_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'chapters' 
AND indexname LIKE '%illustration%'
ORDER BY indexname;

-- 6. 測試插入插圖風格設定
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

-- 7. 驗證插圖風格設定插入結果
SELECT 
    '插圖風格設定測試' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 通過'
        ELSE '❌ 失敗'
    END as result,
    COUNT(*) as found_count
FROM story_settings 
WHERE setting_type = '插圖風格';

-- 8. 顯示最終摘要
DO $$
DECLARE
    column_count INTEGER;
    constraint_updated BOOLEAN;
    index_count INTEGER;
    setting_count INTEGER;
BEGIN
    -- 檢查欄位數量
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'chapters' 
    AND column_name IN ('illustration_url', 'illustration_prompt', 'illustration_style', 'illustration_generated_at');
    
    -- 檢查約束是否更新
    SELECT EXISTS(
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'chk_story_settings_type'
        AND check_clause LIKE '%插圖風格%'
    ) INTO constraint_updated;
    
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
    RAISE NOTICE '章節插圖功能資料庫設定驗證結果';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 chapters 表插圖欄位: %/4', column_count;
    RAISE NOTICE '🔗 story_settings 約束更新: %', CASE WHEN constraint_updated THEN '✅ 成功' ELSE '❌ 失敗' END;
    RAISE NOTICE '⚡ 插圖相關索引: %', index_count;
    RAISE NOTICE '📝 插圖風格設定: %', setting_count;
    
    IF column_count = 4 AND constraint_updated AND index_count >= 3 THEN
        RAISE NOTICE '🎉 所有驗證項目通過！資料庫設定完成！';
        RAISE NOTICE '✅ 可以開始進行章節插圖功能開發';
    ELSE
        RAISE NOTICE '⚠️ 部分驗證項目未通過，請檢查設定';
    END IF;
    RAISE NOTICE '========================================';
END $$;
