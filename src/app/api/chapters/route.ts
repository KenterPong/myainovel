import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/chapters - 獲取所有章節，按生成時間由新到舊排序
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId'); // 可選的故事篩選

    let sql = `
      SELECT 
        c.*,
        s.title as story_title,
        s.story_id,
        s.status as story_status,
        s.created_at as story_created_at,
        s.voting_result
      FROM chapters c
      JOIN stories s ON c.story_id = s.story_id
    `;

    const params: any[] = [];

    // 如果指定了故事ID，則篩選該故事的章節
    if (storyId) {
      sql += ` WHERE c.story_id = $1`;
      params.push(storyId);
    }

    // 按章節生成時間由新到舊排序
    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('獲取章節列表失敗:', error);
    return NextResponse.json(
      {
        success: false,
        message: '獲取章節列表失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
}
