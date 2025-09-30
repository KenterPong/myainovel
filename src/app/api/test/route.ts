import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 測試 API 端點被呼叫');
    
    const body = await request.json();
    console.log('📊 收到的請求:', body);
    
    return NextResponse.json({
      success: true,
      message: '測試 API 正常運作',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 測試 API 錯誤:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
