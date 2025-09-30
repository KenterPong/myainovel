-- PostgreSQL 資料庫初始化腳本
-- 根據 README.md 中的資料庫設計建立相關資料表

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 建立 stories 資料表（故事主表）
CREATE TABLE IF NOT EXISTS stories (
    story_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_serial VARCHAR(6) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT '投票中',
    voting_result JSONB,
    current_chapter_id INTEGER,
    origin_voting_start_date TIMESTAMP WITH TIME ZONE,
    writing_start_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 建立 chapters 資料表（章節表）
CREATE TABLE IF NOT EXISTS chapters (
    chapter_id SERIAL PRIMARY KEY,
    story_id UUID NOT NULL,
    chapter_number VARCHAR(3) NOT NULL,
    title VARCHAR(255) NOT NULL,
    full_text TEXT NOT NULL,
    summary TEXT NOT NULL,
    tags JSONB,
    voting_options JSONB,
    voting_deadline TIMESTAMP WITH TIME ZONE,
    voting_status VARCHAR(20) DEFAULT '進行中',
    user_choice VARCHAR(255),
    previous_summary_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外鍵約束
    CONSTRAINT fk_chapters_story_id 
        FOREIGN KEY (story_id) 
        REFERENCES stories(story_id) 
        ON DELETE CASCADE,
    
    -- 唯一約束：每個故事內的章節編號必須唯一
    CONSTRAINT uk_chapters_story_chapter 
        UNIQUE (story_id, chapter_number)
);

-- 3. 建立 story_settings 資料表（故事設定檔表）
CREATE TABLE IF NOT EXISTS story_settings (
    setting_id SERIAL PRIMARY KEY,
    story_id UUID NOT NULL,
    setting_type VARCHAR(50) NOT NULL,
    setting_data JSONB NOT NULL,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外鍵約束
    CONSTRAINT fk_story_settings_story_id 
        FOREIGN KEY (story_id) 
        REFERENCES stories(story_id) 
        ON DELETE CASCADE,
    
    -- 唯一約束：每個故事內的設定類型必須唯一
    CONSTRAINT uk_story_settings_story_type 
        UNIQUE (story_id, setting_type)
);

-- 4. 建立索引以提升查詢效能
-- stories 表索引
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_serial ON stories(story_serial);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);

-- chapters 表索引
CREATE INDEX IF NOT EXISTS idx_chapters_story_id ON chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_chapters_voting_status ON chapters(voting_status);
CREATE INDEX IF NOT EXISTS idx_chapters_voting_deadline ON chapters(voting_deadline);
CREATE INDEX IF NOT EXISTS idx_chapters_created_at ON chapters(created_at);

-- story_settings 表索引
CREATE INDEX IF NOT EXISTS idx_story_settings_story_id ON story_settings(story_id);
CREATE INDEX IF NOT EXISTS idx_story_settings_type ON story_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_story_settings_updated_at ON story_settings(last_updated_at);

-- 5. 建立觸發器函數：自動更新 story_settings 的 last_updated_at
CREATE OR REPLACE FUNCTION update_story_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器
CREATE TRIGGER trigger_update_story_settings_updated_at
    BEFORE UPDATE ON story_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_story_settings_updated_at();

-- 6. 建立觸發器函數：自動更新 stories 的 current_chapter_id
CREATE OR REPLACE FUNCTION update_story_current_chapter()
RETURNS TRIGGER AS $$
BEGIN
    -- 當新增章節時，更新故事的最新章節 ID
    UPDATE stories 
    SET current_chapter_id = NEW.chapter_id 
    WHERE story_id = NEW.story_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器
CREATE TRIGGER trigger_update_story_current_chapter
    AFTER INSERT ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_story_current_chapter();

-- 7. 建立檢查約束
-- 確保故事狀態是有效值
ALTER TABLE stories 
ADD CONSTRAINT chk_stories_status 
CHECK (status IN ('投票中', '撰寫中', '已完結'));

-- 確保章節投票狀態是有效值
ALTER TABLE chapters 
ADD CONSTRAINT chk_chapters_voting_status 
CHECK (voting_status IN ('進行中', '已截止', '已生成'));

-- 確保故事設定類型是有效值
ALTER TABLE story_settings 
ADD CONSTRAINT chk_story_settings_type 
CHECK (setting_type IN ('角色', '世界觀', '大綱'));

-- 8. 插入範例資料（可選）
-- 建立一個範例故事
INSERT INTO stories (story_serial, title, status, origin_voting_start_date) 
VALUES ('A00001', '測試故事', '投票中', NOW())
ON CONFLICT (story_serial) DO NOTHING;

-- 建立範例故事設定
INSERT INTO story_settings (story_id, setting_type, setting_data)
SELECT 
    story_id,
    '角色',
    '{
        "name": "叢雲清",
        "archetype": "主角",
        "appearance": "銀色短髮，右眼角有微小疤痕。",
        "personality": "冷靜、聰明、內斂，優先考慮邏輯而非情感。",
        "motto": "「行動勝於空談。」",
        "goal": "尋找失蹤的家族遺物。",
        "status": "健康，擁有基礎駭客能力。"
    }'::jsonb
FROM stories 
WHERE story_serial = 'A00001'
ON CONFLICT (story_id, setting_type) DO NOTHING;

INSERT INTO story_settings (story_id, setting_type, setting_data)
SELECT 
    story_id,
    '世界觀',
    '{
        "era": "近未來 (2077 年)",
        "location": "新東京，一座賽博龐克城市。",
        "technology_level": "高度發達，但貧富差距懸殊，企業控制一切。",
        "magic_rules": "無魔法，僅有先進的生物義肢和 AI 網路。",
        "key_factions": [
            {"name": "宙斯企業", "role": "主要反派"},
            {"name": "黑市網絡", "role": "情報中介"}
        ]
    }'::jsonb
FROM stories 
WHERE story_serial = 'A00001'
ON CONFLICT (story_id, setting_type) DO NOTHING;

-- 顯示建立完成的訊息
DO $$
BEGIN
    RAISE NOTICE '✅ 資料庫初始化完成！';
    RAISE NOTICE '📊 已建立資料表：stories, chapters, story_settings';
    RAISE NOTICE '🔗 已建立外鍵關聯和索引';
    RAISE NOTICE '⚡ 已建立觸發器和約束條件';
    RAISE NOTICE '📝 已插入範例資料';
END $$;
