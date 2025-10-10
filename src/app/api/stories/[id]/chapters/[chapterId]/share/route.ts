import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SharePlatform, ShareStats } from '@/types/voting';

// 獲取社群分享統計
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

    // 獲取分享統計
    const shareStats = await query(`
      SELECT 
        platform,
        COUNT(*) as count
      FROM chapter_shares 
      WHERE chapter_id = $1
      GROUP BY platform
    `, [chapterIdNum]);

    // 初始化分享計數
    const shareCounts = {
      [SharePlatform.TWITTER]: 0,
      [SharePlatform.FACEBOOK]: 0,
      [SharePlatform.LINE]: 0,
    };

    // 填入實際分享數據
    shareStats.rows.forEach((row: any) => {
      const platform = row.platform as SharePlatform;
      const count = parseInt(row.count);
      if (platform in shareCounts) {
        shareCounts[platform] = count;
      }
    });

    const totalShares = Object.values(shareCounts).reduce((sum, count) => sum + count, 0);

    const stats: ShareStats = {
      chapterId: chapterIdNum,
      shareCounts,
      totalShares,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('獲取社群分享統計失敗:', error);
    return NextResponse.json(
      { success: false, message: '獲取分享統計失敗' },
      { status: 500 }
    );
  }
}

// 記錄社群分享
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: storyId, chapterId } = await params;
    const chapterIdNum = parseInt(chapterId);
    const body = await request.json();
    const { platform } = body;

    if (isNaN(chapterIdNum)) {
      return NextResponse.json(
        { success: false, message: '無效的章節ID' },
        { status: 400 }
      );
    }

    if (!Object.values(SharePlatform).includes(platform)) {
      return NextResponse.json(
        { success: false, message: '無效的分享平台' },
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
        console.log(`分享API使用 ${source.name} 獲取IP: ${clientIP}`);
        break;
      }
    }

    // 記錄分享
    await query(`
      INSERT INTO chapter_shares 
      (chapter_id, platform, ip_address)
      VALUES ($1, $2, $3)
    `, [chapterIdNum, platform, clientIP]);

    // 獲取更新後的統計
    const shareStats = await query(`
      SELECT 
        platform,
        COUNT(*) as count
      FROM chapter_shares 
      WHERE chapter_id = $1
      GROUP BY platform
    `, [chapterIdNum]);

    // 初始化分享計數
    const shareCounts = {
      [SharePlatform.TWITTER]: 0,
      [SharePlatform.FACEBOOK]: 0,
      [SharePlatform.LINE]: 0,
    };

    // 填入實際分享數據
    shareStats.rows.forEach((row: any) => {
      const platform = row.platform as SharePlatform;
      const count = parseInt(row.count);
      if (platform in shareCounts) {
        shareCounts[platform] = count;
      }
    });

    const totalShares = Object.values(shareCounts).reduce((sum, count) => sum + count, 0);

    const stats: ShareStats = {
      chapterId: chapterIdNum,
      shareCounts,
      totalShares,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: '分享記錄成功！',
    });

  } catch (error) {
    console.error('記錄社群分享失敗:', error);
    return NextResponse.json(
      { success: false, message: '記錄分享失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
