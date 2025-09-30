import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, createSampleStory, checkDatabaseStatus } from '@/lib/init-db';

/**
 * POST /api/db/init - 初始化資料庫
 */
export async function POST(request: NextRequest) {
  try {
    const { action = 'init' } = await request.json();

    switch (action) {
      case 'init':
        await initializeDatabase();
        return NextResponse.json({ 
          success: true, 
          message: '資料庫初始化完成' 
        });

      case 'sample':
        await createSampleStory();
        return NextResponse.json({ 
          success: true, 
          message: '範例故事建立完成' 
        });

      case 'status':
        await checkDatabaseStatus();
        return NextResponse.json({ 
          success: true, 
          message: '資料庫狀態檢查完成' 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          message: '無效的操作' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('資料庫初始化錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '資料庫初始化失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

/**
 * GET /api/db/init - 檢查資料庫狀態
 */
export async function GET() {
  try {
    await checkDatabaseStatus();
    return NextResponse.json({ 
      success: true, 
      message: '資料庫狀態正常' 
    });
  } catch (error) {
    console.error('資料庫狀態檢查錯誤:', error);
    return NextResponse.json({ 
      success: false, 
      message: '資料庫狀態檢查失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
