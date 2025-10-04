/**
 * 添加長測試內容到章節資料庫
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

async function addLongTestContent() {
  console.log('📝 添加長測試內容到章節...');
  
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myainovel',
    port: 5432,
    password: '1234',
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log('✅ 資料庫連線成功\n');

    // 長測試內容
    const longContent = `
第一章：魔法學院的秘密

艾莉亞站在古老的魔法學院大門前，手中緊握著那封神秘的信件。信封上燙金的字體在夕陽下閃閃發光，上面寫著：「致艾莉亞·星月，魔法學院誠摯邀請您加入我們的行列。」

她深吸一口氣，推開了那扇沉重的木門。門後是一個充滿魔法的世界——漂浮的書本在空中緩緩移動，各種顏色的光芒在走廊中閃爍，遠處傳來學生們練習咒語的聲音。

「歡迎來到魔法學院，親愛的。」一個溫和的聲音從身後傳來。艾莉亞轉過身，看到一位穿著深藍色長袍的老者正微笑著看著她。

「我是院長梅林，很高興見到你。」老者伸出手，「我知道你有很多疑問，但首先，讓我帶你參觀一下這個神奇的地方。」

他們穿過長長的走廊，經過了圖書館、實驗室、還有學生宿舍。每個地方都充滿了魔法的氣息，讓艾莉亞感到既興奮又緊張。

「這裡是我們的魔法實驗室，」院長指著一間充滿各種魔法器具的房間說，「學生們在這裡學習各種魔法技巧，從基礎的變形術到高級的召喚術。」

艾莉亞看到幾個學生正在練習漂浮術，他們專注地念著咒語，讓羽毛在空中優雅地舞動。她不禁想像自己也能掌握這些神奇的技能。

「但是，」院長的語氣突然變得嚴肅，「魔法學院也有它的危險。最近，我們發現了一些不尋常的現象——古老的封印開始鬆動，黑暗的力量正在蠢蠢欲動。」

艾莉亞感到一陣寒意，「什麼意思？」

「意思是，」院長看著她的眼睛，「你來到這裡不是偶然的。你的血統中蘊含著強大的魔法力量，而這個世界需要你來幫助我們對抗即將到來的黑暗。」

就在這時，遠處傳來一聲巨響，整個學院都震動起來。學生們驚慌失措地四處奔跑，而院長的表情變得更加嚴肅。

「看來時間比我們想像的還要緊迫，」他快速地說，「艾莉亞，你必須做出選擇。你可以選擇留在這裡，學習魔法，準備面對即將到來的挑戰；或者你可以離開，回到平凡的生活中。」

艾莉亞看著窗外，看到天空中出現了不祥的黑色雲朵，雷電在其中閃爍。她知道，這個選擇將改變她的一生。

「我...」她猶豫了一下，然後堅定地說，「我選擇留下。我要學習魔法，保護這個世界。」

院長露出了欣慰的笑容，「很好，那麼從明天開始，你將正式成為魔法學院的一員。但首先，我們需要為你準備一些東西。」

他從長袍中取出一根精美的魔杖，杖身是深色的木材，頂端鑲嵌著一顆閃閃發光的藍色寶石。

「這根魔杖曾經屬於一位偉大的魔法師，」院長將魔杖遞給艾莉亞，「現在它屬於你了。記住，魔杖只是工具，真正的力量來自於你的內心。」

艾莉亞接過魔杖，感到一股溫暖的力量從中傳來。她知道自己的人生從此將完全不同。

「現在，」院長說，「讓我們去見見你的同學們。他們都是來自世界各地的年輕魔法師，每個人都有自己獨特的天賦。」

他們走向學生宿舍，艾莉亞看到許多同齡的學生正在交流，分享彼此的魔法經驗。她感到既興奮又緊張，不知道自己在這個新世界中會遇到什麼樣的冒險。

「記住，」院長在離開前對她說，「魔法學院不僅僅是學習魔法的地方，它也是你的家。無論遇到什麼困難，都要相信自己的力量，相信你的朋友們。」

艾莉亞點點頭，看著院長離去的背影。她知道，從今天開始，她將踏上一段充滿魔法、友誼和冒險的旅程。

而這，只是開始。

遠處的鐘聲響起，宣告著晚餐時間的到來。艾莉亞深吸一口氣，走向學生們聚集的地方，準備開始她在魔法學院的新生活。

她不知道的是，在學院的深處，一個古老的預言正在應驗，而她的到來，正是這個預言中最重要的部分。

黑暗正在逼近，但光明也將隨之而來。艾莉亞·星月，這個名字將在魔法世界的歷史中留下深刻的印記。

而這一切，都將從明天開始。

當夜幕降臨，艾莉亞躺在宿舍的床上，看著窗外的星空，心中充滿了對未來的期待和對未知的恐懼。她知道，明天將是她在魔法學院的第一天，也是她人生新篇章的開始。

「願魔法與我同在，」她輕聲說道，然後閉上眼睛，準備迎接明天的挑戰。

在夢中，她看到了無數的魔法光芒，聽到了古老的咒語聲，感受到了來自內心深處的魔法力量。她知道，這不是夢，而是她真正的命運。

明天，她將正式成為一名魔法師。

明天，她將開始學習如何保護這個世界。

明天，她將發現自己真正的力量。

而這一切，都將從魔法學院開始。

艾莉亞·星月的魔法之旅，正式開始了。
    `.trim();

    // 更新現有章節的內容
    const updateResult = await client.query(`
      UPDATE chapters 
      SET full_text = $1, summary = $2
      WHERE story_id IN (
        SELECT story_id FROM stories 
        WHERE status = '投票中' OR status = '撰寫中'
        LIMIT 3
      )
      RETURNING chapter_id, title
    `, [
      longContent,
      '艾莉亞進入魔法學院，發現自己擁有強大的魔法力量，必須選擇是否留下學習魔法對抗即將到來的黑暗。'
    ]);

    console.log('✅ 已更新章節內容:');
    updateResult.rows.forEach(row => {
      console.log(`  - ${row.title} (ID: ${row.chapter_id})`);
    });

    // 如果沒有現有章節，創建一個新的測試章節
    if (updateResult.rows.length === 0) {
      console.log('\n📝 沒有現有章節，創建新的測試章節...');
      
      // 先創建測試故事
      const storyResult = await client.query(`
        INSERT INTO stories (story_id, story_serial, title, status, origin_voting_start_date)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING story_id
      `, [
        '550e8400-e29b-41d4-a716-446655440999',
        'T999',
        '魔法學院的秘密',
        '投票中'
      ]);

      const storyId = storyResult.rows[0].story_id;
      console.log('✅ 測試故事創建成功:', storyId);

      // 創建測試章節
      const chapterResult = await client.query(`
        INSERT INTO chapters (
          story_id, chapter_number, title, full_text, summary,
          voting_status, voting_deadline, voting_options, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING chapter_id
      `, [
        storyId,
        '001',
        '第一章：魔法學院的秘密',
        longContent,
        '艾莉亞進入魔法學院，發現自己擁有強大的魔法力量，必須選擇是否留下學習魔法對抗即將到來的黑暗。',
        '進行中',
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小時後截止
        JSON.stringify({
          options: [
            { id: 'A', content: '選擇留在魔法學院學習', description: '勇敢地接受挑戰，學習魔法對抗黑暗' },
            { id: 'B', content: '選擇離開回到平凡生活', description: '選擇安全的生活，遠離危險' },
            { id: 'C', content: '選擇先觀察再做決定', description: '謹慎地觀察情況，不急於做決定' }
          ],
          total_votes: 0
        }),
        JSON.stringify(['魔法', '學院', '冒險', '奇幻', '成長'])
      ]);

      const chapterId = chapterResult.rows[0].chapter_id;
      console.log('✅ 測試章節創建成功:', chapterId);
    }

    // 驗證更新結果
    const verifyResult = await client.query(`
      SELECT c.chapter_id, c.title, c.full_text, s.title as story_title
      FROM chapters c
      JOIN stories s ON c.story_id = s.story_id
      WHERE LENGTH(c.full_text) > 1000
      ORDER BY c.created_at DESC
      LIMIT 3
    `);

    console.log('\n📊 驗證結果:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.story_title}: ${row.title}`);
      console.log(`    內容長度: ${row.full_text.length} 字元`);
    });

    client.release();
    console.log('\n✅ 長測試內容添加完成！');
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await pool.end();
  }
}

// 執行函數
addLongTestContent().catch(console.error);
