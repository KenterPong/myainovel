#!/usr/bin/env node

/**
 * 添加 AI 生成歷史表腳本
 * 使用方法: node scripts/add-ai-generation-table.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function addAIGenerationTable() {
  console.log('🤖 添加 AI 生成歷史表...');
  console.log('='.repeat(50));
  
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myainovel',
    port: 5432,
    password: '1234',
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功\n');

    // 建立 AI 生成歷史記錄表
    console.log('📝 建立 AI 生成歷史記錄表...');
    await client.query(`
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
      )
    `);
    console.log('✅ AI 生成歷史記錄表建立成功');

    // 建立索引
    console.log('📊 建立索引...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_generation_history_story_id 
      ON ai_generation_history(story_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_generation_history_chapter_id 
      ON ai_generation_history(chapter_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_generation_history_generation_id 
      ON ai_generation_history(generation_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_generation_history_status 
      ON ai_generation_history(status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_generation_history_created_at 
      ON ai_generation_history(created_at)
    `);
    console.log('✅ 索引建立成功');

    // 驗證表是否建立成功
    console.log('🔍 驗證表建立...');
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'ai_generation_history'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ AI 生成歷史記錄表驗證成功');
    } else {
      console.log('❌ AI 生成歷史記錄表驗證失敗');
    }

    client.release();
    console.log('\n🎉 AI 生成歷史記錄表添加完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 添加表失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行添加表
addAIGenerationTable().catch(console.error);
