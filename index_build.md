## 🚀 待完成功能清單

### 階段 1：系統優化與功能完善 (優先級：中)
**目標**：效能優化、錯誤處理、用戶體驗完善、剩餘功能開發、多語系優化

> **💡 當前狀態**：核心功能已完成，包括故事生成、章節投票、滿意度投票、社群分享等。現在專注於系統優化和多語系優化策略實作。

#### 1.0 多語系優化策略（分表儲存）
- [ ] **英文先行生成**：修改所有 AI 提示詞為英文，確保角色名稱識別穩定性
- [ ] **多語系名稱對應表**：建立角色名稱的多語系對應關係
- [ ] **分表資料庫結構**：建立 `chapters_zh_tw`、`chapters_zh_cn`、`chapters_ja`、`chapters_ko`、`chapters_th` 表
- [ ] **主表結構調整**：修改 `chapters` 主表為中文核心數據，新增 `has_translation` 欄位
- [ ] **翻譯流程實作**：實作英文到各語系的分表翻譯機制
- [ ] **角色名稱替換**：實作簡單字串替換確保名稱一致性
- [ ] **查詢優化**：實作語系切換時的動態表名查詢機制

#### 1.1 效能優化
- [ ] 優化 API 響應速度（GET 統計 API < 200ms）
- [ ] 實作插圖記憶體快取機制

#### 1.2 分享圖片功能完善
- [ ] **圖像感知壓縮**（Perceptual Quality）優化視覺品質
- [ ] 檔案命名規範：`{chapter_id}_{platform}.webp`

#### 1.3 環境變數與配置優化
- [ ] **動態生成 Hashtag**（品牌 + 類型 + 實際故事類型）
- [ ] 分享文案自動生成優化

#### 1.4 測試與驗收
- [ ] 功能測試
- [ ] 響應式測試
- [ ] 效能測試
- [ ] 用戶體驗測試
- [ ] 插圖生成品質測試
- [ ] 投票限制機制測試（防重複投票）

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
│   ├── AnalyticsDashboard.tsx     # 數據分析儀表板
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
        │           ├── {chapter_id}_x.webp
        │           ├── {chapter_id}_fb.webp
        │           ├── {chapter_id}_line.webp
        │           └── {chapter_id}_threads.webp
        └── default-illustration.png  # 預設插圖
```

## 📝 驗收標準

### 階段 1 驗收標準（系統優化與功能完善）
- [ ] 多語系優化策略（分表儲存）實作完成
- [ ] 英文先行生成機制運作正常
- [ ] 多語系名稱對應表建立完成
- [ ] 分表資料庫結構建立完成（chapters_zh_tw, chapters_zh_cn, chapters_ja, chapters_ko, chapters_th）
- [ ] 主表結構調整完成（chapters 主表改為中文核心數據）
- [ ] 翻譯機制實作完成
- [ ] 角色名稱替換機制運作正常
- [ ] 動態表名查詢機制運作正常
- [ ] API 響應速度優化（GET 統計 API < 200ms）
- [ ] 插圖記憶體快取機制運作正常
- [ ] 圖像感知壓縮效果良好
- [ ] 檔案命名規範：`{chapter_id}_{platform}.webp` 正常運作
- [ ] 動態 Hashtag 生成正常
- [ ] 分享文案自動生成優化
- [ ] 功能測試通過
- [ ] 響應式測試通過
- [ ] 效能測試通過
- [ ] 用戶體驗測試通過
- [ ] 插圖生成品質測試通過
- [ ] 投票限制機制測試通過（防重複投票）

## 🔄 與現有系統整合

### 已完成的核心功能
- ✅ **故事起源投票系統**：`origin_votes` 和 `origin_vote_totals` 表
- ✅ **章節投票系統**：`chapter_votes` 和 `chapter_vote_totals` 表
- ✅ **AI 生成系統**：故事生成、章節生成、插圖生成
- ✅ **章節插圖生成系統**：OpenAI DALL-E 3 整合、風格一致性管理
- ✅ **滿意度投票系統**：`chapter_satisfaction_votes` 表、4種表情符號投票
- ✅ **社群分享系統**：`chapter_shares` 表、多平台分享（X、Facebook、Line、Threads）
- ✅ **章節標題優化**：移除「第x章：」前綴，AI生成純章節標題
- ✅ **插圖生成優化**：確保原本插圖先生成完成，避免分享圖片生成影響核心功能

### 多語系優化策略（分表儲存）
- 🔄 **英文先行生成**：所有 AI 提示詞改為英文，確保角色名稱識別穩定性
- 🔄 **多語系名稱管理**：建立角色名稱的多語系對應表，避免翻譯不一致
- 🔄 **分表資料庫設計**：採用分表儲存語系策略，提升查詢效能
- 🔄 **翻譯機制**：實作英文到各語系的分表翻譯和名稱替換機制
- 🔄 **查詢優化**：實作動態表名查詢，支援語系切換

### 待完善的功能
- 🔄 **多語系優化**：英文先行生成、多語系名稱管理、翻譯機制實作
- 🔄 **效能優化**：API 響應速度優化、插圖記憶體快取機制
- 🔄 **分享圖片**：圖像感知壓縮、檔案命名規範
- 🔄 **環境配置**：動態 Hashtag 生成、分享文案優化
- 🔄 **測試驗收**：功能測試、響應式測試、效能測試、用戶體驗測試