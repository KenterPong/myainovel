import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { randomUUID } from 'crypto';

// 獲取客戶端 IP 地址
function getClientIP(request: NextRequest): string {
  // 嘗試多種方式獲取真實客戶端IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  const xClientIP = request.headers.get('x-client-ip');
  const xForwarded = request.headers.get('x-forwarded');
  const xClusterClientIP = request.headers.get('x-cluster-client-ip');
  
  // 解析IPv6格式的IP (::ffff:192.168.8.154 -> 192.168.8.154)
  let clientIP = '127.0.0.1';
  
  // 按優先級檢查各種IP頭部
  const ipSources = [
    { value: cfConnectingIP, name: 'cf-connecting-ip' },
    { value: xClientIP, name: 'x-client-ip' },
    { value: realIP, name: 'x-real-ip' },
    { value: xForwarded, name: 'x-forwarded' },
    { value: xClusterClientIP, name: 'x-cluster-client-ip' },
    { value: forwardedFor, name: 'x-forwarded-for' }
  ];
  
  for (const source of ipSources) {
    if (source.value) {
      const firstIP = source.value.split(',')[0].trim();
      // 處理IPv6映射的IPv4地址
      if (firstIP.startsWith('::ffff:')) {
        clientIP = firstIP.substring(7); // 移除 ::ffff: 前綴
      } else {
        clientIP = firstIP;
      }
      console.log(`章節投票使用 ${source.name} 獲取IP: ${clientIP}`);
      break;
    }
  }
  
  return clientIP;
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

// 檢查冷卻時間
async function checkCooldown(chapterId: string, voterIP: string, voterSession: string): Promise<{
  canVote: boolean;
  cooldownUntil?: string;
}> {
  try {
    const now = new Date();
    
    // 檢查用戶是否已投票（基於 chapter_votes 表的 voted_at 欄位計算冷卻時間）
    const voteResult = await query(`
      SELECT voted_at
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
      ORDER BY voted_at DESC
      LIMIT 1
    `, [chapterId, voterIP, voterSession]);
    
    if (voteResult.rows.length > 0) {
      const votedAt = new Date(voteResult.rows[0].voted_at);
      const cooldownUntil = new Date(votedAt.getTime() + (CHAPTER_VOTING_COOLDOWN_HOURS * 60 * 60 * 1000));
      
      if (now < cooldownUntil) {
        return { 
          canVote: false, 
          cooldownUntil: cooldownUntil.toISOString() 
        };
      }
    }
    
    return { canVote: true };
  } catch (error) {
    console.error('檢查冷卻時間錯誤:', error);
    return { canVote: true };
  }
}

// 更新章節投票狀態
async function updateChapterVotingStatus(chapterId: string, status: '投票中' | '已投票' | '投票截止', userChoice?: string): Promise<void> {
  try {
    await query(`
      UPDATE chapters 
      SET voting_status = $2, 
          user_choice = $3
      WHERE chapter_id = $1
    `, [chapterId, status, userChoice]);
  } catch (error) {
    console.error('更新章節投票狀態錯誤:', error);
    throw error;
  }
}

// 獲取投票統計
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: storyId, chapterId } = await params;
    const voterIP = getClientIP(request);
    const voterSession = request.headers.get('x-session-id') || 'anonymous';

    // 添加詳細的IP檢測日誌
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    
    console.log('--- 章節投票GET API請求日誌 ---');
    console.log('請求URL:', request.url);
    console.log('章節ID:', chapterId);
    console.log('X-Forwarded-For:', forwardedFor);
    console.log('X-Real-IP:', realIP);
    console.log('User-Agent:', userAgent);
    console.log('解析前的IP:', forwardedFor || realIP || '127.0.0.1');
    console.log('最終判斷的客戶端IP:', voterIP);
    console.log('所有請求頭:', Object.fromEntries(request.headers.entries()));
    console.log('-----------------------------');

    console.log('GET vote stats:', { storyId, chapterId, voterIP, voterSession });

    // 獲取章節資訊
    const chapterResult = await query(`
      SELECT chapter_id, voting_status, user_choice, voting_deadline
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
    console.log('Chapter found:', chapter);
    
    // 檢查冷卻時間
    const cooldownCheck = await checkCooldown(chapterId, voterIP, voterSession);
    console.log('Cooldown check:', cooldownCheck);
    
    // 如果冷卻時間已過，更新狀態為投票中
    if (chapter.voting_status === '已投票' && cooldownCheck.canVote) {
      await updateChapterVotingStatus(chapterId, '投票中');
      chapter.voting_status = '投票中';
    }

    // 獲取投票統計
    const voteStats = await checkVotingThreshold(chapterId);
    console.log('Vote stats:', voteStats);
    
    // 檢查用戶是否已投票
    const userVotedResult = await query(`
      SELECT COUNT(*) as vote_count, MAX(option_id) as option_id
      FROM chapter_votes 
      WHERE chapter_id = $1 
        AND voter_ip = $2 
        AND voter_session = $3
    `, [chapterId, voterIP, voterSession]);
    
    const userVoted = parseInt(userVotedResult.rows[0].vote_count) > 0;
    const userChoice = userVoted ? userVotedResult.rows[0].option_id : undefined;

    console.log('User voted:', { userVoted, userChoice });

    return NextResponse.json({
      success: true,
      data: {
        chapterId: parseInt(chapterId),
        votingStatus: chapter.voting_status,
        votingDeadline: chapter.voting_deadline,
        cooldownUntil: cooldownCheck.cooldownUntil,
        voteCounts: voteStats.voteCounts,
        totalVotes: voteStats.totalVotes,
        userVoted,
        userChoice,
        threshold: CHAPTER_VOTING_THRESHOLD,
        thresholdReached: voteStats.thresholdReached,
        triggerGeneration: voteStats.triggerGeneration,
        isVotingActive: chapter.voting_status === '投票中'
      }
    });

  } catch (error) {
    console.error('獲取投票統計錯誤:', error);
    return NextResponse.json({
      success: false,
      message: '獲取投票統計失敗'
    }, { status: 500 });
  }
}

// 提交投票
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: storyId, chapterId } = await params;
    const voterIP = getClientIP(request);
    const voterSession = request.headers.get('x-session-id') || 'anonymous';
    const body = await request.json();
    const { optionId } = body;

    // 添加詳細的IP檢測日誌
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    
    console.log('--- 章節投票POST API請求日誌 ---');
    console.log('請求URL:', request.url);
    console.log('章節ID:', chapterId);
    console.log('X-Forwarded-For:', forwardedFor);
    console.log('X-Real-IP:', realIP);
    console.log('User-Agent:', userAgent);
    console.log('解析前的IP:', forwardedFor || realIP || '127.0.0.1');
    console.log('最終判斷的客戶端IP:', voterIP);
    console.log('所有請求頭:', Object.fromEntries(request.headers.entries()));
    console.log('-----------------------------');

    // 驗證投票選項
    if (!optionId || !['A', 'B', 'C'].includes(optionId)) {
      return NextResponse.json({
        success: false,
        message: '無效的投票選項'
      }, { status: 400 });
    }

    // 獲取章節資訊
    const chapterResult = await query(`
      SELECT chapter_id, voting_status, voting_deadline
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

    // 檢查投票狀態
    if (chapter.voting_status !== '投票中') {
      return NextResponse.json({
        success: false,
        message: '投票已結束'
      }, { status: 400 });
    }

    // 檢查冷卻時間
    const cooldownCheck = await checkCooldown(chapterId, voterIP, voterSession);
    if (!cooldownCheck.canVote) {
      return NextResponse.json({
        success: false,
        message: `投票冷卻中，請等待至 ${cooldownCheck.cooldownUntil}`
      }, { status: 400 });
    }

    // 檢查投票限制
    const canVote = await checkVoteLimit(chapterId, voterIP, voterSession);
    if (!canVote) {
      return NextResponse.json({
        success: false,
        message: '您已經投票過了'
      }, { status: 400 });
    }

    // 使用事務處理投票
    console.log('🔄 開始投票事務處理:', { chapterId, storyId, voterIP, voterSession, optionId });
    await transaction(async (client) => {
      // 記錄投票
      console.log('📝 插入投票記錄');
      const voteResult = await client.query(`
        INSERT INTO chapter_votes (vote_id, chapter_id, story_id, voter_ip, voter_session, option_id, voted_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING vote_id
      `, [randomUUID(), chapterId, storyId, voterIP, voterSession, optionId]);
      console.log('✅ 投票記錄插入完成:', voteResult.rows[0].vote_id);

      // 投票統計由資料庫觸發器自動更新，不需要手動更新
      console.log('📊 投票統計將由資料庫觸發器自動更新');

      // 更新章節狀態為已投票
      await client.query(`
        UPDATE chapters 
        SET voting_status = '已投票',
            user_choice = $2
        WHERE chapter_id = $1
      `, [chapterId, optionId]);
    });

    // 檢查是否達到門檻
    console.log('🔍 檢查投票門檻');
    const voteStats = await checkVotingThreshold(chapterId);
    console.log('📊 投票統計結果:', voteStats);
    
    if (voteStats.thresholdReached) {
      // 更新章節狀態為投票截止
      console.log('🚫 投票已達門檻，更新狀態為投票截止');
      await updateChapterVotingStatus(chapterId, '投票截止');
      
      // 觸發 AI 生成新章節
      try {
        console.log('投票已達標，觸發 AI 生成新章節');
        const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/stories/${storyId}/chapters/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        
        if (generateResponse.ok) {
          const generateResult = await generateResponse.json();
          console.log('✅ 新章節生成成功:', generateResult.chapterId);
        } else {
          console.log('⚠️ 章節生成失敗，但投票已記錄');
        }
      } catch (generateError) {
        console.log('⚠️ 章節生成時發生錯誤:', generateError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        voteCounts: voteStats.voteCounts,
        totalVotes: voteStats.totalVotes,
        userVoted: true,
        thresholdReached: voteStats.thresholdReached,
        triggerGeneration: voteStats.triggerGeneration
      },
      message: '投票成功！'
    });

  } catch (error) {
    console.error('投票錯誤:', error);
    return NextResponse.json({
      success: false,
      message: '投票失敗'
    }, { status: 500 });
  }
}