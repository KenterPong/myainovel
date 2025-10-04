#!/usr/bin/env node

/**
 * 最終驗收測試腳本
 * 測試完整的章節投票系統功能
 * 使用方法: node scripts/final-acceptance-test.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function finalAcceptanceTest() {
  console.log('🎯 最終驗收測試 - 章節投票系統');
  console.log('='.repeat(60));
  
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myainovel',
    port: 5432,
    password: '1234',
    ssl: false
  });

  let testResults = {
    database: false,
    api: false,
    voting: false,
    frontend: false,
    integration: false
  };

  try {
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功\n');

    // 測試 1: 資料庫功能
    console.log('📊 測試 1: 資料庫功能');
    console.log('-'.repeat(30));
    
    try {
      // 檢查資料表是否存在
      const tablesCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('stories', 'chapters', 'chapter_votes', 'chapter_vote_totals')
        ORDER BY table_name
      `);
      
      const expectedTables = ['stories', 'chapters', 'chapter_votes', 'chapter_vote_totals'];
      const existingTables = tablesCheck.rows.map(row => row.table_name);
      const allTablesExist = expectedTables.every(table => existingTables.includes(table));
      
      if (allTablesExist) {
        console.log('✅ 所有必要資料表存在');
        testResults.database = true;
      } else {
        console.log('❌ 缺少必要資料表:', expectedTables.filter(t => !existingTables.includes(t)));
      }

      // 檢查觸發器
      const triggerCheck = await client.query(`
        SELECT trigger_name
        FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_chapter_vote_totals'
      `);
      
      if (triggerCheck.rows.length > 0) {
        console.log('✅ 投票統計觸發器存在');
      } else {
        console.log('❌ 投票統計觸發器不存在');
        testResults.database = false;
      }
    } catch (error) {
      console.log('❌ 資料庫功能測試失敗:', error.message);
    }

    // 測試 2: API 端點功能
    console.log('\n🌐 測試 2: API 端點功能');
    console.log('-'.repeat(30));
    
    try {
      // 測試故事列表 API
      const storiesResponse = await fetch('http://localhost:3000/api/stories');
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        if (storiesData.success) {
          console.log('✅ 故事列表 API 正常');
          testResults.api = true;
        } else {
          console.log('❌ 故事列表 API 回應格式錯誤');
        }
      } else {
        console.log('❌ 故事列表 API 失敗:', storiesResponse.status);
      }
    } catch (error) {
      console.log('❌ API 端點測試失敗:', error.message);
    }

    // 測試 3: 投票系統功能
    console.log('\n🗳️ 測試 3: 投票系統功能');
    console.log('-'.repeat(30));
    
    try {
      // 建立測試資料
      const storyId = '550e8400-e29b-41d4-a716-446655440' + String(Date.now()).slice(-3);
      
      // 建立測試故事
      await client.query(`
        INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
        VALUES ($1, $2, $3, $4, NOW())
      `, [storyId, 'T' + String(Date.now()).slice(-5), '驗收測試故事', '投票中']);
      
      // 建立測試章節
      const chapterResult = await client.query(`
        INSERT INTO chapters (story_id, chapter_number, title, full_text, summary, voting_status, voting_deadline, voting_options)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING chapter_id
      `, [
        storyId, '001', '第一章：驗收測試', '這是驗收測試章節的內容...', '這是驗收測試章節的摘要...',
        '進行中', new Date(Date.now() + 24 * 60 * 60 * 1000),
        JSON.stringify({
          options: [
            { id: 'A', content: '選項A：驗收測試選項1', description: '驗收測試選項1的描述' },
            { id: 'B', content: '選項B：驗收測試選項2', description: '驗收測試選項2的描述' },
            { id: 'C', content: '選項C：驗收測試選項3', description: '驗收測試選項3的描述' }
          ],
          total_votes: 0
        })
      ]);
      
      const chapterId = chapterResult.rows[0].chapter_id;

      // 使用固定的會話 ID 進行測試
      const testSessionId = 'test-session-' + Date.now();
      
      // 測試投票 API
      const voteResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': testSessionId
        },
        body: JSON.stringify({
          optionId: 'A',
          voterSession: testSessionId
        })
      });

      if (voteResponse.ok) {
        const voteData = await voteResponse.json();
        if (voteData.success) {
          console.log('✅ 投票提交成功');
          
          // 檢查資料庫記錄
          const votesCheck = await client.query(`
            SELECT COUNT(*) as vote_count
            FROM chapter_votes 
            WHERE chapter_id = $1
          `, [chapterId]);
          
          if (parseInt(votesCheck.rows[0].vote_count) > 0) {
            console.log('✅ 投票記錄已寫入資料庫');
            
            // 檢查投票統計
            const totalsCheck = await client.query(`
              SELECT option_id, vote_count
              FROM chapter_vote_totals 
              WHERE chapter_id = $1
            `, [chapterId]);
            
            if (totalsCheck.rows.length > 0) {
              console.log('✅ 投票統計已更新');
              testResults.voting = true;
            } else {
              console.log('❌ 投票統計未更新');
            }
          } else {
            console.log('❌ 投票記錄未寫入資料庫');
          }
        } else {
          console.log('❌ 投票提交失敗:', voteData.message);
        }
      } else {
        console.log('❌ 投票 API 失敗:', voteResponse.status);
      }

      // 測試重複投票限制（使用相同的會話 ID）
      const duplicateVoteResponse = await fetch(`http://localhost:3000/api/stories/${storyId}/chapters/${chapterId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': testSessionId
        },
        body: JSON.stringify({
          optionId: 'B',
          voterSession: testSessionId // 使用相同的會話 ID
        })
      });

      if (duplicateVoteResponse.status === 429) {
        console.log('✅ 重複投票限制正常');
      } else {
        console.log('❌ 重複投票限制失效');
        testResults.voting = false;
      }

      // 清理測試資料
      await client.query('DELETE FROM chapter_votes WHERE chapter_id = $1', [chapterId]);
      await client.query('DELETE FROM chapter_vote_totals WHERE chapter_id = $1', [chapterId]);
      await client.query('DELETE FROM chapters WHERE chapter_id = $1', [chapterId]);
      await client.query('DELETE FROM stories WHERE story_id = $1', [storyId]);
      
    } catch (error) {
      console.log('❌ 投票系統測試失敗:', error.message);
    }

    // 測試 4: 前端組件功能
    console.log('\n🎨 測試 4: 前端組件功能');
    console.log('-'.repeat(30));
    
    try {
      // 檢查組件檔案是否存在
      const fs = require('fs');
      const path = require('path');
      
      const componentFiles = [
        'src/components/VoteOption.tsx',
        'src/components/ChapterVotingSection.tsx',
        'src/components/StoryCard.tsx',
        'src/components/LoadingState.tsx',
        'src/components/ErrorState.tsx',
        'src/components/EmptyState.tsx'
      ];
      
      const allComponentsExist = componentFiles.every(file => {
        const filePath = path.join(process.cwd(), file);
        return fs.existsSync(filePath);
      });
      
      if (allComponentsExist) {
        console.log('✅ 所有前端組件檔案存在');
        testResults.frontend = true;
      } else {
        console.log('❌ 缺少前端組件檔案');
      }
    } catch (error) {
      console.log('❌ 前端組件測試失敗:', error.message);
    }

    // 測試 5: 整合功能
    console.log('\n🔗 測試 5: 整合功能');
    console.log('-'.repeat(30));
    
    try {
      // 檢查 Hooks 檔案
      const fs = require('fs');
      const path = require('path');
      
      const hookFiles = [
        'src/lib/hooks/useHomeData.ts',
        'src/lib/hooks/useChapterVoting.ts',
        'src/lib/hooks/useVotePolling.ts',
        'src/lib/hooks/useOriginVoting.ts'
      ];
      
      const allHooksExist = hookFiles.every(file => {
        const filePath = path.join(process.cwd(), file);
        return fs.existsSync(filePath);
      });
      
      if (allHooksExist) {
        console.log('✅ 所有自定義 Hooks 存在');
        
        // 檢查型別定義
        const typeFiles = [
          'src/types/voting.ts',
          'src/types/story.ts',
          'src/types/chapter.ts'
        ];
        
        const allTypesExist = typeFiles.every(file => {
          const filePath = path.join(process.cwd(), file);
          return fs.existsSync(filePath);
        });
        
        if (allTypesExist) {
          console.log('✅ 所有型別定義存在');
          testResults.integration = true;
        } else {
          console.log('❌ 缺少型別定義檔案');
        }
      } else {
        console.log('❌ 缺少自定義 Hooks 檔案');
      }
    } catch (error) {
      console.log('❌ 整合功能測試失敗:', error.message);
    }

    client.release();

    // 測試結果總結
    console.log('\n📋 測試結果總結');
    console.log('='.repeat(60));
    
    const testNames = {
      database: '資料庫功能',
      api: 'API 端點功能',
      voting: '投票系統功能',
      frontend: '前端組件功能',
      integration: '整合功能'
    };
    
    Object.entries(testResults).forEach(([key, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${testNames[key]}: ${passed ? '通過' : '失敗'}`);
    });
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`\n📊 測試通過率: ${passedTests}/${totalTests} (${Math.round((passedTests/totalTests)*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 所有測試通過！第三階段前端整合完成！');
      console.log('\n🚀 章節投票系統已成功整合到前端！');
      console.log('\n📝 功能清單:');
      console.log('✅ 資料庫擴展完成');
      console.log('✅ API 端點開發完成');
      console.log('✅ 前端組件建立完成');
      console.log('✅ 投票系統整合完成');
      console.log('✅ 首頁整合完成');
    } else {
      console.log('\n⚠️  部分測試失敗，請檢查相關功能');
    }

    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (error) {
    console.error('❌ 測試執行失敗:', error.message);
    console.error('詳細錯誤:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 檢查是否在開發環境中運行
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️  此腳本僅適用於開發環境');
  process.exit(1);
}

// 執行測試
finalAcceptanceTest().catch(console.error);
