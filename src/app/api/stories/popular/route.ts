import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { PopularStory, ApiResponse } from '@/types/story';

export async function GET(request: NextRequest) {
  try {
    console.log('開始獲取熱門故事...');
    
    // 查詢所有故事，按創建時間由新到舊排序，並計算每個故事的章節總數
    const query = `
      SELECT 
        s.story_id,
        s.title,
        s.status,
        s.created_at,
        s.created_at as last_updated,
        COALESCE(COUNT(c.chapter_id), 0) as total_chapters
      FROM stories s
      LEFT JOIN chapters c ON s.story_id = c.story_id
      GROUP BY s.story_id, s.title, s.status, s.created_at
      ORDER BY s.created_at DESC
      LIMIT 20
    `;

    console.log('執行 SQL 查詢:', query);
    const result = await db.query(query);
    console.log('查詢結果:', result.rows.length, '筆記錄');
    
    const popularStories: PopularStory[] = result.rows.map((row: any) => ({
      story_id: row.story_id,
      title: row.title,
      status: row.status,
      total_chapters: parseInt(row.total_chapters) || 0,
      created_at: row.created_at,
      last_updated: row.last_updated
    }));

    console.log('處理後的故事資料:', popularStories.length, '筆');

    const response: ApiResponse<PopularStory[]> = {
      success: true,
      data: popularStories
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('獲取熱門故事失敗:', error);
    
    const response: ApiResponse = {
      success: false,
      error: `獲取熱門故事失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
    };

    return NextResponse.json(response, { status: 500 });
  }
}
