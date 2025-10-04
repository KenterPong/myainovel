/**
 * AI 生成 API 端點
 * POST /api/ai/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiGenerationService } from '@/lib/services/ai-generation';
import { AIGenerationRequest } from '@/types/ai-generation';
import { query, transaction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, chapterId, previousContext, votingResult, storySettings, generationType } = body;
    
    // 確保 chapterId 是整數
    const chapterIdInt = parseInt(chapterId);
    if (isNaN(chapterIdInt)) {
      return NextResponse.json({
        success: false,
        message: '無效的章節 ID'
      }, { status: 400 });
    }

    // 驗證必要參數
    if (!storyId || !chapterId || !votingResult) {
      return NextResponse.json({
        success: false,
        message: '缺少必要參數'
      }, { status: 400 });
    }

    // 檢查章節是否存在
    const chapterResult = await query(`
      SELECT chapter_id, story_id, title, full_text, summary, voting_status
      FROM chapters 
      WHERE chapter_id = $1 AND story_id = $2
    `, [chapterIdInt, storyId]);

    if (chapterResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '章節不存在'
      }, { status: 404 });
    }

    const chapter = chapterResult.rows[0];

    // 檢查投票狀態（允許進行中和已生成狀態）
    if (!['進行中', '已生成'].includes(chapter.voting_status)) {
      return NextResponse.json({
        success: false,
        message: '投票狀態不正確，無法生成新章節'
      }, { status: 400 });
    }

    // 構建 AI 生成請求
    const aiRequest: AIGenerationRequest = {
      storyId,
      chapterId: chapterIdInt,
      previousContext: previousContext || chapter.full_text,
      votingResult,
      storySettings,
      generationType: generationType || 'chapter'
    };

    // 調用 AI 生成服務
    const aiResponse = await aiGenerationService.generateChapter(aiRequest);

    if (!aiResponse.success) {
      return NextResponse.json({
        success: false,
        message: aiResponse.message || 'AI 生成失敗',
        error: aiResponse.error
      }, { status: 500 });
    }

    // 儲存生成的章節到資料庫
    let newChapterId: number;
    try {
      await transaction(async (client) => {
        // 更新當前章節狀態為已生成
        await client.query(`
          UPDATE chapters 
          SET voting_status = '已生成', user_choice = $1
          WHERE chapter_id = $2
        `, [votingResult.optionId, chapterIdInt]);

        // 獲取該故事中最大的章節號碼
        const maxChapterResult = await client.query(`
          SELECT MAX(CAST(REGEXP_REPLACE(chapter_number, '[^0-9]', '', 'g') AS INTEGER)) as max_chapter
          FROM chapters 
          WHERE story_id = $1 AND chapter_number ~ '^[0-9]+$'
        `, [storyId]);
        
        const maxChapter = maxChapterResult.rows[0].max_chapter || 0;
        const nextChapterNumber = String(maxChapter + 1).padStart(3, '0');

        // 建立新章節
        const newChapterResult = await client.query(`
          INSERT INTO chapters (
            story_id, chapter_number, title, full_text, summary, 
            voting_status, voting_deadline, voting_options, tags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING chapter_id
        `, [
          storyId,
          nextChapterNumber,
          aiResponse.data!.title,
          aiResponse.data!.generatedContent,
          aiResponse.data!.summary,
          '進行中',
          new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小時後截止
          JSON.stringify({
            options: aiResponse.data!.nextVotingOptions.map(option => ({
              ...option,
              votes: 0
            })),
            total_votes: 0
          }),
          JSON.stringify(aiResponse.data!.tags)
        ]);

        newChapterId = newChapterResult.rows[0].chapter_id;

        // 記錄生成歷史
        await client.query(`
          INSERT INTO ai_generation_history (
            generation_id, story_id, chapter_id, generation_type,
            input_data, output_data, processing_time, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          aiResponse.data!.generationId,
          storyId,
          chapterIdInt, // 使用當前章節 ID，不是新章節 ID
          generationType || 'chapter',
          JSON.stringify(aiRequest),
          JSON.stringify(aiResponse.data),
          aiResponse.data!.processingTime || 0,
          'completed'
        ]);
      });
    } catch (dbError) {
      console.error('資料庫操作失敗:', dbError);
      return NextResponse.json({
        success: false,
        message: '資料庫操作失敗',
        error: dbError instanceof Error ? dbError.message : '未知資料庫錯誤'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...aiResponse.data,
        newChapterId: newChapterId // 使用實際的新章節 ID
      },
      message: '章節生成成功'
    });

  } catch (error) {
    console.error('AI 生成錯誤:', error);
    return NextResponse.json({
      success: false,
      message: 'AI 生成失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

/**
 * 獲取生成狀態
 * GET /api/ai/generate?generationId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('generationId');

    if (!generationId) {
      return NextResponse.json({
        success: false,
        message: '缺少 generationId 參數'
      }, { status: 400 });
    }

    const status = aiGenerationService.getGenerationStatus(generationId);

    if (!status) {
      return NextResponse.json({
        success: false,
        message: '找不到生成狀態'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('獲取生成狀態錯誤:', error);
    return NextResponse.json({
      success: false,
      message: '獲取生成狀態失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
