import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { randomUUID } from 'crypto';
import { IllustrationService } from '@/lib/services/IllustrationService';

// OpenAI API 設定
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 生成章節的提示詞（不帶入讀者選擇）
function generateChapterPrompt(storyTitle: string, previousChapter: any, chapterNumber: string) {
  return `請根據以下資訊生成小說章節：

故事標題：${storyTitle}
章節編號：第 ${chapterNumber} 章
上一章節內容：${previousChapter?.full_text || '這是故事的第一章'}
上一章節摘要：${previousChapter?.summary || '故事開始'}

請根據故事的自然發展邏輯生成一個完整的章節，包含：
1. 章節標題
2. 章節內容（至少 500 字）
3. 章節摘要（100-150 字）
4. 三個投票選項供讀者選擇下一章節的發展方向

請以 JSON 格式回傳：
{
  "title": "章節標題",
  "content": "章節完整內容...",
  "summary": "章節摘要...",
  "voting_options": [
    {
      "id": "A",
      "content": "選項 A 的內容描述",
      "description": "選項 A 的詳細說明"
    },
    {
      "id": "B", 
      "content": "選項 B 的內容描述",
      "description": "選項 B 的詳細說明"
    },
    {
      "id": "C",
      "content": "選項 C 的內容描述", 
      "description": "選項 C 的詳細說明"
    }
  ]
}`;
}

// 呼叫 OpenAI API
async function callOpenAI(prompt: string) {
  const requestData = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '你是一位專業的小說作家，擅長創作引人入勝的章節內容。請確保回傳的JSON格式正確且完整。'
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

  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    throw new Error(`JSON 解析失敗: ${error}`);
  }
}

// 生成章節流水序號
async function generateChapterNumber(storyId: string): Promise<string> {
  const result = await query(`
    SELECT chapter_number 
    FROM chapters 
    WHERE story_id = $1 
    ORDER BY chapter_number::integer DESC 
    LIMIT 1
  `, [storyId]);
  
  if (result.rows.length === 0) {
    return '002'; // 第一個章節是 001，新章節是 002
  }
  
  const lastChapterNumber = result.rows[0].chapter_number;
  const number = parseInt(lastChapterNumber) + 1;
  return number.toString().padStart(3, '0');
}

// 儲存章節到資料庫
async function saveChapterToDatabase(storyId: string, chapterData: any, chapterNumber: string) {
  const now = new Date().toISOString();
  const votingDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24小時後

  return await transaction(async (client) => {
    // 獲取下一個章節 ID
    const chapterIdResult = await client.query(`
      SELECT COALESCE(MAX(chapter_id), 0) + 1 as next_id
      FROM chapters
    `);
    
    const newChapterId = chapterIdResult.rows[0].next_id;

    // 建立章節記錄
    await client.query(`
      INSERT INTO chapters (
        chapter_id, story_id, chapter_number, title, full_text, summary, 
        tags, voting_options, voting_deadline, voting_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      newChapterId,
      storyId,
      chapterNumber,
      chapterData.title,
      chapterData.content,
      chapterData.summary,
      JSON.stringify(['AI生成', '章節']),
      JSON.stringify(chapterData.voting_options),
      votingDeadline,
      '投票中',
      now
    ]);

    return newChapterId;
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;

    console.log('📝 收到章節生成請求:', { storyId });

    // 獲取故事資訊
    const storyResult = await query(`
      SELECT title FROM stories WHERE story_id = $1
    `, [storyId]);

    if (storyResult.rows.length === 0) {
      return NextResponse.json(
        { error: '故事不存在' },
        { status: 404 }
      );
    }

    const storyTitle = storyResult.rows[0].title;

    // 獲取上一章節資訊
    const previousChapterResult = await query(`
      SELECT chapter_number, title, full_text, summary
      FROM chapters 
      WHERE story_id = $1 
      ORDER BY chapter_number DESC 
      LIMIT 1
    `, [storyId]);

    const previousChapter = previousChapterResult.rows[0] || null;
    const chapterNumber = await generateChapterNumber(storyId);

    // 生成提示詞（不帶入讀者選擇）
    const prompt = generateChapterPrompt(storyTitle, previousChapter, chapterNumber);

    // 暫時使用模擬數據，跳過 OpenAI API 呼叫
    console.log('🤖 使用模擬數據（跳過 OpenAI API）...');
    const chapterData = {
      title: `第${chapterNumber}章：故事發展`,
      content: `故事繼續發展，主角面臨新的挑戰和機遇，在${storyTitle}的世界中展開新的冒險。情節自然推進，為讀者帶來更多驚喜和期待。

隨著情節的推進，角色們的關係也發生了微妙的變化。新的盟友出現，舊的敵人可能轉變，而主角必須在這些複雜的關係中做出明智的選擇。

環境的變化也為故事增添了新的色彩。從${previousChapter?.title || '故事開始'}到現在，世界變得更加豐富多彩，充滿了無限的可能性。

讀者們，你們的選擇正在塑造這個故事！接下來會發生什麼，完全取決於你們的決定。`,
      summary: `故事進入新的發展階段。主角面臨新挑戰，關係發生變化，世界變得更加豐富。`,
      voting_options: [
        {
          id: "A",
          content: "勇敢面對新的挑戰",
          description: "主角選擇正面迎擊困難，展現勇氣和決心"
        },
        {
          id: "B", 
          content: "尋求盟友的幫助",
          description: "主角決定尋找可靠的夥伴，共同面對困境"
        },
        {
          id: "C",
          content: "暫時撤退重新規劃",
          description: "主角選擇戰略性撤退，重新評估情況"
        }
      ]
    };

    console.log('✅ 模擬數據生成成功');

    // 儲存章節到資料庫
    const newChapterId = await saveChapterToDatabase(storyId, chapterData, chapterNumber);
    console.log('✅ 章節儲存成功，章節ID:', newChapterId);

    // 異步生成章節插圖
    let illustrationResult = null;
    try {
      console.log('🎨 開始生成章節插圖...');
      const illustrationService = new IllustrationService();
      
      // 獲取故事類型（從故事設定中獲取，預設為都市）
      const storyGenreResult = await query(`
        SELECT setting_data->>'story_genre' as genre
        FROM story_settings 
        WHERE story_id = $1 AND setting_type = '插圖風格'
        LIMIT 1
      `, [storyId]);
      
      const storyGenre = storyGenreResult.rows[0]?.genre || '都市';
      
      illustrationResult = await illustrationService.generateIllustration({
        chapterId: newChapterId,
        storyId,
        chapterTitle: chapterData.title,
        chapterContent: chapterData.content,
        storyGenre
      });
      
      if (illustrationResult.success) {
        console.log('✅ 章節插圖生成成功:', illustrationResult.illustrationUrl);
      } else {
        console.log('⚠️ 章節插圖生成失敗:', illustrationResult.error);
      }
    } catch (illustrationError) {
      console.error('❌ 插圖生成過程發生錯誤:', illustrationError);
      // 插圖生成失敗不影響章節生成的成功回應
    }

    return NextResponse.json({
      success: true,
      chapterId: newChapterId,
      chapterNumber,
      chapterData,
      illustration: illustrationResult?.success ? {
        url: illustrationResult.illustrationUrl,
        style: illustrationResult.illustrationStyle,
        generatedAt: illustrationResult.generatedAt
      } : null,
      message: '章節生成成功' + (illustrationResult?.success ? '，插圖已生成' : '，插圖生成失敗')
    });

  } catch (error) {
    console.error('❌ 章節生成錯誤:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '章節生成失敗', 
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
}
