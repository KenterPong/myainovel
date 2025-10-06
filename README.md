# Next.js 企業級樣板

這是一個預先配置了完整 SEO 優化、效能優化和開發工具的 Next.js 企業級樣板。

## 🚀 特色功能

### SEO 優化
- ✅ 完整的 metadata 設定
- ✅ Open Graph 和 Twitter Card 標籤
- ✅ 結構化資料 (Schema.org)
- ✅ 多語言支援
- ✅ robots.txt 和 sitemap.xml
- ✅ 搜尋引擎驗證標籤

### 效能優化
- ✅ 圖片優化 (WebP, AVIF)
- ✅ 壓縮設定
- ✅ 快取策略
- ✅ 程式碼分割

### 開發工具
- ✅ TypeScript 支援
- ✅ ESLint 和 Prettier
- ✅ Jest 測試框架
- ✅ 自動格式化
- ✅ 型別檢查

### 安全性
- ✅ 安全標頭設定
- ✅ XSS 防護
- ✅ CSRF 防護

### AI 故事生成
- ✅ OpenAI GPT-4o-mini 整合
- ✅ 結構化故事設定生成
- ✅ JSON 格式輸出與驗證
- ✅ 完整故事架構（角色、世界觀、大綱）
- ✅ 錯誤處理與資料清理
- ✅ 視覺化故事展示介面
- ✅ AI 章節插圖生成系統
- ✅ 故事風格一致性管理
- ✅ 插圖快取與效能優化

### 互動式投票系統
- ✅ 故事起源投票機制
- ✅ 章節投票統計系統
- ✅ 即時投票統計更新
- ✅ 防作弊機制（IP + Session 限制）
- ✅ 投票觸發 AI 生成
- ✅ 響應式投票介面
- ✅ 章節投票UI改進（收合功能、圖標導航）
- ✅ 三按鈕導航系統（上一章、章節列表、下一章）

## 📦 使用方式

### 1. 從樣板建立新專案

```bash
# 複製樣板
git clone https://github.com/KenterPong/nextjs-template.git 新專案名稱
cd 新專案名稱

# 移除舊的 git 歷史
rm -rf .git

# 安裝依賴
npm install

# 初始化新的 git 儲存庫
git init
git add .
git commit -m "Initial commit from template"
```

### 2. 自訂設定

修改以下檔案中的內容：

- `src/app/layout.tsx` - 網站標題、描述、作者資訊
- `public/robots.txt` - 爬蟲規則
- `public/sitemap.xml` - 網站地圖
- `next.config.js` - 重定向和安全設定

### 3. 資料庫設定

```bash
# 快速設定資料庫 (Windows)
scripts\setup-db.bat

# 快速設定資料庫 (Linux/macOS)
bash scripts/setup-db.sh

# 手動設定資料庫
npm run db:test    # 測試資料庫連線
npm run db:init    # 初始化資料庫
npm run db:sample  # 建立範例資料
npm run db:status  # 檢查資料庫狀態
```

### 4. 開發指令

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 啟動生產環境
npm start

# 程式碼檢查
npm run lint

# 自動修復
npm run lint:fix

# 型別檢查
npm run type-check

# 格式化程式碼
npm run format

# 執行測試
npm run test
```

## 🔧 自訂指南

### 修改網站資訊

1. **基本資訊**：編輯 `src/app/layout.tsx` 中的 metadata
2. **網域名稱**：替換所有 `your-domain.com` 為實際網域
3. **作者資訊**：更新 `authors` 和 `creator` 欄位
4. **社群圖片**：替換 `/og-image.png` 為實際圖片

### 新增頁面

1. 在 `src/app` 下建立新的資料夾
2. 新增 `page.tsx` 檔案
3. 更新 `sitemap.xml` 加入新頁面

### 環境變數

建立 `.env.local` 檔案：

```env
# 資料庫連線設定
DATABASE_URL=postgresql://username:password@localhost:5432/myainovel
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=myainovel
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# 網站設定
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# AI 服務設定
OPENAI_API_KEY=your-openai-api-key

# AI 插圖生成設定
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_IMAGE_QUALITY=standard
OPENAI_IMAGE_SIZE=1024x1024

# 圖片處理設定
IMAGE_OUTPUT_FORMAT=webp
IMAGE_QUALITY=85
IMAGE_STORAGE_PATH=public/images/stories

# 投票系統設定
NEXT_PUBLIC_VOTING_THRESHOLD=100    //票數達成門檻
NEXT_PUBLIC_VOTING_DURATION_DAYS=7  //投票持續天數
NEXT_PUBLIC_VOTING_COOLDOWN_HOURS=24  //可重複投票時間

# 章節投票系統設定
NEXT_PUBLIC_CHAPTER_VOTING_THRESHOLD=100  //章節投票選項達到此票數才觸發 AI 生成
NEXT_PUBLIC_CHAPTER_VOTING_DURATION_HOURS=24  //章節投票持續時間（小時）
NEXT_PUBLIC_CHAPTER_VOTING_COOLDOWN_HOURS=24  //章節投票冷卻時間（小時）
```

## 📁 專案結構

```
myainovel/
├── public/                     # 靜態資源，直接透過 / 路徑訪問
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   └── images/                 # 靜態圖片資源
│       ├── logo.png           # 網站 Logo
│       ├── default-illustration.png  # 預設章節插圖（插圖生成失敗時使用）
│       └── stories/           # AI 生成的章節插圖
│           └── {story_id}/    # 按故事 ID 分資料夾
│               └── {chapter_id}.webp  # 章節插圖（WebP 格式）
│
├── src/                        # (官方推薦) 將所有程式碼放在 src 下
│   ├── app/                    # App Router 入口 (Next.js 13/14 標準)
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── origin/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/                # API 路由
│   │   │   ├── origin/         # 故事起源投票 API
│   │   │   ├── stories/        # 故事相關 API
│   │   │   └── ai/             # AI 生成 API
│   │   ├── page.tsx            # Root page
│   │   ├── layout.tsx          # Root layout (全域共用框架)
│   │   ├── globals.css         # 全域 CSS (唯一允許的全域樣式)
│   │   ├── error.tsx           # 錯誤頁面
│   │   ├── loading.tsx         # 載入頁面
│   │   └── not-found.tsx       # 404 頁面
│   │
│   ├── components/             # 共用 React 元件
│   │   ├── ui/                 # 原子化 UI 元件 (Button, Input...)
│   │   ├── common/             # Layout 元件 (Header, Footer...)
│   │   ├── Header.tsx          # 現有元件
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── RightSidebar.tsx
│   │   ├── StoryCard.tsx       # 故事卡片組件
│   │   ├── ChapterVotingSection.tsx  # 章節投票區域
│   │   ├── ChapterNavigation.tsx     # 章節導航組件
│   │   ├── ChapterListModal.tsx      # 章節列表彈窗組件
│   │   ├── VoteOption.tsx      # 投票選項組件
│   │   ├── LoadingState.tsx    # 載入狀態組件
│   │   ├── ErrorState.tsx      # 錯誤狀態組件
│   │   └── EmptyState.tsx      # 空資料狀態組件
│   │
│   ├── lib/                    # 共用函式庫 (官方建議名稱)
│   │   ├── hooks/              # React Hooks
│   │   │   ├── useHomeData.ts  # 首頁資料獲取
│   │   │   ├── useChapterVoting.ts  # 章節投票管理
│   │   │   ├── useOriginVoting.ts   # 故事起源投票
│   │   │   └── useVotePolling.ts    # 投票統計輪詢
│   │   ├── utils/              # 工具函式
│   │   └── db.ts               # 資料庫連線
│   │
│   ├── styles/                 # 額外樣式 (若需模組化)
│   │   └── variables.css
│   │
│   └── types/                  # TypeScript 型別定義 (可選)
│       ├── story.ts            # 故事型別定義
│       ├── chapter.ts          # 章節型別定義
│       ├── voting.ts           # 投票型別定義
│       └── user.ts             # 用戶型別定義
│
├── .env.local                  # 環境變數 (gitignore)
├── next.config.js              # Next.js 設定檔
├── package.json
├── tsconfig.json               # TypeScript 設定
└── README.md
```

### 📂 資料夾說明

#### `src/components/` → 拆分 UI 元件（ui/ 與 common/ 分層）
- **`ui/`**: 原子化 UI 元件，如 Button、Input、Card 等基礎元件
- **`common/`**: Layout 元件，如 Header、Footer、Sidebar 等佈局相關元件

#### `src/lib/` → 共用函式庫（auth、db、utils、hooks）
- **`hooks/`**: 自定義 React Hooks
- **`utils/`**: 工具函式、輔助函式
- **`auth.ts`**: 驗證邏輯（可選）
- **`db.ts`**: 資料庫連線或 ORM（可選）

#### `src/types/` → 型別定義（TS 專案必備）
- 定義 TypeScript 介面和型別
- 提供型別安全性和更好的開發體驗

#### `src/styles/` → 額外樣式或 CSS Modules
- 模組化樣式檔案
- CSS 變數定義
- 主題相關樣式

#### `public/images/` → 靜態圖片（若需 SEO 或固定資產）
- **網站圖示、Logo**：favicon、網站標識等固定資源
- **社群分享圖片**：Open Graph 圖片、Twitter Card 圖片
- **預設插圖**：AI 插圖生成失敗時的備用圖片
- **其他靜態圖片資源**：不常變動的圖片資產

#### AI 生成插圖存放策略
- **主要存放**：本地伺服器 `public/images/stories/{story_id}/{chapter_id}.webp`
- **資料庫記錄**：插圖 URL 儲存在 `chapters.illustration_url` 欄位
- **格式優化**：WebP 格式，檔案大小減少 25-35%
- **解析度統一**：1024x1024 像素
- **存取方式**：透過自有伺服器交付，確保永久可用性
- **檔案管理**：按故事 ID 分資料夾存放，便於維護
- **效能優勢**：自有 CDN 控制，載入速度更快更穩定

## 🔧 重要檔案說明

### `favicon.svg` - 現代化網站圖示
- **用途**：提供向量格式的網站圖示，支援高解析度顯示
- **優點**：
  - 向量格式，在任何尺寸下都清晰
  - 檔案小，載入速度快
  - 支援深色/淺色主題自動切換
- **瀏覽器支援**：Chrome、Firefox、Safari、Edge 等現代瀏覽器
- **使用方式**：在 `layout.tsx` 中自動引用，無需手動設定

### `manifest.json` - PWA 漸進式網頁應用設定
- **用途**：讓網站可以安裝到手機桌面，像原生 App 一樣使用
- **功能特色**：
  - **離線使用**：支援 Service Worker 快取
  - **全螢幕體驗**：移除瀏覽器 UI，提供原生 App 感受
  - **快速啟動**：從桌面圖示直接開啟
  - **自訂主題**：設定應用程式的主題色彩
- **設定項目**：
  - `name`：應用程式完整名稱
  - `short_name`：桌面圖示顯示的簡短名稱
  - `theme_color`：應用程式主題色彩（#8B5CF6 紫色）
  - `background_color`：啟動畫面背景色
  - `icons`：不同尺寸的應用程式圖示
- **使用方式**：在 `layout.tsx` 中自動引用，支援 PWA 安裝

### 檔案引用設定
在 `src/app/layout.tsx` 中的設定：
```html
<head>
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/images/logo.png" />
  <link rel="manifest" href="/manifest.json" />
</head>
```

### 網站色彩計畫
1. 薰衣草紫 (#B39DD) - 主色系
  - 手機板和電腦版的 LOGO 文字顏色要一致，統一用薰衣草紫，於主要按鈕、連結、標題等重點元素

2. 珊瑚粉 (#FFB6B9) - 輔助色系
  - 用於次要按鈕、警告文字，流程步驟數字、投票截止時間，背景區塊等

3. 嫩綠 (#A8E6CF) - 中間色系
  - 用於成功狀態、進度條、達成標記等



## 🤖 AI 故事生成系統

### OpenAI 故事生成架構

本專案整合 **OpenAI GPT-4o-mini** 模型，實現完整的 AI 故事生成系統。透過結構化的提示詞工程和 JSON 格式輸出，確保生成的故事具有完整的故事架構和連貫性。

#### AI 故事生成流程

##### 1. 故事主題與背景設定生成
- **模型**：GPT-4o-mini
- **溫度設定**：0.8（平衡創意與一致性）
- **輸入**：使用者提供的原始提示詞
- **輸出**：結構化的故事設定 JSON

##### 2. 故事生成結構
AI 會根據以下 6 個核心要素生成完整的故事設定：

1. **故事標題** - 吸引人的故事名稱
2. **故事類型與背景世界觀** - 明確的類型定位和世界觀設定
3. **主要角色設定** - 至少 2-3 個主要角色，包含：
   - 角色名稱
   - 年齡
   - 角色定位
   - 性格特點
   - 背景故事
4. **故事核心衝突與主題** - 推動劇情發展的核心衝突
5. **故事背景環境描述** - 詳細的世界觀環境設定
6. **故事發展大綱** - 包含開頭、發展、高潮、結局的完整架構

##### 3. JSON 輸出格式
```json
{
    "title": "故事標題",
    "genre": "故事類型",
    "worldview": "背景世界觀描述",
    "characters": [
        {
            "name": "角色名稱",
            "age": "年齡",
            "role": "角色定位",
            "personality": "性格特點",
            "background": "背景故事"
        }
    ],
    "conflict": "核心衝突描述",
    "theme": "故事主題",
    "setting": "故事背景環境",
    "outline": {
        "beginning": "開頭設定",
        "development": "發展過程",
        "climax": "高潮情節",
        "ending": "結局安排"
    }
}
```

##### 4. 錯誤處理與資料清理
- **JSON 解析錯誤處理**：自動清理 AI 回應中的非 JSON 內容
- **格式驗證**：確保生成的 JSON 格式正確且完整
- **除錯模式**：當 JSON 解析失敗時，顯示原始回應供除錯
- **資料庫整合**：將 AI 生成結果對應到 PostgreSQL 資料庫欄位

###### 資料庫欄位對應關係
AI 生成的 JSON 結構會自動對應到以下資料庫欄位：

| AI 生成欄位 | 資料庫表 | 目標欄位 | 說明 |
|------------|---------|---------|------|
| `title` | `stories` | `title` | 故事標題直接儲存 |
| `genre` | `story_settings` | `setting_data` | 故事類型存入世界觀設定 |
| `worldview` | `story_settings` | `setting_data` | 世界觀描述存入設定檔 |
| `characters` | `story_settings` | `setting_data` | 角色設定存入設定檔 |
| `conflict` | `story_settings` | `setting_data` | 核心衝突存入設定檔 |
| `theme` | `story_settings` | `setting_data` | 故事主題存入設定檔 |
| `setting` | `story_settings` | `setting_data` | 背景環境存入設定檔 |
| `outline` | `story_settings` | `setting_data` | 故事大綱存入設定檔 |
| `created_at` | `stories` | `created_at` | 建立時間戳 |
| `story_id` | `stories` | `story_id` | 故事唯一識別碼 |

###### 資料庫儲存流程
1. **故事主表建立**：
   ```sql
   INSERT INTO stories (story_id, title, status, created_at)
   VALUES (?, ?, '投票中', ?)
   ```

2. **故事設定檔建立**：
   ```sql
   INSERT INTO story_settings (story_id, setting_type, setting_data, last_updated_at)
   VALUES 
   (?, '角色', ?, ?),
   (?, '世界觀', ?, ?),
   (?, '大綱', ?, ?)
   ```

3. **JSONB 資料結構**：
   ```json
   {
     "characters": [...],
     "worldview": "...",
     "conflict": "...",
     "theme": "...",
     "setting": "...",
     "outline": {...}
   }
   ```

##### 5. 系統提示詞設計
```
你是一位專業的小說作家和故事策劃師，擅長創作完整的故事架構。請確保回傳的JSON格式正確且完整。
```

##### 6. 視覺化展示
- 使用 Tailwind CSS 建立美觀的響應式介面
- 分區塊展示故事的各個要素
- 支援中文顯示和 UTF-8 編碼
- 提供關閉視窗功能

#### AI 章節插圖生成系統

本系統整合 **OpenAI DALL-E 3** 模型，為每個章節自動生成高品質插圖，提升閱讀體驗和視覺吸引力。

##### 插圖生成策略

###### 1. 成本控制與品質平衡
- **單章節單插圖**：每章節只生成一張高品質插圖，控制成本
- **載入速度優先**：使用 `standard` 品質設定，平衡生成速度與解析度
- **固定解析度**：統一使用 `1024x1024` 解析度，確保一致性
- **一次生成**：插圖生成後不再更新，避免重複成本

###### 2. 故事風格一致性管理
- **風格鎖定機制**：每個故事根據最外層類型設定固定畫風
- **風格提示詞預設**：預先定義各類型故事的風格提示詞模板
- **風格繼承**：所有章節插圖都繼承該故事的固定風格設定
- **風格驗證**：確保同一故事內所有插圖風格保持一致

###### 3. 故事類型與風格對應表

| 故事類型 | 風格名稱 | 風格特徵 | 色彩基調 |
|---------|---------|---------|---------|
| **科幻** | 賽博龐克插畫風 | 霓虹色彩、未來城市、高科技感 | 青藍、洋紅、黃色 |
| **奇幻** | 魔幻插畫風 | 魔法元素、神秘氛圍、史詩感 | 金黃、深紫、翠綠 |
| **都市** | 現代插畫風 | 簡約線條、都市生活、寫實感 | 灰藍、暖橙、米白 |
| **懸疑** | 暗黑插畫風 | 陰暗氛圍、神秘感、緊張感 | 深灰、暗紅、墨綠 |
| **愛情** | 浪漫插畫風 | 柔和色調、溫馨氛圍、情感表達 | 粉紅、淡紫、暖黃 |
| **冒險** | 動感插畫風 | 動態構圖、活力感、刺激感 | 鮮橙、亮藍、火紅 |

###### 4. 插圖生成流程

1. **章節內容分析**：
   - 分析章節標題和關鍵情節
   - 提取主要角色和場景描述
   - 識別情感基調和氛圍

2. **風格提示詞組合**：
   - 取得故事固定風格設定
   - 結合章節具體內容描述
   - 生成完整的插圖提示詞

3. **DALL-E 3 API 調用**：
   - 使用預設的品質和尺寸設定
   - 確保生成速度與品質平衡
   - 處理 API 錯誤和重試機制

4. **插圖處理與儲存**：
   - **AI 生成**：後端伺服器呼叫 OpenAI DALL-E 3 API 生成圖片
   - **下載圖片**：伺服器使用 API 返回的臨時 URL，立即下載原始檔案
   - **優化處理**：在伺服器端將圖片轉換為 WebP 格式，提升載入速度
   - **檔案命名**：使用章節 ID 作為檔名，確保唯一性
   - **本地儲存**：轉換後存到 `public/images/stories/{story_id}/{chapter_id}.webp`
   - **資料庫更新**：將永久圖片 URL 寫入 `chapters.illustration_url` 欄位
   - **網頁讀取**：Next.js 從資料庫讀取 URL，透過自有 CDN 交付圖片
   - **格式統一**：WebP 格式，1024x1024 解析度，優化檔案大小
   - **永久可用**：圖片儲存在自有伺服器，確保長期可用性

###### 5. 詳細實作流程

**步驟 1：AI 生成**
```typescript
// 呼叫 OpenAI DALL-E 3 API
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'dall-e-3',
    prompt: illustrationPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard'
  })
});
```

**步驟 2：下載圖片**
```typescript
// 從 OpenAI 臨時 URL 下載圖片
const imageResponse = await fetch(openaiImageUrl);
const imageBuffer = await imageResponse.arrayBuffer();
```

**步驟 3：優化處理**
```typescript
// 使用 Sharp 或其他圖片處理庫轉換為 WebP
import sharp from 'sharp';
const webpBuffer = await sharp(imageBuffer)
  .webp({ quality: 85 })
  .toBuffer();
```

**步驟 4：本地儲存**
```typescript
// 建立資料夾結構並儲存
const storyDir = `public/images/stories/${storyId}`;
const fileName = `${chapterId}.webp`;
const filePath = path.join(storyDir, fileName);

// 確保資料夾存在
await fs.mkdir(storyDir, { recursive: true });
await fs.writeFile(filePath, webpBuffer);
```

**步驟 5：更新資料庫**
```typescript
// 更新 chapters 表的 illustration_url 欄位
const illustrationUrl = `/images/stories/${storyId}/${chapterId}.webp`;
await query(
  'UPDATE chapters SET illustration_url = $1 WHERE chapter_id = $2',
  [illustrationUrl, chapterId]
);
```

###### 6. 插圖提示詞模板範例

**科幻類型 - 賽博龐克風格**：
```
Cyberpunk illustration style, neon colors, dark atmosphere, futuristic cityscape, detailed character design, high contrast lighting, digital art aesthetic. Scene: [章節場景描述]. Characters: [主要角色描述]. Mood: [情感氛圍]. Style: Clean lines, vibrant neon colors, high-tech elements.
```

**奇幻類型 - 魔幻風格**：
```
Fantasy illustration style, magical atmosphere, epic fantasy setting, detailed character design, mystical lighting, digital art aesthetic. Scene: [章節場景描述]. Characters: [主要角色描述]. Mood: [情感氛圍]. Style: Rich colors, magical elements, mystical atmosphere.
```

###### 7. 效能優化策略

- **異步生成**：章節內容立即返回，插圖在背景生成
- **WebP 格式**：自動轉換為 WebP 格式，檔案大小減少 25-35%
- **本地快取**：使用 Next.js 的圖片快取機制，避免重複下載
- **自有 CDN**：透過自有伺服器交付圖片，確保載入速度
- **錯誤處理**：插圖生成失敗時使用預設插圖或重試機制
- **載入優化**：使用 Next.js Image 組件進行自動格式轉換和尺寸優化
- **懶載入**：插圖採用懶載入策略，只在進入視窗時才載入
- **預載入**：重要章節的插圖可預先載入，提升用戶體驗
- **檔案管理**：按故事 ID 分資料夾存放，便於管理和維護

###### 8. 成本控制機制

- **預算監控**：追蹤每月插圖生成成本
- **品質分級**：根據故事重要性調整插圖品質
- **重複檢查**：避免為相同內容重複生成插圖
- **批次優化**：可選的批次生成功能以降低單次成本

## 🗄️ 資料庫設計

### PostgreSQL 資料庫架構

本專案使用 **PostgreSQL** 作為主要資料庫，支援 AI 故事生成的「故事聖經」和「長篇連貫性」功能。透過強大的 `JSONB` 欄位類型，有效儲存 AI 生成的複雜、非結構化資料。

#### 核心資料表設計

##### 1. `stories` (故事主表)
記錄每個故事的基本資訊和投票結果。

| 欄位名稱 | 資料類型 | 說明 | 備註 |
|---------|---------|------|------|
| `story_id` | `UUID` | **主鍵**：每個故事的唯一 ID | |
| `story_serial` | `VARCHAR(6)` | **流水序號**：A + 5碼數字編碼 | 例：A00001, A00002 |
| `title` | `VARCHAR(255)` | 故事名稱 | 由 AI 或作者命名 |
| `status` | `VARCHAR(50)` | 故事當前狀態 | '投票中', '撰寫中', '已完結' |
| `voting_result` | `JSONB` | 記錄最終票選結果 | 儲存故事類型、背景、主題的最終選項 |
| `current_chapter_id` | `INT` | 故事目前最新的章節 ID | 外鍵，指向 `chapters` 表 |
| `origin_voting_start_date` | `TIMESTAMP WITH TIME ZONE` | 起源開始投票日 | |
| `writing_start_date` | `TIMESTAMP WITH TIME ZONE` | 開始撰寫日 | |
| `completion_date` | `TIMESTAMP WITH TIME ZONE` | 完結日 | |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | 記錄創建時間 | |

##### 2. `chapters` (章節表)
記錄 AI 生成的每一個章節，確保劇情連貫性的核心資料表。

| 欄位名稱 | 資料類型 | 說明 | 備註 |
|---------|---------|------|------|
| `chapter_id` | `SERIAL` | **主鍵**：每個章節的唯一 ID | |
| `story_id` | `UUID` | **外鍵**：指向所屬的故事 | 確保章節歸屬 |
| `chapter_number` | `VARCHAR(3)` | **章節編碼**：3碼數字編碼 | 001, 002, 003... |
| `title` | `VARCHAR(255)` | 章節標題 | |
| `full_text` | `TEXT` | AI 生成的**完整**章節內容 | 供讀者閱讀 |
| `summary` | `TEXT` | **前情提要**：供 AI 撰寫下一章時使用的簡短摘要 | 關鍵欄位！ |
| `tags` | `JSONB` | **自動生成標籤**：AI 根據章節內容生成的搜尋標籤 | 例：["魔法學院", "校園生活", "考試挑戰"] |
| `voting_options` | `JSONB` | **投票選項**：AI 生成的四個選項供讀者投票 | 包含選項內容和票數 |
| `voting_deadline` | `TIMESTAMP WITH TIME ZONE` | **投票截止時間** | 自動設定倒數時間 |
| `voting_status` | `VARCHAR(20)` | **投票狀態** | '進行中', '已截止', '已生成' |
| `user_choice` | `VARCHAR(255)` | 該章節是根據哪個**讀者票選選項**生成的 | 例：'選項 B: 前往地下城' |
| `previous_summary_context` | `TEXT` | 生成此章節時，傳遞給 AI 的**前一章摘要** | 可選，用於追蹤上下文 |
| `illustration_url` | `TEXT` | **章節插圖 URL** | 本地儲存的圖片連結，格式：`/images/stories/{story_id}/{chapter_id}.webp` |
| `illustration_prompt` | `TEXT` | **插圖生成提示詞** | 用於生成插圖的 AI 提示詞 |
| `illustration_style` | `VARCHAR(100)` | **插圖風格** | 繼承自故事類型的固定風格 |
| `illustration_generated_at` | `TIMESTAMP WITH TIME ZONE` | **插圖生成時間** | 記錄插圖生成完成時間 |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | 記錄生成時間 | |

##### 3. `story_settings` (故事設定檔表)
儲存「故事聖經」- 角色與世界觀設定，是故事生成的核心檔案。

| 欄位名稱 | 資料類型 | 說明 | 備註 |
|---------|---------|------|------|
| `setting_id` | `SERIAL` | 主鍵 | |
| `story_id` | `UUID` | **外鍵**：指向所屬的故事 | 確保設定歸屬 |
| `setting_type` | `VARCHAR(50)` | **憲法級設定類別** | '角色', '世界觀', '大綱', '插圖風格' - 不可動搖的存在 |
| `setting_data` | `JSONB` | **核心資料**：詳細的設定資訊和章節大綱 | **最重要欄位！** 持續更新 |
| `last_updated_at` | `TIMESTAMP WITH TIME ZONE` | 記錄最後更新時間 | 方便追蹤設定的修改 |

##### 4. `origin_votes` (故事起源投票記錄表)
記錄每個使用者的投票行為，用於防重複投票和投票統計。

| 欄位名稱 | 資料類型 | 說明 | 備註 |
|---------|---------|------|------|
| `vote_id` | `UUID` | **主鍵**：每個投票記錄的唯一 ID | |
| `story_id` | `UUID` | **外鍵**：指向所屬的故事 | 確保投票歸屬 |
| `voter_ip` | `VARCHAR(45)` | **投票者 IP 地址** | 用於防重複投票 |
| `voter_session` | `VARCHAR(255)` | **投票者會話 ID** | 追蹤投票行為 |
| `outer_choice` | `VARCHAR(50)` | **故事類型選擇** | 對應 outer 分類選項 |
| `middle_choice` | `VARCHAR(50)` | **故事背景選擇** | 對應 middle 分類選項 |
| `inner_choice` | `VARCHAR(50)` | **故事主題選擇** | 對應 inner 分類選項 |
| `voted_at` | `TIMESTAMP WITH TIME ZONE` | **投票時間** | 用於時間限制檢查 |
| `user_agent` | `TEXT` | **瀏覽器資訊** | 可選，用於分析 |

##### 5. `origin_vote_totals` (故事起源投票統計表)
即時統計各選項的票數，用於快速查詢和門檻檢查。

| 欄位名稱 | 資料類型 | 說明 | 備註 |
|---------|---------|------|------|
| `total_id` | `SERIAL` | 主鍵 | |
| `story_id` | `UUID` | **外鍵**：指向所屬的故事 | 確保統計歸屬 |
| `category` | `VARCHAR(20)` | **投票分類** | 'outer', 'middle', 'inner' |
| `option_id` | `VARCHAR(50)` | **選項 ID** | 對應各分類的選項 |
| `vote_count` | `INTEGER` | **票數統計** | 即時更新，用於門檻檢查 |
| `last_updated` | `TIMESTAMP WITH TIME ZONE` | **最後更新時間** | 追蹤統計更新 |

##### 6. `chapter_votes` (章節投票記錄表)
記錄讀者對章節投票選項的投票行為，用於防重複投票和投票統計。

| 欄位名稱 | 資料類型 | 說明 | 備註 |
|---------|---------|------|------|
| `vote_id` | `UUID` | **主鍵**：每個投票記錄的唯一 ID | |
| `chapter_id` | `INTEGER` | **外鍵**：指向所屬的章節 | 確保投票歸屬 |
| `story_id` | `UUID` | **外鍵**：指向所屬的故事 | 確保投票歸屬 |
| `voter_ip` | `VARCHAR(45)` | **投票者 IP 地址** | 用於防重複投票 |
| `voter_session` | `VARCHAR(255)` | **投票者會話 ID** | 追蹤投票行為 |
| `option_id` | `VARCHAR(10)` | **投票選項** | 'A', 'B', 'C' |
| `voted_at` | `TIMESTAMP WITH TIME ZONE` | **投票時間** | 用於時間限制檢查 |
| `user_agent` | `TEXT` | **瀏覽器資訊** | 可選，用於分析 |

##### 7. `chapter_vote_totals` (章節投票統計表)
即時統計各章節投票選項的票數，用於快速查詢和門檻檢查。

| 欄位名稱 | 資料類型 | 說明 | 備註 |
|---------|---------|------|------|
| `total_id` | `SERIAL` | 主鍵 | |
| `chapter_id` | `INTEGER` | **外鍵**：指向所屬的章節 | 確保統計歸屬 |
| `story_id` | `UUID` | **外鍵**：指向所屬的故事 | 確保統計歸屬 |
| `option_id` | `VARCHAR(10)` | **投票選項** | 'A', 'B', 'C' |
| `vote_count` | `INTEGER` | **票數統計** | 即時更新，用於門檻檢查 |
| `last_updated` | `TIMESTAMP WITH TIME ZONE` | **最後更新時間** | 追蹤統計更新 |

#### 資料表關聯設計

```
stories (1) ←→ (N) chapters
    ↓
    (1) ←→ (N) story_settings
    ↓
    (1) ←→ (N) origin_votes
    ↓
    (1) ←→ (N) origin_vote_totals

chapters (1) ←→ (N) chapter_votes
    ↓
    (1) ←→ (N) chapter_vote_totals
```

- **`chapters.story_id`** → `stories.story_id` (外鍵)
- **`story_settings.story_id`** → `stories.story_id` (外鍵)
- **`origin_votes.story_id`** → `stories.story_id` (外鍵)
- **`origin_vote_totals.story_id`** → `stories.story_id` (外鍵)
- **`chapter_votes.chapter_id`** → `chapters.chapter_id` (外鍵)
- **`chapter_votes.story_id`** → `stories.story_id` (外鍵)
- **`chapter_vote_totals.chapter_id`** → `chapters.chapter_id` (外鍵)
- **`chapter_vote_totals.story_id`** → `stories.story_id` (外鍵)

#### JSONB 欄位格式範例

##### A. 角色設定 (`setting_type` = '角色')
```json
{
  "name": "叢雲清",
  "archetype": "主角",
  "appearance": "銀色短髮，右眼角有微小疤痕。",
  "personality": "冷靜、聰明、內斂，優先考慮邏輯而非情感。",
  "motto": "「行動勝於空談。」",
  "goal": "尋找失蹤的家族遺物。",
  "status": "健康，擁有基礎駭客能力。"
}
```

##### B. 世界觀設定 (`setting_type` = '世界觀')
```json
{
  "era": "近未來 (2077 年)",
  "location": "新東京，一座賽博龐克城市。",
  "technology_level": "高度發達，但貧富差距懸殊，企業控制一切。",
  "magic_rules": "無魔法，僅有先進的生物義肢和 AI 網路。",
  "key_factions": [
    {"name": "宙斯企業", "role": "主要反派"},
    {"name": "黑市網絡", "role": "情報中介"}
  ]
}
```

##### C. 章節大綱 (`setting_type` = '大綱')
```json
{
  "chapter_summaries": [
    {
      "chapter_number": "001",
      "title": "覺醒",
      "summary": "叢雲清在廢棄實驗室中醒來，發現自己擁有特殊能力...",
      "key_events": ["能力覺醒", "遇到神秘組織", "發現身世線索"],
      "character_development": "主角從迷茫到堅定，開始接受自己的使命"
    }
  ],
  "overall_arc": "主角的成長歷程，從普通人到拯救世界的英雄",
  "current_status": "第一章完成，準備進入第二章"
}
```

##### D. 插圖風格設定 (`setting_type` = '插圖風格')
```json
{
  "story_genre": "科幻",
  "style_name": "賽博龐克插畫風",
  "style_prompt": "Cyberpunk illustration style, neon colors, dark atmosphere, futuristic cityscape, detailed character design, high contrast lighting, digital art aesthetic",
  "color_palette": ["#00FFFF", "#FF00FF", "#FFFF00", "#000000"],
  "art_style": "Digital illustration with clean lines and vibrant neon colors",
  "mood": "Dark, mysterious, high-tech",
  "character_style": "Anime-inspired character design with cyberpunk elements"
}
```

##### E. 投票選項格式 (`voting_options` 欄位)
```json
{
  "options": [
    {
      "id": "A",
      "content": "選擇紅色的火焰之門",
      "votes": 25,
      "description": "勇敢地選擇火焰的力量，可能獲得攻擊性魔法"
    },
    {
      "id": "B", 
      "content": "選擇藍色的冰霜之門",
      "votes": 18,
      "description": "選擇冰霜的智慧，可能獲得防禦性魔法"
    },
    {
      "id": "C",
      "content": "選擇綠色的自然之門", 
      "votes": 32,
      "description": "選擇自然的平衡，可能獲得治療性魔法"
    },
    {
      "id": "D",
      "content": "嘗試同時打開三道門",
      "votes": 15,
      "description": "冒險嘗試，可能獲得所有力量或面臨危險"
    }
  ],
  "total_votes": 90,
  "deadline": "2024-01-15T18:00:00Z"
}
```

#### AI 創作流程

1. **故事設定生成階段**：
   - 接收使用者原始提示詞
   - 呼叫 OpenAI API 生成完整故事設定 JSON
   - 驗證 JSON 格式並清理錯誤內容
   - 將生成結果對應儲存到資料庫：
     - `stories` 表：儲存基本資訊（標題、狀態、時間戳）
     - `story_settings` 表：分別儲存角色、世界觀、大綱設定

2. **章節創作前**：
   - 查詢 `story_settings` 取得憲法級設定（角色、世界觀）
   - 查詢 `chapters` 取得前一章的 `summary`
   - 查詢 `story_settings` 的章節大綱了解整體劇情發展

3. **整合 Prompt**：
   - 將憲法級設定、前一章摘要、章節大綱組合成完整上下文
   - 確保 AI 理解角色性格、世界觀規則、劇情脈絡

4. **章節創作後**：
   - 儲存新章節的 `full_text` 和 AI 生成的 `summary`
   - **同步更新** `story_settings` 的章節大綱 `setting_data`
   - 核對新章節是否符合憲法級設定，違背則重新生成
   - **生成章節插圖**：根據故事類型風格和章節內容生成對應插圖
   - **儲存插圖資訊**：將插圖 URL、提示詞、風格等資訊存入資料庫

#### 故事起源投票機制

##### 基本投票規則

1. **投票門檻**：每個分類需要達到 100 票才能觸發 AI 生成
2. **投票限制**：每個 IP 地址每 24 小時只能投票一次
3. **投票有效期**：投票活動持續 7 天
4. **觸發條件**：三個分類都達到 100 票時自動觸發 AI 故事生成
5. **新故事建立**：如果指定的故事 ID 不存在，系統會自動建立新故事並開始投票

##### 投票防作弊機制

1. **IP 限制**：同一 IP 短時間內只能投票一次
2. **會話追蹤**：使用會話 ID 追蹤投票行為
3. **時間限制**：24 小時內同一 IP 和會話組合只能投票一次
4. **投票驗證**：檢查投票時間是否在有效期內

##### 即時投票統計

1. **即時更新**：投票後立即更新統計數據
2. **結果展示**：顯示各選項的即時票數和排名
3. **門檻監控**：即時檢查是否達到 100 票門檻
4. **最終結果**：投票結束後公布最終結果並觸發 AI 生成
5. **新的投票**：AI生成存到資料庫後，就將所有投票紀錄清空，開始新一輪投票

##### 投票 API 端點

**故事起源投票**：
- **POST `/api/origin/vote`**：提交投票
- **GET `/api/origin/vote?storyId=xxx`**：獲取投票統計
- **POST `/api/origin/clear-votes`**：清空投票記錄（內部使用）

**章節投票**：
- **POST `/api/stories/[id]/chapters/[chapterId]/vote`**：提交章節投票
- **GET `/api/stories/[id]/chapters/[chapterId]/vote`**：獲取章節投票統計

##### 章節投票 API 端點詳細說明

###### 1. 章節投票 API
```typescript
// POST /api/stories/[id]/chapters/[chapterId]/vote
interface ChapterVoteRequest {
  optionId: string; // 'A', 'B', 'C'
  voterSession: string;
}

interface ChapterVoteResponse {
  success: boolean;
  data: {
    voteCounts: {
      A: number;
      B: number;
      C: number;
    };
    totalVotes: number;
    userVoted: boolean;
    thresholdReached: boolean;
    triggerGeneration: boolean;
  };
}
```

###### 2. 投票統計 API
```typescript
// GET /api/stories/[id]/chapters/[chapterId]/vote
interface VoteStatsResponse {
  success: boolean;
  data: {
    chapterId: number;
    votingStatus: '投票中' | '已投票' | '投票截止';
    votingDeadline: string;
    voteCounts: {
      A: number;
      B: number;
      C: number;
    };
    totalVotes: number;
    userVoted: boolean;
    userChoice?: string;
    threshold: number;
  };
}
```

##### 環境變數設定

投票系統的門檻和時間設定可透過環境變數調整，無需修改程式碼：

| 環境變數 | 預設值 | 說明 |
|---------|--------|------|
| `NEXT_PUBLIC_VOTING_THRESHOLD` | 100 | 每個分類達到此票數才觸發 AI 生成 |
| `NEXT_PUBLIC_VOTING_DURATION_DAYS` | 7 | 投票活動持續天數 |
| `NEXT_PUBLIC_VOTING_COOLDOWN_HOURS` | 24 | 同一 IP 投票冷卻時間（小時） |
| `NEXT_PUBLIC_CHAPTER_VOTING_THRESHOLD` | 100 | 章節投票選項達到此票數才觸發 AI 生成 |
| `NEXT_PUBLIC_CHAPTER_VOTING_DURATION_HOURS` | 24 | 章節投票持續時間（小時） |
| `NEXT_PUBLIC_CHAPTER_VOTING_COOLDOWN_HOURS` | 24 | 章節投票冷卻時間（小時） |

**設定位置**：在 `.env.local` 檔案中修改這些變數值即可調整投票規則。

#### 章節投票機制與自動生成規則

##### 章節投票統計系統完整架構

本系統實現了完整的章節投票統計功能，包含投票記錄、即時統計、防作弊機制和自動觸發 AI 生成等核心功能。

##### 章節生成後的自動化流程

1. **標籤生成**：
   - AI 根據章節內容自動生成 3-5 個搜尋標籤
   - 儲存在 `tags` JSONB 欄位中，方便讀者搜尋類似文章
   - 例：`["魔法學院", "校園生活", "考試挑戰"]`

2. **投票選項生成**：
   - AI 根據章節結尾自動生成 3 個選項供讀者投票
   - 每個選項包含內容、描述和初始票數（0票）
   - 儲存在 `voting_options` JSONB 欄位中

3. **投票機制**：
   - 設定投票截止時間（例：24小時後）
   - 讀者可選擇任一選項投票
   - 即時更新各選項票數
   - 記錄投票行為到 `chapter_votes` 表
   - 即時更新 `chapter_vote_totals` 統計表

4. **防作弊機制**：
   - **IP + Session 限制**：同一 IP 和會話組合在冷卻時間內只能投票一次
   - **時間限制**：投票必須在有效期內進行
   - **選項驗證**：確保投票選項有效（A、B、C）
   - **重複投票檢查**：防止同一用戶重複投票

5. **章節顯示與導航**：
   - **新章節置頂**：新生成的章節自動置頂顯示
   - **跨故事排序**：**所有章節混合**按生成時間由新到舊排序，不區分故事
   - **章節導航**：非第一章節時顯示左右箭頭，可跳轉前後章節
   - **故事篩選**：點擊故事標題可篩選該故事的所有章節

##### 投票觸發 AI 生成條件

1. **單一選項達到門檻**：任一選項票數達到環境設定門檻（預設 100 票）
2. **立即觸發生成**：直接生成新章節內容，不帶入讀者選擇參數
3. **更新章節狀態**：將投票狀態更新為「投票截止」
4. **新章節置頂**：新章節自動置頂顯示，舊章節保持顯示在下方

##### 投票流程圖
```
用戶投票 → 更新統計 → 檢查門檻 → 達到門檻？
                                    ↓
                              是：觸發 AI 生成
                                    ↓
                              更新章節狀態
```

##### 自動生成下一章的條件

**條件一：單一選項達到 100 票**
- 任一選項票數達到 100 票時，立即生成下一章
- 使用該選項作為故事走向

**條件二：總票數達到 100 票 + 時間截止**
- 所有選項合計達到 100 票
- 且投票時間已截止
- 使用得票最高的選項生成下一章

**條件三：時間截止但未達 100 票**
- 投票時間截止
- 總票數未達到 100 票
- 自動生成大結局章節，結束故事

##### 投票狀態管理

- `voting_status` 欄位追蹤投票狀態：
  - `'投票中'`：讀者還沒有針對這個章節投票，或投票冷卻時間已過（24小時後）
  - `'已投票'`：讀者已針對這個章節投票，但投票尚未達標
  - `'投票截止'`：讀者投票已達標並已生成新的章節，投票選項已鎖定

##### 投票狀態轉換規則

1. **初始狀態**：新章節建立時為 `'投票中'`
2. **投票後**：用戶投票後立即變為 `'已投票'`，並顯示用戶選擇的選項
3. **冷卻時間**：投票後 24 小時內保持 `'已投票'` 狀態，無法再次投票
4. **冷卻結束**：24 小時後自動變回 `'投票中'`，允許再次投票
5. **達標觸發**：任一選項達到門檻票數時，立即變為 `'投票截止'` 並觸發 AI 生成
6. **新章節置頂**：AI 生成新章節後，新章節立即置頂顯示給讀者

##### 投票選項顯示規則

- **投票中**：顯示所有選項，用戶可選擇投票
- **已投票**：顯示所有選項，用戶選擇的選項有明顯反白標示
- **投票截止**：顯示所有選項，得票最高的選項有明顯反白標示

#### 品質控制機制

- **憲法級設定不可動搖**：`setting_type` 為憲法級設定，在所有章節生成前就確定，不可改變
- **持續核對機制**：每次生成新章節前都要核對是否違背憲法級設定
- **違背處理**：如有違背，一律捨棄重新生成
- **大綱同步更新**：每次生成後都要更新章節大綱，確保 AI 每次都能讀取完整上下文
- **投票結果驗證**：生成新章節前驗證投票結果的合法性

## 🏠 首頁系統

### 首頁功能架構

首頁是平台的核心入口，整合了故事展示、投票參與和用戶互動等主要功能。

### 章節導航功能設計

#### 三按鈕導航系統
```
[←] [📋] [→]
 ↑   ↑   ↑
上一章 章節列表 下一章
```

**按鈕功能說明**：
- **左按鈕 (←)**：跳轉到上一章節，第一章節時隱藏
- **中間按鈕 (📋)**：動態功能按鈕
  - 章節閱讀模式：顯示章節列表圖標，點擊展開該故事所有章節
  - 章節列表模式：顯示回首頁圖標，點擊返回首頁
- **右按鈕 (→)**：跳轉到下一章節，最後章節時隱藏

#### 章節列表視圖設計
- **展開方式**：點擊中間按鈕在當前章節內容下方展開
- **列表內容**：顯示該故事所有章節，包含章節狀態標識
- **章節狀態**：
  - 已完成：綠色圓點或勾號
  - 投票中：黃色圓點或時鐘圖標
  - 生成中：藍色圓點或載入圖標
  - 未開始：灰色圓點或鎖定圖標
  - 當前章節：特殊高亮樣式
- **互動功能**：點擊章節跳轉、關閉列表、滾動支援

#### 投票UI改進
- **投票項目收合**：預設收合狀態，點擊展開投票選項
- **導航按鈕圖標化**：移除文字，使用與底部導航一致的圖標風格
- **響應式設計**：桌面版和移動版都有良好的顯示效果

#### 主要功能區塊

##### 1. 故事展示區域
- **最新章節**：顯示**跨故事**所有章節內容，按生成時間由新到舊排序
- **章節插圖**：每個章節上方顯示對應的 AI 生成插圖
- **故事卡片**：包含故事標題、章節資訊、投票狀態
- **章節導航**：非第一章節時顯示左右箭頭，可跳轉前後章節
- **故事篩選**：點擊故事標題可篩選該故事的所有章節
- **互動統計**：顯示點讚、評論、分享數量

##### 2. 熱門故事區域
- **熱門故事列表**：顯示熱門故事，按故事生成時間由新到舊排序
- **故事資訊**：包含故事標題、狀態（投票中/撰寫中/已完結）、總章數
- **狀態標識**：
  - 投票中：黃色圓點或時鐘圖標
  - 撰寫中：藍色圓點或編輯圖標
  - 已完結：綠色圓點或勾號圖標
- **章數統計**：顯示該故事目前的總章節數

##### 3. 投票系統整合
- **故事起源投票**：讀者可參與故事基本設定的投票
- **章節投票**：讀者可對正在投票的章節進行投票
- **即時統計**：顯示各選項的即時票數和百分比
- **投票倒數**：顯示投票截止時間倒數
- **投票結果**：已截止的投票顯示最終結果

##### 4. 用戶體驗優化
- **響應式設計**：支援手機版和桌面版
- **載入狀態**：提供良好的載入體驗
- **錯誤處理**：完善的錯誤提示和重試機制
- **滑動操作**：支援手勢滑動切換頁面

#### 資料整合架構

##### 首頁資料獲取策略
```typescript
interface HomePageData {
  stories: StoryWithChapter[];
  popularStories: PopularStory[];
}

interface PopularStory {
  story_id: string;
  title: string;
  status: '投票中' | '撰寫中' | '已完結';
  total_chapters: number;
  created_at: string;
  last_updated: string;
}

interface StoryWithChapter {
  // 來自 stories 表
  story_id: string;
  title: string;
  status: '投票中' | '撰寫中' | '已完結';
  created_at: string;
  
  // 來自 chapters 表 (最新章節)
  current_chapter: {
    chapter_id: number;
    chapter_number: string;
    title: string;
    full_text: string;
    summary: string;
    tags: string[];
    voting_status: '投票中' | '已投票' | '投票截止';
    voting_deadline?: string;
    voting_options?: VotingOption[];
    illustration_url?: string;
    illustration_prompt?: string;
    illustration_style?: string;
    illustration_generated_at?: string;
    created_at: string;
  };
  
  // 來自 chapter_vote_totals 表
  vote_stats?: {
    A: number;
    B: number;
    C: number;
    total: number;
  };
  
  // 來自 story_settings 表
  settings?: {
    characters?: any;
    worldview?: any;
    outline?: any;
    illustration_style?: any;
  };
}
```

##### API 端點整合
- `GET /api/stories` - 獲取故事列表
- `GET /api/stories/[id]` - 獲取故事詳情
- `GET /api/stories/[id]/chapters` - 獲取章節列表
- `GET /api/stories/popular` - 獲取熱門故事列表（按生成時間排序）
- `GET /api/origin/vote?storyId=xxx` - 獲取故事起源投票統計
- `GET /api/stories/[id]/chapters/[chapterId]/vote` - 獲取章節投票統計

##### 資料流程
1. **首頁載入**：獲取所有章節的基本資訊和熱門故事列表
2. **跨故事排序**：**所有章節混合**按 `created_at` 時間戳由新到舊排序
3. **熱門故事排序**：按故事生成時間由新到舊排序
4. **投票狀態**：檢查故事起源和章節投票狀態
5. **即時更新**：定期更新投票統計和狀態
6. **新章節置頂**：新生成的章節自動置頂，舊章節保持顯示

##### 章節排序策略
- **首頁顯示**：跨故事按章節生成時間排序，可能出現不同故事章節穿插
- **故事篩選**：點擊故事標題後，只顯示該故事的章節，按新到舊排序
- **導航功能**：在故事篩選模式下，左右箭頭跳轉該故事的前後章節

#### 技術實作

##### 自定義 Hooks

###### 1. useHomeData - 首頁資料獲取
```typescript
export function useHomeData() {
  const [stories, setStories] = useState<StoryWithChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 獲取故事列表和最新章節
  // 處理載入狀態和錯誤
  // 提供重新載入功能
}
```

###### 2. useChapterVoting - 章節投票管理
```typescript
export function useChapterVoting(chapterId: number) {
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [userVoted, setUserVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 獲取投票統計
  // 提交投票
  // 即時更新統計
  // 檢查門檻觸發
}
```

###### 3. useVotePolling - 投票統計輪詢
```typescript
export function useVotePolling(chapterId: number, enabled: boolean) {
  // 定期更新投票統計
  // 處理網路錯誤
  // 優化輪詢頻率
}
```

###### 4. useOriginVoting - 故事起源投票
```typescript
export function useOriginVoting(storyId: string) {
  // 故事起源投票狀態管理
  // 投票提交和統計更新
  // 門檻檢查和觸發邏輯
}

###### 5. usePopularStories - 熱門故事管理
```typescript
export function usePopularStories() {
  const [popularStories, setPopularStories] = useState<PopularStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 獲取熱門故事列表（按生成時間排序）
  // 處理載入狀態和錯誤
  // 提供重新載入功能
}

##### 組件架構

###### 1. StoryCard - 故事卡片組件
```typescript
interface StoryCardProps {
  story: StoryWithChapter;
  onVote?: (optionId: string) => void;
  onViewDetails?: () => void;
}
```

###### 2. ChapterVotingSection - 章節投票區域
```typescript
interface VotingSectionProps {
  chapterId: number;
  votingOptions: VotingOption[];
  voteStats: VoteStats;
  onVote: (optionId: string) => void;
  disabled?: boolean;
}
```

###### 3. VoteOption - 投票選項組件
```typescript
interface VoteOptionProps {
  option: VotingOption;
  voteCount: number;
  percentage: number;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}
```

###### 4. PopularStoryCard - 熱門故事卡片組件
```typescript
interface PopularStoryCardProps {
  story: PopularStory;
  onViewStory?: (storyId: string) => void;
}
```

###### 5. 狀態管理組件
- `LoadingState` - 載入狀態組件
- `ErrorState` - 錯誤狀態組件
- `EmptyState` - 空資料狀態組件

##### 型別定義
```typescript
interface StoryWithChapter {
  story_id: string;
  title: string;
  status: '投票中' | '撰寫中' | '已完結';
  current_chapter: {
    chapter_id: number;
    title: string;
    voting_status: '投票中' | '已投票' | '投票截止';
    voting_options?: VotingOption[];
  };
  origin_voting?: {
    voteCounts: any;
    allThresholdsReached: boolean;
  };
  chapter_voting?: {
    voteCounts: { A: number; B: number; C: number };
    totalVotes: number;
  };
}

interface PopularStory {
  story_id: string;
  title: string;
  status: '投票中' | '撰寫中' | '已完結';
  total_chapters: number;
  created_at: string;
  last_updated: string;
}
```

#### 效能優化

##### 關鍵技術考量

###### 1. 資料快取策略
- **React Query 快取** - 快取 API 資料
- **智慧型更新** - 避免不必要的 API 呼叫
- **本地狀態同步** - 確保 UI 與後端資料一致

###### 2. 分頁載入機制
- **無限滾動** - 載入更多故事
- **虛擬滾動** - 處理大量投票選項
- **懶載入** - 圖片和組件按需載入

###### 3. 樂觀更新策略
- **立即更新 UI** - 投票後立即顯示結果
- **後端驗證** - 確保投票有效性
- **錯誤回滾** - 投票失敗時恢復原狀態

###### 4. 投票限制策略
- **IP + Session 限制** - 防止重複投票
- **時間窗口限制** - 投票有效期管理
- **頻率限制** - 防止惡意投票

###### 5. 即時更新策略
- **輪詢機制** - 定期更新投票統計
- **WebSocket** - 即時推送更新（可選）
- **狀態同步** - 確保多用戶間資料一致

##### 用戶體驗設計

###### 投票流程
1. **載入狀態** - 顯示載入動畫
2. **投票選項** - 清晰的選項展示
3. **即時統計** - 動態更新票數和百分比
4. **投票回饋** - 成功投票後的視覺回饋
5. **結果展示** - 投票截止後的結果展示
6. **AI 生成提示** - 達到門檻時的生成提示

###### 響應式設計
- **手機版** - 垂直排列投票選項
- **桌面版** - 網格排列投票選項
- **平板版** - 自適應佈局

###### 效能優化
- **載入狀態指示器** - 提供良好的載入體驗
- **錯誤重試機制** - 完善的錯誤提示和重試機制
- **響應式動畫效果** - 流暢的用戶互動體驗

#### 驗收標準

##### 用戶體驗
- 載入狀態指示器
- 錯誤重試機制
- 響應式動畫效果

## 📄 授權

MIT License
