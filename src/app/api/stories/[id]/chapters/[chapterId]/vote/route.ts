import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/stories/[id]/chapters/[chapterId]/vote - 投票
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const storyId = params.id;
    const chapterId = params.chapterId;
    const body = await request.json();
    const { option_id } = body;

    if (!option_id) {
      return NextResponse.json({ 
        success: false, 
        message: '請選擇投票選項' 
      }, { status: 400 });
    }

    // 檢查章節是否存在且投票進行中
    const chapterResult = await query(`
      SELECT voting_options, voting_status, voting_deadline
      FROM chapters 
      WHERE chapter_id = $1 AND story_id = $2
    `, [chapterId, storyId]);

    if (chapterResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '章節不存在' 
      }, { status: 404 });
    }

    const chapter = chapterResult.rows[0];

    if (chapter.voting_status !== '進行中') {
      return NextResponse.json({ 
        success: false, 
        message: '投票已結束' 
      }, { status: 400 });
    }

    // 檢查投票是否已截止
    if (chapter.voting_deadline && new Date() > new Date(chapter.voting_deadline)) {
      return NextResponse.json({ 
        success: false, 
        message: '投票時間已截止' 
      }, { status: 400 });
    }

    // 更新投票選項
    const votingOptions = chapter.voting_options;
    if (!votingOptions || !votingOptions.options) {
      return NextResponse.json({ 
        success: false, 
        message: '投票選項不存在' 
      }, { status: 400 });
    }

    // 找到對應的選項並增加票數
    const updatedOptions = {
      ...votingOptions,
      options: votingOptions.options.map((option: any) => {
        if (option.id === option_id) {
          return { ...option, votes: (option.votes || 0) + 1 };
        }
        return option;
      }),
      total_votes: (votingOptions.total_votes || 0) + 1
    };

    // 檢查是否達到自動生成條件
    const maxVotes = Math.max(...updatedOptions.options.map((opt: any) => opt.votes));
    const totalVotes = updatedOptions.total_votes;
    const shouldAutoGenerate = maxVotes >= 100 || (totalVotes >= 100 && chapter.voting_deadline && new Date() >= new Date(chapter.voting_deadline));

    // 更新章節投票資料
    await query(`
      UPDATE chapters 
      SET 
        voting_options = $1,
        voting_status = $2
      WHERE chapter_id = $3
    `, [
      JSON.stringify(updatedOptions),
      shouldAutoGenerate ? '已生成' : '進行中',
      chapterId
    ]);

    return NextResponse.json({
      success: true,
      data: {
        voting_options: updatedOptions,
        should_auto_generate: shouldAutoGenerate
      },
      message: '投票成功'
    });
  } catch (error) {
    console.error('投票錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '投票失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

/**
 * GET /api/stories/[id]/chapters/[chapterId]/vote - 取得投票狀態
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const storyId = params.id;
    const chapterId = params.chapterId;

    const result = await query(`
      SELECT voting_options, voting_status, voting_deadline
      FROM chapters 
      WHERE chapter_id = $1 AND story_id = $2
    `, [chapterId, storyId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '章節不存在' 
      }, { status: 404 });
    }

    const chapter = result.rows[0];
    const votingOptions = chapter.voting_options;

    return NextResponse.json({
      success: true,
      data: {
        voting_options: votingOptions,
        voting_status: chapter.voting_status,
        voting_deadline: chapter.voting_deadline,
        is_voting_active: chapter.voting_status === '進行中' && 
          (!chapter.voting_deadline || new Date() <= new Date(chapter.voting_deadline))
      }
    });
  } catch (error) {
    console.error('取得投票狀態錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '取得投票狀態失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
