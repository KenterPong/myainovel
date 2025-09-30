import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/stories/[id]/chapters - 取得故事的所有章節
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    const { searchParams } = new URL(request.url);
    const voting_status = searchParams.get('voting_status');

    let sql = `
      SELECT 
        c.*,
        s.title as story_title
      FROM chapters c
      JOIN stories s ON c.story_id = s.story_id
      WHERE c.story_id = $1
    `;
    
    const queryParams: any[] = [storyId];
    let paramIndex = 2;

    if (voting_status) {
      sql += ` AND c.voting_status = $${paramIndex}`;
      queryParams.push(voting_status);
      paramIndex++;
    }

    sql += ` ORDER BY c.chapter_number`;

    const result = await query(sql, queryParams);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('取得章節列表錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '取得章節列表失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

/**
 * POST /api/stories/[id]/chapters - 建立新章節
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    const body = await request.json();
    const { 
      title, 
      full_text, 
      summary, 
      tags, 
      voting_options, 
      voting_deadline,
      user_choice,
      previous_summary_context 
    } = body;

    // 驗證必填欄位
    if (!title || !full_text || !summary) {
      return NextResponse.json({ 
        success: false, 
        message: '標題、內容和摘要為必填欄位' 
      }, { status: 400 });
    }

    // 檢查故事是否存在
    const storyCheck = await query('SELECT story_id FROM stories WHERE story_id = $1', [storyId]);
    if (storyCheck.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '故事不存在' 
      }, { status: 404 });
    }

    // 取得下一個章節編號
    const chapterResult = await query(`
      SELECT COALESCE(MAX(CAST(chapter_number AS INTEGER)), 0) + 1 as next_number
      FROM chapters 
      WHERE story_id = $1
    `, [storyId]);
    
    const nextNumber = chapterResult.rows[0].next_number;
    const chapterNumber = nextNumber.toString().padStart(3, '0');

    // 建立新章節
    const result = await query(`
      INSERT INTO chapters (
        story_id, chapter_number, title, full_text, summary, 
        tags, voting_options, voting_deadline, voting_status,
        user_choice, previous_summary_context
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      storyId,
      chapterNumber,
      title,
      full_text,
      summary,
      tags ? JSON.stringify(tags) : null,
      voting_options ? JSON.stringify(voting_options) : null,
      voting_deadline || null,
      voting_options ? '進行中' : '已生成',
      user_choice || null,
      previous_summary_context || null
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '章節建立成功'
    });
  } catch (error) {
    console.error('建立章節錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '建立章節失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
