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

### 3. 開發指令

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
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
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


## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個樣板！

## 📄 授權

MIT License
