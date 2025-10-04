#!/usr/bin/env node

/**
 * 資料庫狀態詳細報告腳本
 * 使用方法: node scripts/db-status-report.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function generateDatabaseStatusReport() {
  console.log('📊 資料庫狀態詳細報告');
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

    // 1. 檢查所有資料表
    console.log('📋 資料表清單:');
    const tablesResult = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tablesResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name} (${row.table_type})`);
    });

    // 2. 檢查各資料表的記錄數量
    console.log('\n📈 資料表記錄統計:');
    const tableNames = ['stories', 'chapters', 'story_settings', 'origin_votes', 'origin_vote_totals', 'chapter_votes', 'chapter_vote_totals'];
    
    for (const tableName of tableNames) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  ${tableName}: ${countResult.rows[0].count} 筆記錄`);
      } catch (error) {
        console.log(`  ${tableName}: 資料表不存在或無法存取`);
      }
    }

    // 3. 檢查外鍵約束
    console.log('\n🔗 外鍵約束:');
    const foreignKeysResult = await client.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    foreignKeysResult.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
    });

    // 4. 檢查觸發器
    console.log('\n⚡ 觸發器:');
    const triggersResult = await client.query(`
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);
    
    triggersResult.rows.forEach(row => {
      console.log(`  ${row.trigger_name} (${row.event_object_table} - ${row.action_timing} ${row.event_manipulation})`);
    });

    // 5. 檢查索引
    console.log('\n📇 索引統計:');
    const indexesResult = await client.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    const indexGroups = {};
    indexesResult.rows.forEach(row => {
      if (!indexGroups[row.tablename]) {
        indexGroups[row.tablename] = [];
      }
      indexGroups[row.tablename].push(row.indexname);
    });
    
    Object.keys(indexGroups).forEach(tableName => {
      console.log(`  ${tableName}: ${indexGroups[tableName].length} 個索引`);
      indexGroups[tableName].forEach(indexName => {
        console.log(`    - ${indexName}`);
      });
    });

    // 6. 檢查約束條件
    console.log('\n🔒 約束條件:');
    const constraintsResult = await client.query(`
      SELECT 
        table_name,
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public'
      AND constraint_type IN ('CHECK', 'UNIQUE', 'PRIMARY KEY')
      ORDER BY table_name, constraint_type, constraint_name
    `);
    
    const constraintGroups = {};
    constraintsResult.rows.forEach(row => {
      if (!constraintGroups[row.table_name]) {
        constraintGroups[row.table_name] = {};
      }
      if (!constraintGroups[row.table_name][row.constraint_type]) {
        constraintGroups[row.table_name][row.constraint_type] = [];
      }
      constraintGroups[row.table_name][row.constraint_type].push(row.constraint_name);
    });
    
    Object.keys(constraintGroups).forEach(tableName => {
      console.log(`  ${tableName}:`);
      Object.keys(constraintGroups[tableName]).forEach(constraintType => {
        console.log(`    ${constraintType}: ${constraintGroups[tableName][constraintType].length} 個`);
      });
    });

    client.release();
    console.log('\n✅ 資料庫狀態報告完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 生成資料庫狀態報告失敗:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行報告生成
generateDatabaseStatusReport().catch(console.error);
