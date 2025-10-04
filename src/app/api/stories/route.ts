import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/stories - 取得所有故事列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT 
        s.*,
        c.title as current_chapter_title,
        c.chapter_number as current_chapter_number
      FROM stories s
      LEFT JOIN chapters c ON s.current_chapter_id = c.chapter_id
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` WHERE s.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rows.length
      }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('取得故事列表錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '取得故事列表失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

/**
 * POST /api/stories - 建立新故事
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, voting_result } = body;

    if (!title) {
      return NextResponse.json({ 
        success: false, 
        message: '故事標題為必填欄位' 
      }, { status: 400 });
    }

    // 生成故事序號
    const serialResult = await query(`
      SELECT COALESCE(MAX(CAST(SUBSTRING(story_serial, 2) AS INTEGER)), 0) + 1 as next_number
      FROM stories 
      WHERE story_serial LIKE 'A%'
    `);
    
    const nextNumber = serialResult.rows[0].next_number;
    const storySerial = `A${nextNumber.toString().padStart(5, '0')}`;

    // 建立新故事
    const result = await query(`
      INSERT INTO stories (story_serial, title, status, voting_result, origin_voting_start_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [storySerial, title, '投票中', voting_result || null, new Date()]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '故事建立成功'
    });
  } catch (error) {
    console.error('建立故事錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '建立故事失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
