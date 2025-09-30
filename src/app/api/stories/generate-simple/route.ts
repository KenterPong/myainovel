import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 收到簡化版故事生成請求');
    const { genre, background, theme } = await request.json();
    console.log('📊 請求參數:', { genre, background, theme });

    if (!genre || !background || !theme) {
      return NextResponse.json(
        { error: '缺少必要參數：genre, background, theme' },
        { status: 400 }
      );
    }

    // 生成模擬故事數據
    const storyData = {
      title: `${genre}${background}${theme}的奇幻冒險`,
      genre: genre,
      worldview: `在一個充滿${genre}元素的世界中，${background}的環境為故事提供了獨特的背景，而${theme}關係將成為故事的核心。`,
      characters: [
        {
          name: "主角",
          age: "20歲",
          role: "主要角色",
          personality: "勇敢、善良、有正義感",
          background: "在" + background + "環境中成長，擁有特殊能力"
        },
        {
          name: "導師",
          age: "50歲",
          role: "指導者",
          personality: "智慧、嚴厲但關愛",
          background: "經驗豐富的" + theme + "關係中的長者"
        },
        {
          name: "夥伴",
          age: "22歲",
          role: "支援角色",
          personality: "忠誠、幽默、可靠",
          background: "在冒險中結識的" + theme + "夥伴"
        }
      ],
      conflict: "主角必須在" + background + "的挑戰中成長，學會" + theme + "的真正意義，同時面對來自" + genre + "世界的威脅",
      theme: theme,
      setting: "一個融合了" + genre + "元素的" + background + "世界，充滿魔法與奇蹟",
      outline: {
        beginning: "故事開始於主角在" + background + "環境中的日常生活，直到遇到改變命運的導師",
        development: "隨著" + theme + "關係的建立，主角面臨各種挑戰，學習新的技能和智慧",
        climax: "在關鍵時刻，主角必須運用所學來解決危機，保護所愛的人",
        ending: "主角在" + theme + "關係的幫助下獲得成長，故事圓滿結束，但新的冒險即將開始"
      }
    };

    console.log('✅ 模擬故事數據生成成功');

    return NextResponse.json({
      success: true,
      storyId: 'simple-story-' + Date.now(),
      storyData,
      message: '故事設定生成成功（簡化版）'
    });

  } catch (error) {
    console.error('❌ 簡化版故事生成錯誤:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '故事生成失敗', 
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
}
