import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { randomUUID } from 'crypto';

// 獲取客戶端 IP 地址
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1'; // 預設值
}

// 獲取環境變數設定
const VOTING_THRESHOLD = parseInt(process.env.NEXT_PUBLIC_VOTING_THRESHOLD || '100');
const VOTING_DURATION_DAYS = parseInt(process.env.NEXT_PUBLIC_VOTING_DURATION_DAYS || '7');
const VOTING_COOLDOWN_HOURS = parseInt(process.env.NEXT_PUBLIC_VOTING_COOLDOWN_HOURS || '24');

// 檢查投票限制（同一 IP 24 小時內只能投票一次）
async function checkVoteLimit(storyId: string, voterIP: string, voterSession: string): Promise<boolean> {
  try {
    const result = await query(`
      SELECT COUNT(*) as vote_count
      FROM origin_votes 
      WHERE voter_ip = $1 
        AND voter_session = $2 
        AND voted_at >= NOW() - INTERVAL '${VOTING_COOLDOWN_HOURS} hours'
    `, [voterIP, voterSession]);
    
    return parseInt(result.rows[0].vote_count) === 0;
  } catch (error) {
    console.error('檢查投票限制錯誤:', error);
    return false;
  }
}

// 檢查投票是否已達到門檻
async function checkVotingThreshold(storyId: string): Promise<{
  outer: { [key: string]: number };
  middle: { [key: string]: number };
  inner: { [key: string]: number };
  allReached: boolean;
}> {
  try {
    console.log('查詢投票統計，storyId:', storyId);
    const result = await query(`
      SELECT category, option_id, vote_count
      FROM origin_vote_totals
      WHERE story_id = $1
      ORDER BY category, vote_count DESC
    `, [storyId]);
    
    console.log('查詢結果行數:', result.rows.length);
    console.log('查詢結果:', result.rows);
    
    const totals = {
      outer: {} as { [key: string]: number },
      middle: {} as { [key: string]: number },
      inner: {} as { [key: string]: number }
    };
    
    result.rows.forEach(row => {
      console.log('處理行:', row);
      if (row.category && row.option_id && typeof row.vote_count === 'number') {
        totals[row.category as keyof typeof totals][row.option_id] = row.vote_count;
      }
    });
    
    console.log('處理後的統計數據:', totals);
    
    // 檢查每個分類是否都有選項達到門檻
    const outerReached = Object.values(totals.outer).some(count => count >= VOTING_THRESHOLD);
    const middleReached = Object.values(totals.middle).some(count => count >= VOTING_THRESHOLD);
    const innerReached = Object.values(totals.inner).some(count => count >= VOTING_THRESHOLD);
    
    console.log('門檻檢查結果:', { outerReached, middleReached, innerReached, threshold: VOTING_THRESHOLD });
    
    return {
      ...totals,
      allReached: outerReached && middleReached && innerReached
    };
  } catch (error) {
    console.error('檢查投票門檻錯誤:', error);
    console.error('錯誤詳情:', {
      message: error instanceof Error ? error.message : '未知錯誤',
      stack: error instanceof Error ? error.stack : undefined,
      storyId
    });
    return {
      outer: {},
      middle: {},
      inner: {},
      allReached: false
    };
  }
}

// 提交投票
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      storyId, 
      outerChoice, 
      middleChoice, 
      innerChoice, 
      voterSession 
    } = body;

    // 驗證必要參數
    if (!storyId || !outerChoice || !middleChoice || !innerChoice || !voterSession) {
      return NextResponse.json({
        success: false,
        message: '缺少必要參數'
      }, { status: 400 });
    }

    // 獲取客戶端 IP
    const voterIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // 檢查投票限制
    const canVote = await checkVoteLimit(storyId, voterIP, voterSession);
    if (!canVote) {
      return NextResponse.json({
        success: false,
        message: '您已經在 24 小時內投過票了，請稍後再試'
      }, { status: 429 });
    }

    // 檢查故事是否存在，如果不存在則建立新故事
    let storyResult = await query(`
      SELECT story_id, status, origin_voting_start_date
      FROM stories 
      WHERE story_id = $1
    `, [storyId]);

    let story;
    let votingEndDate: Date;
    
    if (storyResult.rows.length === 0) {
      // 故事不存在，建立新故事
      const newStoryResult = await query(`
        INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING story_id, status, origin_voting_start_date
      `, [
        storyId,
        `A${String(Date.now()).slice(-5)}`, // 生成臨時序號
        '新故事投票中',
        '投票中'
      ]);
      
      story = newStoryResult.rows[0];
      // 計算投票結束時間
      const votingStartDate = new Date(story.origin_voting_start_date);
      votingEndDate = new Date(votingStartDate.getTime() + VOTING_DURATION_DAYS * 24 * 60 * 60 * 1000);
    } else {
      story = storyResult.rows[0];
      
      // 檢查投票是否仍在有效期內
      const votingStartDate = new Date(story.origin_voting_start_date);
      votingEndDate = new Date(votingStartDate.getTime() + VOTING_DURATION_DAYS * 24 * 60 * 60 * 1000);
      const now = new Date();
      
      if (now > votingEndDate) {
        return NextResponse.json({
          success: false,
          message: '投票活動已結束'
        }, { status: 410 });
      }
    }

    // 提交投票
    await transaction(async (client) => {
      // 插入投票記錄
      await client.query(`
        INSERT INTO origin_votes (
          story_id, voter_ip, voter_session, 
          outer_choice, middle_choice, inner_choice, 
          voted_at, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        storyId, voterIP, voterSession,
        outerChoice, middleChoice, innerChoice,
        new Date(), userAgent
      ]);
    });

    // 檢查投票門檻（即使失敗也不影響投票成功）
    let thresholdResult;
    try {
      console.log('開始檢查投票門檻，storyId:', storyId);
      thresholdResult = await checkVotingThreshold(storyId);
      console.log('投票門檻檢查結果:', thresholdResult);
    } catch (thresholdError) {
      console.error('檢查投票門檻錯誤:', thresholdError);
      console.error('錯誤詳情:', {
        message: thresholdError instanceof Error ? thresholdError.message : '未知錯誤',
        stack: thresholdError instanceof Error ? thresholdError.stack : undefined
      });
      // 如果檢查門檻失敗，返回預設值，但投票仍然成功
      thresholdResult = {
        outer: {},
        middle: {},
        inner: {},
        allReached: false
      };
    }
    
    return NextResponse.json({
      success: true,
      message: '投票成功',
      data: {
        voteCounts: {
          outer: thresholdResult.outer,
          middle: thresholdResult.middle,
          inner: thresholdResult.inner
        },
        allThresholdsReached: thresholdResult.allReached,
        votingEndDate: votingEndDate.toISOString()
      }
    });

  } catch (error) {
    console.error('投票提交錯誤:', error);
    return NextResponse.json({
      success: false,
      message: '投票提交失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

// 獲取投票統計
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json({
        success: false,
        message: '缺少故事 ID 參數'
      }, { status: 400 });
    }

    // 獲取投票統計
    const thresholdResult = await checkVotingThreshold(storyId);
    
    // 獲取故事資訊
    const storyResult = await query(`
      SELECT story_id, title, status, origin_voting_start_date
      FROM stories 
      WHERE story_id = $1
    `, [storyId]);

    if (storyResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '故事不存在'
      }, { status: 404 });
    }

    const story = storyResult.rows[0];
    const votingStartDate = new Date(story.origin_voting_start_date);
    const votingEndDate = new Date(votingStartDate.getTime() + VOTING_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const isVotingActive = now <= votingEndDate;

    return NextResponse.json({
      success: true,
      data: {
        story: {
          id: story.story_id,
          title: story.title,
          status: story.status
        },
        voteCounts: {
          outer: thresholdResult.outer,
          middle: thresholdResult.middle,
          inner: thresholdResult.inner
        },
        allThresholdsReached: thresholdResult.allReached,
        votingInfo: {
          startDate: votingStartDate.toISOString(),
          endDate: votingEndDate.toISOString(),
          isActive: isVotingActive,
          remainingTime: isVotingActive ? Math.max(0, votingEndDate.getTime() - now.getTime()) : 0
        }
      }
    });

  } catch (error) {
    console.error('獲取投票統計錯誤:', error);
    return NextResponse.json({
      success: false,
      message: '獲取投票統計失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
