import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
const CHAPTER_VOTING_THRESHOLD = parseInt(process.env.NEXT_PUBLIC_CHAPTER_VOTING_THRESHOLD || '100');
const CHAPTER_VOTING_DURATION_HOURS = parseInt(process.env.NEXT_PUBLIC_CHAPTER_VOTING_DURATION_HOURS || '24');
const CHAPTER_VOTING_COOLDOWN_HOURS = parseInt(process.env.NEXT_PUBLIC_CHAPTER_VOTING_COOLDOWN_HOURS || '24');

// 檢查投票限制（同一 IP 和會話組合只能對同一章節投票一次）
async function checkVoteLimit(chapterId: string, voterIP: string, voterSession: string): Promise<boolean> {
  try {
    const result = await query(`
      SELECT COUNT(*) as vote_count
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
    `, [chapterId, voterIP, voterSession]);
    
    return parseInt(result.rows[0].vote_count) === 0;
  } catch (error) {
    console.error('檢查投票限制錯誤:', error);
    return false;
  }
}

// 檢查投票是否已達到門檻
async function checkVotingThreshold(chapterId: string): Promise<{
  voteCounts: { A: number; B: number; C: number };
  totalVotes: number;
  thresholdReached: boolean;
  triggerGeneration: boolean;
}> {
  try {
    const result = await query(`
      SELECT option_id, vote_count
      FROM chapter_vote_totals
      WHERE chapter_id = $1
      ORDER BY vote_count DESC
    `, [chapterId]);
    
    const voteCounts = { A: 0, B: 0, C: 0 };
    let totalVotes = 0;
    
    result.rows.forEach(row => {
      if (row.option_id && typeof row.vote_count === 'number') {
        voteCounts[row.option_id as keyof typeof voteCounts] = row.vote_count;
        totalVotes += row.vote_count;
      }
    });
    
    // 檢查是否達到門檻
    const maxVotes = Math.max(voteCounts.A, voteCounts.B, voteCounts.C);
    // 在開發環境中使用較低的門檻進行測試
    const effectiveThreshold = process.env.NODE_ENV === 'development' ? 2 : CHAPTER_VOTING_THRESHOLD;
    const thresholdReached = maxVotes >= effectiveThreshold;
    const triggerGeneration = thresholdReached;
    
    return {
      voteCounts,
      totalVotes,
      thresholdReached,
      triggerGeneration
    };
  } catch (error) {
    console.error('檢查投票門檻錯誤:', error);
    return {
      voteCounts: { A: 0, B: 0, C: 0 },
      totalVotes: 0,
      thresholdReached: false,
      triggerGeneration: false
    };
  }
}

/**
 * POST /api/stories/[id]/chapters/[chapterId]/vote - 提交章節投票
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: storyId, chapterId } = await params;
    const body = await request.json();
    const { optionId, voterSession } = body;

    // 驗證必要參數
    if (!optionId || !voterSession) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要參數' 
      }, { status: 400 });
    }

    // 驗證選項 ID
    if (!['A', 'B', 'C'].includes(optionId)) {
      return NextResponse.json({ 
        success: false, 
        message: '無效的投票選項' 
      }, { status: 400 });
    }

    // 獲取客戶端 IP
    const voterIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // 檢查章節是否存在且投票進行中
    const chapterResult = await query(`
      SELECT voting_status, voting_deadline
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

    // 檢查投票限制
    const canVote = await checkVoteLimit(chapterId, voterIP, voterSession);
    if (!canVote) {
      return NextResponse.json({
        success: false,
        message: '您已經對這個章節投過票了'
      }, { status: 429 });
    }

    // 提交投票
    try {
      await transaction(async (client) => {
        // 再次檢查投票限制（防止競態條件）
        const duplicateCheck = await client.query(`
          SELECT COUNT(*) as vote_count
          FROM chapter_votes 
          WHERE chapter_id = $1 
            AND voter_ip = $2 
            AND voter_session = $3
        `, [chapterId, voterIP, voterSession]);
        
        if (parseInt(duplicateCheck.rows[0].vote_count) > 0) {
          throw new Error('重複投票');
        }

        // 插入投票記錄
        await client.query(`
          INSERT INTO chapter_votes (
            chapter_id, story_id, voter_ip, voter_session, 
            option_id, voted_at, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          chapterId, storyId, voterIP, voterSession,
          optionId, new Date(), userAgent
        ]);
      });
    } catch (error) {
      if (error instanceof Error && error.message === '重複投票') {
        return NextResponse.json({
          success: false,
          message: '您已經對這個章節投過票了'
        }, { status: 429 });
      }
      
      // 檢查是否是唯一約束違反錯誤
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
        return NextResponse.json({
          success: false,
          message: '您已經對這個章節投過票了'
        }, { status: 429 });
      }
      
      throw error; // 重新拋出其他錯誤
    }

    // 檢查投票門檻
    const thresholdResult = await checkVotingThreshold(chapterId);
    
    // 如果達到門檻，觸發 AI 生成
    if (thresholdResult.triggerGeneration) {
      try {
        // 獲取投票結果（得票最高的選項）
        const voteResult = await query(`
          SELECT option_id, vote_count
          FROM chapter_vote_totals 
          WHERE chapter_id = $1
          ORDER BY vote_count DESC
          LIMIT 1
        `, [chapterId]);

        if (voteResult.rows.length > 0) {
          const winningOption = voteResult.rows[0];
          const totalVotes = thresholdResult.totalVotes;
          const percentage = totalVotes > 0 ? Math.round((winningOption.vote_count / totalVotes) * 100) : 0;

          // 獲取投票選項詳情
          const chapterData = await query(`
            SELECT voting_options, full_text, summary
            FROM chapters 
            WHERE chapter_id = $1
          `, [chapterId]);

          if (chapterData.rows.length > 0) {
            const votingOptions = chapterData.rows[0].voting_options;
            const winningOptionData = votingOptions.options.find((opt: any) => opt.id === winningOption.option_id);

            if (winningOptionData) {
              console.log('投票結束，獲勝選項:', winningOptionData.content);
              // 這裡可以添加其他投票結束後的處理邏輯
            }
          }
        }

        // 更新章節狀態為已生成
        await query(`
          UPDATE chapters 
          SET voting_status = '已生成'
          WHERE chapter_id = $1
        `, [chapterId]);

      } catch (error) {
        console.error('AI 生成觸發失敗:', error);
        // 即使 AI 生成失敗，也要更新章節狀態
        await query(`
          UPDATE chapters 
          SET voting_status = '已生成'
          WHERE chapter_id = $1
        `, [chapterId]);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        voteCounts: thresholdResult.voteCounts,
        totalVotes: thresholdResult.totalVotes,
        userVoted: true,
        thresholdReached: thresholdResult.thresholdReached,
        triggerGeneration: thresholdResult.triggerGeneration
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
 * GET /api/stories/[id]/chapters/[chapterId]/vote - 取得章節投票統計
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: storyId, chapterId } = await params;
    const voterIP = getClientIP(request);
    const voterSession = request.headers.get('x-session-id') || '';

    // 檢查章節是否存在
    const chapterResult = await query(`
      SELECT voting_status, voting_deadline, voting_options
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

    // 獲取投票統計
    const thresholdResult = await checkVotingThreshold(chapterId);
    
    // 檢查用戶是否已投票
    const userVoteResult = await query(`
      SELECT option_id
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
    `, [chapterId, voterIP, voterSession]);

    const userVoted = userVoteResult.rows.length > 0;
    const userChoice = userVoted ? userVoteResult.rows[0].option_id : undefined;

    // 檢查投票是否仍在進行中
    const now = new Date();
    const isVotingActive = chapter.voting_status === '進行中' && 
      (!chapter.voting_deadline || now <= new Date(chapter.voting_deadline));

    return NextResponse.json({
      success: true,
      data: {
        chapterId: parseInt(chapterId),
        votingStatus: chapter.voting_status,
        votingDeadline: chapter.voting_deadline,
        voteCounts: thresholdResult.voteCounts,
        totalVotes: thresholdResult.totalVotes,
        userVoted,
        userChoice,
        threshold: CHAPTER_VOTING_THRESHOLD,
        thresholdReached: thresholdResult.thresholdReached,
        triggerGeneration: thresholdResult.triggerGeneration,
        isVotingActive
      }
    });
  } catch (error) {
    console.error('取得投票統計錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '取得投票統計失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
