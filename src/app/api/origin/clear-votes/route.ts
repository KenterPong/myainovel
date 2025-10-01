import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

// 清空指定故事的投票記錄
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId } = body;

    if (!storyId) {
      return NextResponse.json({
        success: false,
        message: '缺少故事 ID 參數'
      }, { status: 400 });
    }

    // 檢查故事是否存在
    const storyResult = await query(`
      SELECT story_id, title, status
      FROM stories 
      WHERE story_id = $1
    `, [storyId]);

    if (storyResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '故事不存在'
      }, { status: 404 });
    }

    // 清空投票記錄和統計
    await transaction(async (client) => {
      // 清空投票記錄
      await client.query(`
        DELETE FROM origin_votes 
        WHERE story_id = $1
      `, [storyId]);

      // 清空投票統計
      await client.query(`
        DELETE FROM origin_vote_totals 
        WHERE story_id = $1
      `, [storyId]);

      // 更新故事狀態為投票中，重新開始投票
      await client.query(`
        UPDATE stories 
        SET status = '投票中', 
            origin_voting_start_date = NOW(),
            voting_result = NULL
        WHERE story_id = $1
      `, [storyId]);
    });

    return NextResponse.json({
      success: true,
      message: '投票記錄已清空，開始新一輪投票',
      data: {
        storyId,
        clearedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('清空投票記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      message: '清空投票記錄失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
