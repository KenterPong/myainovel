/**
 * 插圖生成 API 端點
 * POST /api/illustrations/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { IllustrationService } from '@/lib/services/IllustrationService';
import { IllustrationGenerateRequest } from '@/types/illustration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, storyId, chapterTitle, chapterContent, storyGenre } = body;

    // 驗證必要參數
    if (!chapterId || !storyId || !chapterTitle || !chapterContent || !storyGenre) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必要參數: chapterId, storyId, chapterTitle, chapterContent, storyGenre' 
        },
        { status: 400 }
      );
    }

    // 建立插圖服務實例
    const illustrationService = new IllustrationService();

    // 檢查插圖是否已存在
    const exists = await illustrationService.checkIllustrationExists(chapterId);
    if (exists) {
      return NextResponse.json(
        { 
          success: false, 
          error: '該章節的插圖已存在' 
        },
        { status: 409 }
      );
    }

    // 生成插圖
    const generateRequest: IllustrationGenerateRequest = {
      chapterId,
      storyId,
      chapterTitle,
      chapterContent,
      storyGenre
    };

    const result = await illustrationService.generateIllustration(generateRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          illustrationUrl: result.illustrationUrl,
          illustrationPrompt: result.illustrationPrompt,
          illustrationStyle: result.illustrationStyle,
          generatedAt: result.generatedAt,
          processingTime: result.processingTime
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || '插圖生成失敗' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('插圖生成 API 錯誤:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '伺服器內部錯誤' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: '此端點僅支援 POST 請求' 
    },
    { status: 405 }
  );
}
