## 🚀 分階段執行計畫

### 階段 1：優化與測試 (優先級：低)
**目標**：效能優化、錯誤處理、用戶體驗完善

#### 1.1 效能優化
- [ ] 實作投票輪詢機制
- [ ] 優化資料載入策略
- [ ] 實作內容懶載入
- [ ] 優化插圖載入效能
- [ ] 實作插圖快取機制

#### 1.2 錯誤處理
- [ ] 完善載入狀態處理
- [ ] 實作錯誤重試機制
- [ ] 添加用戶友好的錯誤提示
- [ ] 實作插圖生成失敗降級處理

#### 1.3 測試與驗收
- [ ] 功能測試
- [ ] 響應式測試
- [ ] 效能測試
- [ ] 用戶體驗測試
- [ ] 插圖生成品質測試

### 階段 2：章節滿意度投票與社群分享系統 (優先級：中)
**目標**：增加讀者互動參與度，提升社群擴散效果

> **💡 優化重點**：這是一個**高效率、高擴散性**的互動設計方案，專注於**圖片生成品質**和**API 響應速度**的優化。

#### 🚀 核心優化建議
- **資料庫優化**：`vote_type` 數值化儲存提升查詢速度
- **API 效能**：GET 統計 API 響應速度 < 200ms
- **用戶體驗**：載入狀態指示器避免重複點擊
- **社群分享**：移除 Instagram，專注於 X、Facebook、Line
- **圖片處理**：圖像感知壓縮優化視覺品質
- **數據分析**：儀表板視覺化提供直觀洞察

#### 2.1 資料庫擴展（優化版）
- [ ] 建立 `chapter_satisfaction_votes` 表
  - `vote_id` (SERIAL PRIMARY KEY)
  - `chapter_id` (INTEGER REFERENCES chapters)
  - `vote_type` (SMALLINT) - **優化：數值化儲存** (1=like, 2=star, 3=fire, 4=heart)
  - `ip_address` (INET) - 防重複投票
  - `user_agent` (TEXT) - 瀏覽器資訊
  - `created_at` (TIMESTAMP) - 投票時間
- [ ] 建立 `chapter_shares` 表
  - `share_id` (SERIAL PRIMARY KEY)
  - `chapter_id` (INTEGER REFERENCES chapters)
  - `platform` (VARCHAR(20)) - 'twitter', 'facebook', 'line' (**移除 instagram**)
  - `ip_address` (INET) - 統計分析
  - `created_at` (TIMESTAMP) - 分享時間
- [ ] 建立相關索引優化查詢效能
- [ ] **優化：數值化 vote_type 提升查詢速度**

#### 2.2 滿意度投票功能開發（低門檻高回饋）
- [ ] 建立滿意度投票 API 端點
  - `POST /api/stories/[id]/chapters/[chapterId]/satisfaction` - 提交投票
  - `GET /api/stories/[id]/chapters/[chapterId]/satisfaction` - 獲取統計
  - **優化：確保 GET API 響應速度極快**（影響頁面載入速度）
- [ ] 實作投票限制機制（IP 防重複投票）
- [ ] 建立滿意度投票組件
  - 2x2 網格排列的表情符號按鈕（👍 喜歡、⭐ 精彩、🔥 超讚、💖 感動）
  - 即時顯示總票數
  - **優化：載入狀態指示器**（點擊後立即顯示「載入中」狀態）
  - 投票後視覺回饋
- [ ] 整合到章節卡片中

#### 2.3 社群分享功能開發（擴散關鍵）
- [ ] 建立社群分享 API 端點
  - `POST /api/stories/[id]/chapters/[chapterId]/share` - 記錄分享
  - `GET /api/stories/[id]/chapters/[chapterId]/share-stats` - 獲取分享統計
- [ ] 實作分享文案自動生成
  - 根據平台調整字元限制（Twitter 60字元，其他 80-100字元）
  - **優化：動態生成 Hashtag**（品牌 + 類型 + **實際故事類型**）
  - 包含章節摘要和表情符號
- [ ] 實作圖片分享優化
  - 預生成各平台專用尺寸圖片
  - **優化：圖像感知壓縮**（Perceptual Quality）而非單純數值壓縮
  - WebP 格式優化
  - 檔案命名規範：`{chapter_id}_{platform}.webp`
- [ ] 建立社群分享組件
  - 支援 3 個平台按鈕（X、Facebook、Line）
  - **優化：Instagram 導向限時動態教學頁面**
  - 一鍵分享功能
  - **優化：分享成功提示訊息**（精緻動畫或感謝語）
  - 分享統計顯示

#### 2.4 環境變數設定（優化版）
- [ ] 新增社群分享相關環境變數：
  - `SOCIAL_SHARE_ENABLED=true`
  - `SOCIAL_SHARE_PLATFORMS=twitter,facebook,line` (**移除 instagram**)
  - `SOCIAL_HASHTAG_MAIN=#AIStepMasterS1`
  - `SOCIAL_HASHTAG_TYPE=#AI小說` (**優化：支援動態故事類型**)
  - `SOCIAL_SHARE_MAX_LENGTH=100`
  - `SOCIAL_SHARE_INCLUDE_EXCERPT=true`
  - `SOCIAL_IMAGE_GENERATE_SIZES=true`
  - `SOCIAL_IMAGE_QUALITY=85` (**優化：使用圖像感知壓縮**)
  - `SOCIAL_IMAGE_FORMAT=webp`

#### 2.5 圖片分享優化整合
- [ ] 修改 `IllustrationService` 支援多尺寸生成
- [ ] **優化：確保原本插圖先生成完成，再考慮分享圖片生成**
- [ ] **優化：暫時停用分享圖片生成，專注於核心插圖功能**
- [ ] 建立分享圖片儲存目錄結構
- [ ] 實作圖片格式轉換和壓縮

#### 2.6 用戶體驗優化
- [ ] 滿意度投票動畫效果（點擊回饋）
- [ ] 社群分享按鈕 hover 效果
- [ ] 分享成功提示訊息
- [ ] 響應式設計適配
- [ ] 載入狀態指示器

#### 2.7 統計分析功能（數據視覺化）
- [ ] 建立滿意度投票統計頁面
- [ ] 建立社群分享統計頁面
- [ ] **優化：數據視覺化儀表板**
  - 長條圖顯示表情符號受歡迎程度
  - 熱門章節投票結果視覺化
  - 分享效果追蹤圖表
- [ ] 實作熱門章節分析
- [ ] 實作分享效果追蹤

## 🔍 關鍵技術考量

### 1. 資料快取策略
- **React Query 快取** - 快取 API 資料
- **智慧型更新** - 避免不必要的 API 呼叫
- **本地狀態同步** - 確保 UI 與後端資料一致

### 2. 分頁載入機制
- **無限滾動** - 載入更多故事
- **虛擬滾動** - 處理大量投票選項
- **懶載入** - 圖片和組件按需載入

### 3. 樂觀更新策略
- **立即更新 UI** - 投票後立即顯示結果
- **後端驗證** - 確保投票有效性
- **錯誤回滾** - 投票失敗時恢復原狀態

### 4. 投票限制策略
- **IP + Session 限制** - 防止重複投票
- **時間窗口限制** - 投票有效期管理
- **頻率限制** - 防止惡意投票

### 5. 即時更新策略
- **輪詢機制** - 定期更新投票統計
- **WebSocket** - 即時推送更新（可選）
- **狀態同步** - 確保多用戶間資料一致

## 📁 檔案結構

```
src/
├── lib/
│   ├── hooks/
│   │   ├── useHomeData.ts          # 首頁資料獲取
│   │   ├── useChapterVoting.ts     # 章節投票管理
│   │   └── useVotePolling.ts       # 投票統計輪詢
│   └── services/
│       └── IllustrationService.ts  # 插圖生成服務
├── types/
│   ├── story.ts                    # 故事型別定義
│   ├── chapter.ts                  # 章節型別定義
│   ├── voting.ts                   # 投票型別定義
│   └── illustration.ts             # 插圖型別定義
├── components/
│   ├── StoryCard.tsx               # 故事卡片組件
│   ├── VotingSection.tsx           # 投票區域組件
│   ├── VoteOption.tsx              # 投票選項組件
│   ├── ContentExpander.tsx         # 內容展開組件
│   ├── OriginTags.tsx              # 故事起源標籤組件
│   ├── ChapterIllustration.tsx     # 章節插圖組件
│   ├── SatisfactionVoting.tsx      # 滿意度投票組件
│   ├── SocialSharing.tsx           # 社群分享組件
│   ├── LoadingState.tsx            # 載入狀態組件
│   ├── ErrorState.tsx              # 錯誤狀態組件
│   └── EmptyState.tsx              # 空資料狀態組件
├── app/
│   └── api/
│       ├── stories/
│       │   └── [id]/
│       │       └── chapters/
│       │           ├── [chapterId]/
│       │           │   ├── vote/
│       │           │   │   └── route.ts  # 章節投票 API
│       │           │   ├── satisfaction/
│       │           │   │   └── route.ts  # 滿意度投票 API
│       │           │   └── share/
│       │           │       └── route.ts  # 社群分享 API
│       │           └── generate/
│       │               └── route.ts      # 章節生成 API（含插圖）
│       └── illustrations/
│           ├── generate/
│           │   └── route.ts              # 插圖生成 API
│           └── styles/
│               └── route.ts              # 插圖風格管理 API
├── app/
│   └── page.tsx                    # 首頁主組件
└── public/
    └── images/
        ├── stories/                # 章節插圖存放目錄
        │   └── {story_id}/         # 按故事 ID 分資料夾
        │       ├── {chapter_id}.webp  # 章節插圖檔案
        │       └── shares/         # 分享用圖片目錄
        │           ├── {chapter_id}_twitter.webp
        │           ├── {chapter_id}_facebook.webp
        │           ├── {chapter_id}_line.webp
        │           └── {chapter_id}_instagram.webp
        └── default-illustration.png  # 預設插圖
```

## 📝 驗收標準

### 階段 1 驗收標準（優化與測試）
- [ ] 投票輪詢機制正常運作
- [ ] 資料載入策略優化效果良好
- [ ] 內容懶載入功能正常
- [ ] 插圖載入效能符合預期
- [ ] 插圖快取機制運作正常
- [ ] 載入狀態處理完善
- [ ] 錯誤重試機制正常運作
- [ ] 用戶友好的錯誤提示顯示正確
- [ ] 插圖生成失敗降級處理正常
- [ ] 功能測試通過
- [ ] 響應式測試通過
- [ ] 效能測試通過
- [ ] 用戶體驗測試通過
- [ ] 插圖生成品質測試通過

### 階段 2 驗收標準（章節滿意度投票與社群分享系統）
- [ ] 資料庫成功新增滿意度投票和分享記錄表（**優化：數值化 vote_type**）
- [ ] 滿意度投票 API 正常運作，支援 4 種表情符號投票
- [ ] **優化：GET API 響應速度極快**（< 200ms）
- [ ] 社群分享 API 正常運作，支援 3 個平台分享（X、Facebook、Line）
- [ ] 滿意度投票組件正常顯示和互動
- [ ] **優化：載入狀態指示器正常運作**
- [ ] 社群分享組件正常顯示和互動
- [ ] **優化：分享成功提示訊息正常顯示**
- [ ] 分享文案自動生成功能正常
- [ ] **優化：動態 Hashtag 根據故事類型生成**
- [ ] 圖片分享優化功能正常（多尺寸預生成）
- [ ] **優化：圖像感知壓縮效果良好**
- [ ] 環境變數設定正確，包含所有分享相關參數
- [ ] 投票限制機制正常運作（防重複投票）
- [ ] **優化：數據視覺化儀表板正常運作**
- [ ] 分享統計功能正常運作
- [ ] 響應式設計適配正常
- [ ] 用戶體驗優化效果良好

### 整體驗收標準
- [ ] 資料庫擴展完成，包含章節投票相關表、插圖欄位、滿意度投票和分享記錄表
- [ ] API 端點正常運作，支援投票、統計查詢、滿意度投票和社群分享
- [ ] 首頁能正確顯示真實的故事資料
- [ ] 章節投票功能正常運作
- [ ] 投票達到門檻時能觸發 AI 生成
- [ ] 章節插圖生成功能正常運作
- [ ] 插圖風格一致性管理正常
- [ ] 滿意度投票系統正常運作
- [ ] 社群分享系統正常運作
- [ ] 分享文案和圖片優化功能正常
- [ ] 載入狀態和錯誤處理完善
- [ ] 響應式設計正常
- [ ] 效能符合預期
- [ ] 程式碼品質良好，有適當的註解

## 🔄 與現有系統整合

### 故事起源投票系統
- 保持現有的 `origin_votes` 和 `origin_vote_totals` 表
- 維持現有的投票限制和驗證機制
- 整合到首頁的故事展示中

### 章節投票系統
- 新增 `chapter_votes` 和 `chapter_vote_totals` 表
- 實作章節投票 API
- 整合到故事卡片中

### AI 生成系統
- 保持現有的故事生成流程
- 新增章節投票觸發機制
- 整合投票結果到 AI 生成參數中
- 新增章節插圖生成功能
- 整合插圖生成到章節生成流程
- **優化：章節標題不包含「第x章：」前綴，AI生成純章節標題**

### 章節插圖生成系統
- 整合 OpenAI DALL-E 3 API
- 實作故事風格一致性管理
- 建立本地圖片儲存機制
- 整合到現有章節生成流程
- 支援 WebP 格式優化
- 建立插圖顯示和載入優化機制
- **優化：確保原本插圖先生成完成，避免分享圖片生成影響核心功能**

### 章節滿意度投票與社群分享系統
- 整合滿意度投票功能到章節卡片
- 實作社群媒體分享功能
- 建立分享文案自動生成機制
- 整合圖片分享優化功能
- 建立投票和分享統計分析
- 支援多平台分享（X、Facebook、Line、Instagram）
