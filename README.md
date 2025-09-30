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
```

## 📁 專案結構

```
myainovel/
├── public/                     # 靜態資源，直接透過 / 路徑訪問
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   └── images/                 # 圖片資源（非必須）
│       └── logo.png
│
├── src/                        # (官方推薦) 將所有程式碼放在 src 下
│   ├── app/                    # App Router 入口 (Next.js 13/14 標準)
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── origin/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
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
│   │   └── RightSidebar.tsx
│   │
│   ├── lib/                    # 共用函式庫 (官方建議名稱)
│   │   ├── hooks/              # React Hooks
│   │   └── utils/              # 工具函式
│   │
│   ├── styles/                 # 額外樣式 (若需模組化)
│   │   └── variables.css
│   │
│   └── types/                  # TypeScript 型別定義 (可選)
│       └── user.d.ts
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
- 網站圖示、Logo
- 社群分享圖片
- 其他靜態圖片資源

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
| `created_at` | `TIMESTAMP WITH TIME ZONE` | 記錄生成時間 | |

##### 3. `story_settings` (故事設定檔表)
儲存「故事聖經」- 角色與世界觀設定，是故事生成的核心檔案。

| 欄位名稱 | 資料類型 | 說明 | 備註 |
|---------|---------|------|------|
| `setting_id` | `SERIAL` | 主鍵 | |
| `story_id` | `UUID` | **外鍵**：指向所屬的故事 | 確保設定歸屬 |
| `setting_type` | `VARCHAR(50)` | **憲法級設定類別** | '角色', '世界觀', '大綱' - 不可動搖的存在 |
| `setting_data` | `JSONB` | **核心資料**：詳細的設定資訊和章節大綱 | **最重要欄位！** 持續更新 |
| `last_updated_at` | `TIMESTAMP WITH TIME ZONE` | 記錄最後更新時間 | 方便追蹤設定的修改 |

#### 資料表關聯設計

```
stories (1) ←→ (N) chapters
    ↓
    (1) ←→ (N) story_settings
```

- **`chapters.story_id`** → `stories.story_id` (外鍵)
- **`story_settings.story_id`** → `stories.story_id` (外鍵)

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

##### D. 投票選項格式 (`voting_options` 欄位)
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

#### 投票機制與自動生成規則

##### 章節生成後的自動化流程

1. **標籤生成**：
   - AI 根據章節內容自動生成 3-5 個搜尋標籤
   - 儲存在 `tags` JSONB 欄位中，方便讀者搜尋類似文章
   - 例：`["魔法學院", "校園生活", "考試挑戰"]`

2. **投票選項生成**：
   - AI 根據章節結尾自動生成 4 個選項供讀者投票
   - 每個選項包含內容、描述和初始票數（0票）
   - 儲存在 `voting_options` JSONB 欄位中

3. **投票機制**：
   - 設定投票截止時間（例：24小時後）
   - 讀者可選擇任一選項投票
   - 即時更新各選項票數

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
  - `'進行中'`：投票進行中
  - `'已截止'`：時間截止，等待處理
  - `'已生成'`：已根據投票結果生成下一章

#### 品質控制機制

- **憲法級設定不可動搖**：`setting_type` 為憲法級設定，在所有章節生成前就確定，不可改變
- **持續核對機制**：每次生成新章節前都要核對是否違背憲法級設定
- **違背處理**：如有違背，一律捨棄重新生成
- **大綱同步更新**：每次生成後都要更新章節大綱，確保 AI 每次都能讀取完整上下文
- **投票結果驗證**：生成新章節前驗證投票結果的合法性

## 📄 授權

MIT License
