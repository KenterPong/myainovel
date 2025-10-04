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

-- 8. 建立故事起源投票相關資料表

-- 8.1 建立 origin_votes 表（故事起源投票記錄表）
CREATE TABLE IF NOT EXISTS origin_votes (
    vote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL,
    voter_ip VARCHAR(45) NOT NULL,
    voter_session VARCHAR(255) NOT NULL,
    outer_choice VARCHAR(50) NOT NULL,
    middle_choice VARCHAR(50) NOT NULL,
    inner_choice VARCHAR(50) NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    
    -- 外鍵約束
    CONSTRAINT fk_origin_votes_story_id 
        FOREIGN KEY (story_id) 
        REFERENCES stories(story_id) 
        ON DELETE CASCADE,
    
    -- 唯一約束：同一 IP 和會話組合在 24 小時內只能投票一次
    CONSTRAINT uk_origin_votes_ip_session_time 
        UNIQUE (voter_ip, voter_session, DATE(voted_at))
);

-- 8.2 建立 origin_vote_totals 表（故事起源投票統計表）
CREATE TABLE IF NOT EXISTS origin_vote_totals (
    total_id SERIAL PRIMARY KEY,
    story_id UUID NOT NULL,
    category VARCHAR(20) NOT NULL,
    option_id VARCHAR(50) NOT NULL,
    vote_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外鍵約束
    CONSTRAINT fk_origin_vote_totals_story_id 
        FOREIGN KEY (story_id) 
        REFERENCES stories(story_id) 
        ON DELETE CASCADE,
    
    -- 唯一約束：每個故事的每個分類的每個選項只能有一條統計記錄
    CONSTRAINT uk_origin_vote_totals_story_category_option 
        UNIQUE (story_id, category, option_id)
);

-- 8.3 建立索引以提升查詢效能
-- origin_votes 表索引
CREATE INDEX IF NOT EXISTS idx_origin_votes_story_id ON origin_votes(story_id);
CREATE INDEX IF NOT EXISTS idx_origin_votes_voter_ip ON origin_votes(voter_ip);
CREATE INDEX IF NOT EXISTS idx_origin_votes_voted_at ON origin_votes(voted_at);
CREATE INDEX IF NOT EXISTS idx_origin_votes_ip_session ON origin_votes(voter_ip, voter_session);

-- origin_vote_totals 表索引
CREATE INDEX IF NOT EXISTS idx_origin_vote_totals_story_id ON origin_vote_totals(story_id);
CREATE INDEX IF NOT EXISTS idx_origin_vote_totals_category ON origin_vote_totals(category);
CREATE INDEX IF NOT EXISTS idx_origin_vote_totals_vote_count ON origin_vote_totals(vote_count);

-- 8.4 建立觸發器函數：自動更新投票統計
CREATE OR REPLACE FUNCTION update_origin_vote_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新 outer 分類統計
    INSERT INTO origin_vote_totals (story_id, category, option_id, vote_count, last_updated)
    VALUES (NEW.story_id, 'outer', NEW.outer_choice, 1, NOW())
    ON CONFLICT (story_id, category, option_id) 
    DO UPDATE SET 
        vote_count = origin_vote_totals.vote_count + 1,
        last_updated = NOW();
    
    -- 更新 middle 分類統計
    INSERT INTO origin_vote_totals (story_id, category, option_id, vote_count, last_updated)
    VALUES (NEW.story_id, 'middle', NEW.middle_choice, 1, NOW())
    ON CONFLICT (story_id, category, option_id) 
    DO UPDATE SET 
        vote_count = origin_vote_totals.vote_count + 1,
        last_updated = NOW();
    
    -- 更新 inner 分類統計
    INSERT INTO origin_vote_totals (story_id, category, option_id, vote_count, last_updated)
    VALUES (NEW.story_id, 'inner', NEW.inner_choice, 1, NOW())
    ON CONFLICT (story_id, category, option_id) 
    DO UPDATE SET 
        vote_count = origin_vote_totals.vote_count + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器
CREATE TRIGGER trigger_update_origin_vote_totals
    AFTER INSERT ON origin_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_origin_vote_totals();

-- 8.5 建立檢查約束
-- 確保分類是有效值
ALTER TABLE origin_vote_totals 
ADD CONSTRAINT chk_origin_vote_totals_category 
CHECK (category IN ('outer', 'middle', 'inner'));

-- 確保投票計數不能為負數
ALTER TABLE origin_vote_totals 
ADD CONSTRAINT chk_origin_vote_totals_vote_count 
CHECK (vote_count >= 0);

-- 9. 建立章節投票相關資料表

-- 9.1 建立 chapter_votes 表（章節投票記錄表）
CREATE TABLE IF NOT EXISTS chapter_votes (
    vote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id INTEGER NOT NULL,
    story_id UUID NOT NULL,
    voter_ip VARCHAR(45) NOT NULL,
    voter_session VARCHAR(255) NOT NULL,
    option_id VARCHAR(10) NOT NULL, -- A, B, C
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    
    -- 外鍵約束
    CONSTRAINT fk_chapter_votes_chapter_id 
        FOREIGN KEY (chapter_id) 
        REFERENCES chapters(chapter_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_chapter_votes_story_id 
        FOREIGN KEY (story_id) 
        REFERENCES stories(story_id) 
        ON DELETE CASCADE,
    
    -- 唯一約束：同一 IP 和會話組合只能對同一章節投票一次
    CONSTRAINT uk_chapter_votes_ip_session_chapter 
        UNIQUE (voter_ip, voter_session, chapter_id)
);

-- 9.2 建立 chapter_vote_totals 表（章節投票統計表）
CREATE TABLE IF NOT EXISTS chapter_vote_totals (
    total_id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL,
    story_id UUID NOT NULL,
    option_id VARCHAR(10) NOT NULL, -- A, B, C
    vote_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外鍵約束
    CONSTRAINT fk_chapter_vote_totals_chapter_id 
        FOREIGN KEY (chapter_id) 
        REFERENCES chapters(chapter_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_chapter_vote_totals_story_id 
        FOREIGN KEY (story_id) 
        REFERENCES stories(story_id) 
        ON DELETE CASCADE,
    
    -- 唯一約束：每個章節的每個選項只能有一條統計記錄
    CONSTRAINT uk_chapter_vote_totals_chapter_option 
        UNIQUE (chapter_id, option_id)
);

-- 9.3 建立索引以提升查詢效能
-- chapter_votes 表索引
CREATE INDEX IF NOT EXISTS idx_chapter_votes_chapter_id ON chapter_votes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_votes_story_id ON chapter_votes(story_id);
CREATE INDEX IF NOT EXISTS idx_chapter_votes_voter_ip ON chapter_votes(voter_ip);
CREATE INDEX IF NOT EXISTS idx_chapter_votes_voted_at ON chapter_votes(voted_at);
CREATE INDEX IF NOT EXISTS idx_chapter_votes_ip_session ON chapter_votes(voter_ip, voter_session);
CREATE INDEX IF NOT EXISTS idx_chapter_votes_option_id ON chapter_votes(option_id);

-- chapter_vote_totals 表索引
CREATE INDEX IF NOT EXISTS idx_chapter_vote_totals_chapter_id ON chapter_vote_totals(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_vote_totals_story_id ON chapter_vote_totals(story_id);
CREATE INDEX IF NOT EXISTS idx_chapter_vote_totals_option_id ON chapter_vote_totals(option_id);
CREATE INDEX IF NOT EXISTS idx_chapter_vote_totals_vote_count ON chapter_vote_totals(vote_count);

-- 9.4 建立觸發器函數：自動更新章節投票統計
CREATE OR REPLACE FUNCTION update_chapter_vote_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新章節投票統計
    INSERT INTO chapter_vote_totals (chapter_id, story_id, option_id, vote_count, last_updated)
    VALUES (NEW.chapter_id, NEW.story_id, NEW.option_id, 1, NOW())
    ON CONFLICT (chapter_id, option_id) 
    DO UPDATE SET 
        vote_count = chapter_vote_totals.vote_count + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器
CREATE TRIGGER trigger_update_chapter_vote_totals
    AFTER INSERT ON chapter_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_chapter_vote_totals();

-- 9.5 建立檢查約束
-- 確保選項 ID 是有效值
ALTER TABLE chapter_votes 
ADD CONSTRAINT chk_chapter_votes_option_id 
CHECK (option_id IN ('A', 'B', 'C'));

ALTER TABLE chapter_vote_totals 
ADD CONSTRAINT chk_chapter_vote_totals_option_id 
CHECK (option_id IN ('A', 'B', 'C'));

-- 確保投票計數不能為負數
ALTER TABLE chapter_vote_totals 
ADD CONSTRAINT chk_chapter_vote_totals_vote_count 
CHECK (vote_count >= 0);

-- 10. 建立 AI 生成歷史記錄表
CREATE TABLE IF NOT EXISTS ai_generation_history (
    id SERIAL PRIMARY KEY,
    generation_id VARCHAR(255) NOT NULL UNIQUE,
    story_id UUID NOT NULL,
    chapter_id INTEGER NOT NULL,
    generation_type VARCHAR(50) NOT NULL DEFAULT 'chapter',
    input_data JSONB,
    output_data JSONB,
    processing_time INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外鍵約束
    CONSTRAINT fk_ai_generation_history_story_id 
        FOREIGN KEY (story_id) 
        REFERENCES stories(story_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_ai_generation_history_chapter_id 
        FOREIGN KEY (chapter_id) 
        REFERENCES chapters(chapter_id) 
        ON DELETE CASCADE,
    
    -- 檢查約束
    CONSTRAINT chk_ai_generation_history_type 
        CHECK (generation_type IN ('chapter', 'continuation', 'branch')),
    
    CONSTRAINT chk_ai_generation_history_status 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    CONSTRAINT chk_ai_generation_history_processing_time 
        CHECK (processing_time >= 0)
);

-- 10.1 建立 AI 生成歷史記錄表索引
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_story_id ON ai_generation_history(story_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_chapter_id ON ai_generation_history(chapter_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_generation_id ON ai_generation_history(generation_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_status ON ai_generation_history(status);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_created_at ON ai_generation_history(created_at);

-- 11. 插入範例資料（可選）
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
    RAISE NOTICE '📊 已建立資料表：stories, chapters, story_settings, origin_votes, origin_vote_totals, chapter_votes, chapter_vote_totals';
    RAISE NOTICE '🔗 已建立外鍵關聯和索引';
    RAISE NOTICE '⚡ 已建立觸發器和約束條件';
    RAISE NOTICE '📝 已插入範例資料';
END $$;
