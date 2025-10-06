/**
 * 插圖風格管理 API 端點
 * GET /api/illustrations/styles - 獲取故事插圖風格
 * POST /api/illustrations/styles - 建立或更新故事插圖風格
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { IllustrationStyle } from '@/types/illustration';

// 獲取故事插圖風格
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必要參數: storyId' 
        },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT setting_data FROM story_settings WHERE story_id = $1 AND setting_type = $2',
      [storyId, '插圖風格']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '該故事尚未設定插圖風格'
      });
    }

    const illustrationStyle = result.rows[0].setting_data as IllustrationStyle;

    return NextResponse.json({
      success: true,
      data: illustrationStyle
    });

  } catch (error) {
    console.error('獲取插圖風格失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '獲取插圖風格失敗' 
      },
      { status: 500 }
    );
  }
}

// 建立或更新故事插圖風格
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, storyGenre, styleName, stylePrompt, colorPalette, artStyle, mood, characterStyle } = body;

    // 驗證必要參數
    if (!storyId || !storyGenre || !styleName || !stylePrompt) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必要參數: storyId, storyGenre, styleName, stylePrompt' 
        },
        { status: 400 }
      );
    }

    const illustrationStyle: IllustrationStyle = {
      story_genre: storyGenre,
      style_name: styleName,
      style_prompt: stylePrompt,
      color_palette: colorPalette || [],
      art_style: artStyle || '',
      mood: mood || '',
      character_style: characterStyle || ''
    };

    // 檢查是否已存在
    const existingResult = await query(
      'SELECT setting_id FROM story_settings WHERE story_id = $1 AND setting_type = $2',
      [storyId, '插圖風格']
    );

    if (existingResult.rows.length > 0) {
      // 更新現有設定
      await query(
        'UPDATE story_settings SET setting_data = $1, last_updated_at = NOW() WHERE story_id = $2 AND setting_type = $3',
        [JSON.stringify(illustrationStyle), storyId, '插圖風格']
      );
    } else {
      // 建立新設定
      await query(
        'INSERT INTO story_settings (story_id, setting_type, setting_data) VALUES ($1, $2, $3)',
        [storyId, '插圖風格', JSON.stringify(illustrationStyle)]
      );
    }

    return NextResponse.json({
      success: true,
      data: illustrationStyle,
      message: '插圖風格設定成功'
    });

  } catch (error) {
    console.error('設定插圖風格失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '設定插圖風格失敗' 
      },
      { status: 500 }
    );
  }
}
