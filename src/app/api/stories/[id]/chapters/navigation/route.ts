import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/stories/[id]/chapters/navigation - 獲取特定故事的章節導航資訊
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;
    const { searchParams } = new URL(request.url);
    const currentChapterNumber = searchParams.get('currentChapter');

    if (!currentChapterNumber) {
      return NextResponse.json(
        { error: '缺少必要參數：currentChapter' },
        { status: 400 }
      );
    }

    // 獲取該故事的所有章節，按章節編號排序
    const chaptersResult = await query(`
      SELECT chapter_id, chapter_number, title
      FROM chapters 
      WHERE story_id = $1 
      ORDER BY chapter_number::integer ASC
    `, [storyId]);

    const chapters = chaptersResult.rows;
    const currentIndex = chapters.findIndex(ch => ch.chapter_number === currentChapterNumber);
    
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: '找不到當前章節' },
        { status: 404 }
      );
    }

    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    return NextResponse.json({
      success: true,
      data: {
        currentChapter: chapters[currentIndex],
        prevChapter,
        nextChapter,
        totalChapters: chapters.length,
        currentIndex: currentIndex + 1
      }
    });

  } catch (error) {
    console.error('獲取章節導航資訊失敗:', error);
    return NextResponse.json(
      {
        success: false,
        message: '獲取章節導航資訊失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
}
