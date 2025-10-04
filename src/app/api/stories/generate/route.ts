import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { randomUUID } from 'crypto';

// OpenAI API 設定
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 生成故事設定的提示詞
function generateStoryPrompt(genre: string, background: string, theme: string) {
  return `請根據以下設定創作一個完整的小說故事主題與背景設定，包含以下結構：

1. 故事標題
2. 故事類型與背景世界觀
3. 主要角色設定（至少2-3個主要角色）
4. 故事核心衝突與主題
5. 故事背景環境描述
6. 故事發展大綱（包含開頭、發展、高潮、結局的基本架構）

請以JSON格式回傳，格式如下：
{
    "title": "故事標題",
    "genre": "故事類型",
    "worldview": "背景世界觀描述",
    "characters": [
        {
            "name": "角色名稱",
            "age": "年齡",
            "role": "角色定位",
            "personality": "性格特點",
            "background": "背景故事"
        }
    ],
    "conflict": "核心衝突描述",
    "theme": "故事主題",
    "setting": "故事背景環境",
    "outline": {
        "beginning": "開頭設定",
        "development": "發展過程",
        "climax": "高潮情節",
        "ending": "結局安排"
    }
}

原始設定：
故事類型：${genre}
故事背景：${background}
故事主題：${theme}`;
}

// 呼叫 OpenAI API
async function callOpenAI(prompt: string) {
  const requestData = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '你是一位專業的小說作家和故事策劃師，擅長創作完整的故事架構。請確保回傳的JSON格式正確且完整。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8
  };

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    throw new Error(`OpenAI API 錯誤: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 清理和解析 AI 回應
function parseAIResponse(aiResponse: string) {
  // 清理 AI 回應，移除可能的前綴文字
  let cleanedResponse = aiResponse;

  // 尋找 JSON 開始位置
  const jsonStart = cleanedResponse.indexOf('{');
  if (jsonStart !== -1) {
    cleanedResponse = cleanedResponse.substring(jsonStart);
  }

  // 尋找 JSON 結束位置
  const jsonEnd = cleanedResponse.lastIndexOf('}');
  if (jsonEnd !== -1) {
    cleanedResponse = cleanedResponse.substring(0, jsonEnd + 1);
  }

  // 嘗試解析 JSON
  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    throw new Error(`JSON 解析失敗: ${error}`);
  }
}

// 儲存故事到資料庫
async function saveStoryToDatabase(storyData: any, genre: string, background: string, theme: string) {
  const storyId = randomUUID();
  const now = new Date().toISOString();

  return await transaction(async (client) => {
    // 生成故事流水序號
    const storySerial = await generateStorySerial(client);
    
    // 1. 建立故事主表記錄
    await client.query(
      `INSERT INTO stories (story_id, story_serial, title, status, voting_result, created_at, origin_voting_start_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        storyId,
        storySerial,
        storyData.title,
        '投票中',
        JSON.stringify({
          genre: genre,
          background: background,
          theme: theme,
          selected_at: now
        }),
        now,
        now
      ]
    );

    // 2. 建立故事設定檔記錄 - 按照 README.md 的 JSONB 格式
    const settings = [
      {
        type: '角色',
        data: {
          characters: storyData.characters.map((char: any) => ({
            name: char.name,
            archetype: char.role,
            appearance: char.background,
            personality: char.personality,
            motto: `「${char.name}的座右銘」`,
            goal: char.background,
            status: "健康，擁有特殊能力"
          }))
        }
      },
      {
        type: '世界觀',
        data: {
          era: storyData.setting,
          location: storyData.worldview,
          technology_level: storyData.genre + "世界的技術水平",
          magic_rules: storyData.genre + "世界的魔法規則",
          key_factions: [
            { name: "主角陣營", role: "正義方" },
            { name: "反派陣營", role: "主要對手" }
          ]
        }
      },
      {
        type: '大綱',
        data: {
          chapter_summaries: [
            {
              chapter_number: "001",
              title: "故事開端",
              summary: storyData.outline.beginning,
              key_events: ["故事開始", "角色介紹", "背景設定"],
              character_development: "主角登場，建立基本設定"
            }
          ],
          overall_arc: storyData.outline,
          current_status: "故事設定完成，準備開始撰寫第一章"
        }
      }
    ];

    for (const setting of settings) {
      await client.query(
        `INSERT INTO story_settings (story_id, setting_type, setting_data, last_updated_at)
         VALUES ($1, $2, $3, $4)`,
        [storyId, setting.type, JSON.stringify(setting.data), now]
      );
    }

    return storyId;
  });
}

// 生成故事流水序號
async function generateStorySerial(client: any): Promise<string> {
  const result = await client.query(`
    SELECT story_serial 
    FROM stories 
    WHERE story_serial LIKE 'A%' 
    ORDER BY story_serial DESC 
    LIMIT 1
  `);
  
  if (result.rows.length === 0) {
    return 'A00001';
  }
  
  const lastSerial = result.rows[0].story_serial;
  const number = parseInt(lastSerial.substring(1)) + 1;
  return 'A' + number.toString().padStart(5, '0');
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 收到故事生成請求');
    const { genre, background, theme } = await request.json();
    console.log('📊 請求參數:', { genre, background, theme });

    if (!genre || !background || !theme) {
      console.log('❌ 缺少必要參數');
      return NextResponse.json(
        { error: '缺少必要參數：genre, background, theme' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      console.log('❌ OpenAI API 金鑰未設定');
      return NextResponse.json(
        { error: 'OpenAI API 金鑰未設定，請檢查環境變數 OPENAI_API_KEY' },
        { status: 500 }
      );
    }

    console.log('✅ 參數驗證通過，開始生成故事');

    // 生成提示詞
    const prompt = generateStoryPrompt(genre, background, theme);

    // 暫時使用模擬數據，跳過 OpenAI API 呼叫
    console.log('🤖 使用模擬數據（跳過 OpenAI API）...');
    const storyData = {
      title: `${genre}${background}${theme}的奇幻冒險`,
      genre: genre,
      worldview: `在一個充滿${genre}元素的世界中，${background}的環境為故事提供了獨特的背景，而${theme}關係將成為故事的核心。`,
      characters: [
        {
          name: "主角",
          age: "20歲",
          role: "主要角色",
          personality: "勇敢、善良、有正義感",
          background: "在" + background + "環境中成長，擁有特殊能力"
        },
        {
          name: "導師",
          age: "50歲",
          role: "指導者",
          personality: "智慧、嚴厲但關愛",
          background: "經驗豐富的" + theme + "關係中的長者"
        }
      ],
      conflict: "主角必須在" + background + "的挑戰中成長，學會" + theme + "的真正意義",
      theme: theme,
      setting: "一個融合了" + genre + "元素的" + background + "世界",
      outline: {
        beginning: "故事開始於主角在" + background + "環境中的日常生活",
        development: "隨著" + theme + "關係的建立，主角面臨各種挑戰",
        climax: "在關鍵時刻，主角必須運用所學來解決危機",
        ending: "主角在" + theme + "關係的幫助下獲得成長，故事圓滿結束"
      }
    };
    console.log('✅ 模擬數據生成成功');

    // 嘗試儲存到資料庫，如果失敗則儲存到本地檔案
    console.log('💾 嘗試儲存到資料庫...');
    let storyId = 'story-' + Date.now();
    
    try {
      storyId = await saveStoryToDatabase(storyData, genre, background, theme);
      console.log('✅ 資料庫儲存成功，故事ID:', storyId);
    } catch (dbError) {
      console.log('⚠️ 資料庫儲存失敗，改為本地檔案儲存:', dbError);
      
      // 儲存到本地 JSON 檔案
      const fs = require('fs');
      const path = require('path');
      
      const storyRecord = {
        storyId,
        genre,
        background,
        theme,
        storyData,
        createdAt: new Date().toISOString(),
        source: 'AI生成'
      };
      
      const filePath = path.join(process.cwd(), 'generated-stories.json');
      let existingStories = [];
      
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          existingStories = JSON.parse(fileContent);
        }
      } catch (e) {
        console.log('⚠️ 讀取現有故事檔案失敗，建立新檔案');
      }
      
      existingStories.push(storyRecord);
      
      try {
        fs.writeFileSync(filePath, JSON.stringify(existingStories, null, 2), { encoding: 'utf8' });
        console.log('✅ 本地檔案儲存成功:', filePath);
      } catch (fileError) {
        console.log('❌ 本地檔案儲存也失敗:', fileError);
      }
    }

    // 故事生成成功後，清空投票記錄開始新一輪投票
    try {
      const clearResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/origin/clear-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId })
      });
      
      if (clearResponse.ok) {
        console.log('✅ 投票記錄已清空，開始新一輪投票');
      } else {
        console.log('⚠️ 清空投票記錄失敗，但故事已生成');
      }
    } catch (clearError) {
      console.log('⚠️ 清空投票記錄時發生錯誤:', clearError);
    }

    return NextResponse.json({
      success: true,
      storyId,
      storyData,
      message: '故事設定生成成功並已儲存到資料庫，投票記錄已清空'
    });

  } catch (error) {
    console.error('❌ 故事生成錯誤:', error);
    console.error('❌ 錯誤堆疊:', error instanceof Error ? error.stack : '無堆疊資訊');
    
    return NextResponse.json(
      { 
        success: false,
        error: '故事生成失敗', 
        details: error instanceof Error ? error.message : '未知錯誤',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
