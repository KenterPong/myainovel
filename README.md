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
src/
├── app/                 # App Router 頁面
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 首頁
│   └── globals.css     # 全域樣式
├── components/         # 可重用元件
├── lib/               # 工具函式
└── types/             # TypeScript 型別定義

public/
├── robots.txt         # 爬蟲規則
├── sitemap.xml        # 網站地圖
└── og-image.png       # 社群分享圖片
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個樣板！

## 📄 授權

MIT License
