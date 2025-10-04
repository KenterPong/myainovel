/**
 * AI 生成歷史管理 API
 * GET /api/admin/ai-generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 構建查詢條件
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (storyId) {
      whereConditions.push(`story_id = $${paramIndex}`);
      queryParams.push(storyId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查詢 AI 生成歷史
    const result = await query(`
      SELECT 
        generation_id,
        story_id,
        chapter_id,
        generation_type,
        input_data,
        output_data,
        processing_time,
        status,
        created_at,
        updated_at
      FROM ai_generation_history
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);

    // 獲取總數
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM ai_generation_history
      ${whereClause}
    `, queryParams);

    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('獲取 AI 生成歷史失敗:', error);
    return NextResponse.json({
      success: false,
      message: '獲取 AI 生成歷史失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
