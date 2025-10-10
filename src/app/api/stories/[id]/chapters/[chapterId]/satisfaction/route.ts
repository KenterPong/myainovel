import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SatisfactionVoteType, SatisfactionVoteStats } from '@/types/voting';

// 獲取滿意度投票統計
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: storyId, chapterId } = await params;
    const chapterIdNum = parseInt(chapterId);

    if (isNaN(chapterIdNum)) {
      return NextResponse.json(
        { success: false, message: '無效的章節ID' },
        { status: 400 }
      );
    }

    // 獲取投票統計
    const voteStats = await query(`
      SELECT 
        vote_type,
        COUNT(*) as count
      FROM chapter_satisfaction_votes 
      WHERE chapter_id = $1
      GROUP BY vote_type
    `, [chapterIdNum]);

    // 初始化投票計數
    const voteCounts = {
      [SatisfactionVoteType.LIKE]: 0,
      [SatisfactionVoteType.STAR]: 0,
      [SatisfactionVoteType.FIRE]: 0,
      [SatisfactionVoteType.HEART]: 0,
    };

    // 填入實際投票數據
    voteStats.rows.forEach((row: any) => {
      const voteType = row.vote_type as SatisfactionVoteType;
      const count = parseInt(row.count);
      if (voteType in voteCounts) {
        voteCounts[voteType] = count;
      }
    });

    const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

    // 檢查用戶是否已投票（基於IP）
    // 嘗試多種方式獲取真實客戶端IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    const xClientIP = request.headers.get('x-client-ip');
    const xForwarded = request.headers.get('x-forwarded');
    const xClusterClientIP = request.headers.get('x-cluster-client-ip');
    const userAgent = request.headers.get('user-agent');
    
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
        console.log(`使用 ${source.name} 獲取IP: ${clientIP}`);
        break;
      }
    }

    // 創建設備指紋（IP + User-Agent 的組合）
    const deviceFingerprint = `${clientIP}-${userAgent}`;
    
    console.log('--- 滿意度投票API請求日誌 ---');
    console.log('請求URL:', request.url);
    console.log('章節ID:', chapterId);
    console.log('X-Forwarded-For:', forwardedFor);
    console.log('X-Real-IP:', realIP);
    console.log('User-Agent:', userAgent);
    console.log('解析前的IP:', forwardedFor || realIP || '127.0.0.1');
    console.log('最終判斷的客戶端IP:', clientIP);
    console.log('設備指紋:', deviceFingerprint);
    console.log('所有請求頭:', Object.fromEntries(request.headers.entries()));
    console.log('-----------------------------');
    
    const userVote = await query(`
      SELECT vote_type 
      FROM chapter_satisfaction_votes 
      WHERE chapter_id = $1 AND ip_address = $2
    `, [chapterIdNum, clientIP]);

    const userVoted = userVote.rows.length > 0;
    const userVoteType = userVoted ? userVote.rows[0].vote_type : undefined;

    const stats: SatisfactionVoteStats = {
      chapterId: chapterIdNum,
      voteCounts,
      totalVotes,
      userVoted,
      userVoteType,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('獲取滿意度投票統計失敗:', error);
    return NextResponse.json(
      { success: false, message: '獲取投票統計失敗' },
      { status: 500 }
    );
  }
}

// 提交滿意度投票
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: storyId, chapterId } = await params;
    const chapterIdNum = parseInt(chapterId);
    const body = await request.json();
    const { voteType } = body;

    if (isNaN(chapterIdNum)) {
      return NextResponse.json(
        { success: false, message: '無效的章節ID' },
        { status: 400 }
      );
    }

    if (!Object.values(SatisfactionVoteType).includes(voteType)) {
      return NextResponse.json(
        { success: false, message: '無效的投票類型' },
        { status: 400 }
      );
    }

    // 獲取客戶端IP
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
        console.log(`使用 ${source.name} 獲取IP: ${clientIP}`);
        break;
      }
    }
    
    const userAgent = request.headers.get('user-agent') || '';

    // 檢查是否已投票
    const existingVote = await query(`
      SELECT vote_id 
      FROM chapter_satisfaction_votes 
      WHERE chapter_id = $1 AND ip_address = $2
    `, [chapterIdNum, clientIP]);

    if (existingVote.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: '您已經投票過了' },
        { status: 400 }
      );
    }

    // 插入投票記錄
    await query(`
      INSERT INTO chapter_satisfaction_votes 
      (chapter_id, vote_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4)
    `, [chapterIdNum, voteType, clientIP, userAgent]);

    // 獲取更新後的統計
    const voteStats = await query(`
      SELECT 
        vote_type,
        COUNT(*) as count
      FROM chapter_satisfaction_votes 
      WHERE chapter_id = $1
      GROUP BY vote_type
    `, [chapterIdNum]);

    // 初始化投票計數
    const voteCounts = {
      [SatisfactionVoteType.LIKE]: 0,
      [SatisfactionVoteType.STAR]: 0,
      [SatisfactionVoteType.FIRE]: 0,
      [SatisfactionVoteType.HEART]: 0,
    };

    // 填入實際投票數據
    voteStats.rows.forEach((row: any) => {
      const voteType = row.vote_type as SatisfactionVoteType;
      const count = parseInt(row.count);
      if (voteType in voteCounts) {
        voteCounts[voteType] = count;
      }
    });

    const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

    const stats: SatisfactionVoteStats = {
      chapterId: chapterIdNum,
      voteCounts,
      totalVotes,
      userVoted: true,
      userVoteType: voteType,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: '投票成功！',
    });

  } catch (error) {
    console.error('提交滿意度投票失敗:', error);
    return NextResponse.json(
      { success: false, message: '投票失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
