import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

/**
 * GET /api/health - 健康檢查端點
 */
export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'error',
      error: error instanceof Error ? error.message : '未知錯誤',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
