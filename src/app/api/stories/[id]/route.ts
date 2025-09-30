import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/stories/[id] - 取得單一故事詳情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;

    // 取得故事基本資訊
    const storyResult = await query(`
      SELECT 
        s.*,
        c.title as current_chapter_title,
        c.chapter_number as current_chapter_number
      FROM stories s
      LEFT JOIN chapters c ON s.current_chapter_id = c.chapter_id
      WHERE s.story_id = $1
    `, [storyId]);

    if (storyResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '故事不存在' 
      }, { status: 404 });
    }

    // 取得故事設定
    const settingsResult = await query(`
      SELECT setting_type, setting_data, last_updated_at
      FROM story_settings
      WHERE story_id = $1
      ORDER BY setting_type
    `, [storyId]);

    // 取得章節列表
    const chaptersResult = await query(`
      SELECT chapter_id, chapter_number, title, summary, voting_status, created_at
      FROM chapters
      WHERE story_id = $1
      ORDER BY chapter_number
    `, [storyId]);

    const story = storyResult.rows[0];
    const settings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_type] = {
        data: row.setting_data,
        last_updated_at: row.last_updated_at
      };
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: {
        ...story,
        settings,
        chapters: chaptersResult.rows
      }
    });
  } catch (error) {
    console.error('取得故事詳情錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '取得故事詳情失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

/**
 * PUT /api/stories/[id] - 更新故事
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    const body = await request.json();
    const { title, status, voting_result } = body;

    // 檢查故事是否存在
    const checkResult = await query('SELECT story_id FROM stories WHERE story_id = $1', [storyId]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '故事不存在' 
      }, { status: 404 });
    }

    // 建立更新欄位
    const updateFields = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      queryParams.push(title);
      paramIndex++;
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (voting_result !== undefined) {
      updateFields.push(`voting_result = $${paramIndex}`);
      queryParams.push(JSON.stringify(voting_result));
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '沒有需要更新的欄位' 
      }, { status: 400 });
    }

    // 加入時間戳記
    if (status === '撰寫中') {
      updateFields.push(`writing_start_date = NOW()`);
    } else if (status === '已完結') {
      updateFields.push(`completion_date = NOW()`);
    }

    queryParams.push(storyId);

    const result = await query(`
      UPDATE stories 
      SET ${updateFields.join(', ')}
      WHERE story_id = $${paramIndex}
      RETURNING *
    `, queryParams);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '故事更新成功'
    });
  } catch (error) {
    console.error('更新故事錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '更新故事失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/stories/[id] - 刪除故事
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;

    // 檢查故事是否存在
    const checkResult = await query('SELECT story_id FROM stories WHERE story_id = $1', [storyId]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '故事不存在' 
      }, { status: 404 });
    }

    // 刪除故事（會自動刪除相關的章節和設定）
    await query('DELETE FROM stories WHERE story_id = $1', [storyId]);

    return NextResponse.json({
      success: true,
      message: '故事刪除成功'
    });
  } catch (error) {
    console.error('刪除故事錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '刪除故事失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
