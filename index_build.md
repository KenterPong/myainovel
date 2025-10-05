# 首頁內容真實化建置指南

## 📋 專案概述

將首頁從硬編碼的假資料轉換為真實的資料庫資料，整合現有的故事起源投票系統和章節投票系統，實現完整的互動式故事平台。

## 🎯 首頁UI/UX需求規格

### 主要畫面需求
1. **移除頁面標題**：不顯示「最新章節」和「跟隨故事的最新發展」文字，呈現純粹的社群動態牆風格
2. **簡化章節標題**：每個章節前面直接加上故事標題，移除重複的故事標題和建立日期區塊
3. **投票標籤位置調整**：將「投票中」標籤移到章節文字的右邊
4. **故事起源標籤顯示**：章節標題下方顯示故事起源的三個類型標籤（外圈、中圈、內圈）
5. **移除故事起源投票區塊**：首頁不顯示故事起源投票統計
6. **文章預覽功能**：顯示前200字預覽，點擊文章文字可展開完整內容
7. **滑動手勢處理**：確保點擊展開不影響左右滑動切換頁籤功能
8. **簡化投票說明**：章節投票區塊用一行簡短文字說明，移除標題
9. **章節排序顯示**：**跨故事**章節按生成時間由新到舊排序，新章節自動置頂顯示
10. **章節導航功能**：非第一章節時顯示左右箭頭，可跳轉到前後章節
11. **故事篩選功能**：點擊故事標題可篩選該故事的所有章節，由新到舊排序

### 章節投票UI改進需求
12. **投票項目收合功能**：將投票選項放入可收合的內容區域中，預設收合狀態，點擊後展開顯示完整投票內容
13. **導航按鈕圖標化**：將上一章/下一章按鈕改為圖標按鈕，移除文字，與底部導航選單風格一致
14. **章節列表查看功能**：在導航按鈕中間添加查看所有章節的圖標，點擊後顯示該故事的所有章節列表
15. **動態圖標切換**：根據當前視圖狀態動態切換中間按鈕圖標（章節列表視圖時顯示回首頁圖標，章節閱讀視圖時顯示章節列表圖標）

### 版面配置設計
```
[故事標題] 第X章: 章節標題                    [投票中]
[故事起源標籤: 奇幻 | 校園 | B/G]

章節內容前200字...
[點擊展開完整內容]

[簡短投票說明: 投票中 (15票) - 選擇故事發展方向]
[點擊展開投票選項] ▼

[←] [📋] [→]  (三按鈕導航：上一章、章節列表、下一章)
```

### 章節導航按鈕設計
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

### 章節顯示與導航設計
```
首頁章節列表 (跨故事按生成時間由新到舊排序)
├── 故事A - 第003章 (最新生成) [投票中]
├── 故事B - 第002章 (次新生成) [投票中]
├── 故事A - 第002章 [投票截止]
├── 故事C - 第001章 [投票截止]
├── 故事B - 第001章 [投票截止]
└── 故事A - 第001章 (最早生成) [投票截止]

章節導航 (非第一章節時顯示)
[← 第002章] [第004章 →]

故事篩選功能
點擊故事標題 → 篩選該故事所有章節
├── 故事A - 第003章 [投票中]
├── 故事A - 第002章 [投票截止]
└── 故事A - 第001章 [投票截止]
```

### 技術實現考量
- **滑動手勢衝突處理**：文章內容區域禁用滑動手勢，空白區域啟用
- **文章展開機制**：使用 Modal 或 Accordion 方式展開
- **故事起源標籤**：從 `origin_voting` 資料取得已投票選項並顯示中文標籤
- **投票狀態簡化**：用顏色和簡短文字區分不同狀態
- **章節排序邏輯**：**跨故事**按 `created_at` 時間戳由新到舊排序，不區分故事
- **章節導航狀態**：根據章節編號判斷是否顯示導航箭頭
- **故事篩選狀態**：維護當前篩選的故事ID，影響章節顯示邏輯
- **首頁顯示策略**：所有章節混合排序，新章節自動置頂，舊章節保持顯示

## 🏗️ 章節投票統計系統完整架構

### 📊 資料庫擴展設計

#### 新增資料表：`chapter_votes` (章節投票記錄表)
```sql
CREATE TABLE chapter_votes (
  vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id INTEGER NOT NULL REFERENCES chapters(chapter_id),
  story_id UUID NOT NULL REFERENCES stories(story_id),
  voter_ip VARCHAR(45) NOT NULL,
  voter_session VARCHAR(255) NOT NULL,
  option_id VARCHAR(10) NOT NULL, -- A, B, C
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT
);
```

#### 新增資料表：`chapter_vote_totals` (章節投票統計表)
```sql
CREATE TABLE chapter_vote_totals (
  total_id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES chapters(chapter_id),
  story_id UUID NOT NULL REFERENCES stories(story_id),
  option_id VARCHAR(10) NOT NULL, -- A, B, C
  vote_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🔄 章節投票流程

#### 投票狀態管理規則

##### 投票狀態定義
- `'投票中'`：讀者還沒有針對這個章節投票，或投票冷卻時間已過（24小時後）
- `'已投票'`：讀者已針對這個章節投票，但投票尚未達標
- `'投票截止'`：讀者投票已達標並已生成新的章節，投票選項已鎖定

##### 投票狀態轉換流程
1. **初始狀態**：新章節建立時為 `'投票中'`
2. **投票後**：用戶投票後立即變為 `'已投票'`，並記錄用戶選擇的選項
3. **冷卻時間**：投票後 24 小時內保持 `'已投票'` 狀態，無法再次投票
4. **冷卻結束**：24 小時後自動變回 `'投票中'`，允許再次投票
5. **達標觸發**：任一選項達到門檻票數時，立即變為 `'投票截止'` 並觸發 AI 生成
6. **新章節置頂**：AI 生成新章節後，新章節立即置頂顯示給讀者

##### 投票選項顯示規則
- **投票中**：顯示所有選項，用戶可選擇投票
- **已投票**：顯示所有選項，用戶選擇的選項有明顯反白標示
- **投票截止**：顯示所有選項，得票最高的選項有明顯反白標示

#### 投票觸發 AI 生成條件
1. **單一選項達到門檻**：任一選項票數達到環境設定門檻（預設 100 票）
2. **立即觸發生成**：直接生成新章節內容，不帶入讀者選擇參數
3. **更新章節狀態**：將投票狀態更新為「投票截止」
4. **新章節置頂**：新章節自動置頂顯示，舊章節保持顯示在下方

#### 投票流程圖
```
用戶投票 → 更新統計 → 檢查門檻 → 達到門檻？
                                    ↓
                              是：觸發 AI 生成
                                    ↓
                              更新章節狀態為「投票截止」
                                    ↓
                              生成新章節並置頂顯示
```

#### 冷卻時間檢查流程
```
檢查投票時間 → 是否超過24小時？
                        ↓
                    是：變更為「投票中」
                        ↓
                    否：保持「已投票」狀態
```

### 🎯 API 端點設計

#### 1. 章節投票 API
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

#### 2. 投票統計 API
```typescript
// GET /api/stories/[id]/chapters/[chapterId]/vote
interface VoteStatsResponse {
  success: boolean;
  data: {
    chapterId: number;
    votingStatus: '投票中' | '已投票' | '投票截止';
    votingDeadline: string;
    cooldownUntil?: string; // 冷卻結束時間
    voteCounts: {
      A: number;
      B: number;
      C: number;
    };
    totalVotes: number;
    userVoted: boolean;
    userChoice?: string; // 用戶選擇的選項 (A, B, C)
    threshold: number;
  };
}
```

### 🏠 首頁資料整合架構

#### 資料獲取策略
```typescript
interface HomePageData {
  stories: StoryWithChapter[];
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
    user_choice?: string; // 用戶選擇的選項 (A, B, C)
    voting_deadline?: string; // 投票截止時間
    cooldown_until?: string; // 冷卻結束時間
    voting_options?: VotingOption[];
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
  };
  
  // 故事起源投票資訊
  origin_voting?: {
    voteCounts: {
      outer: Record<string, number>;
      middle: Record<string, number>;
      inner: Record<string, number>;
    };
    selectedOptions: {
      outer?: string;
      middle?: string;
      inner?: string;
    };
  };
}
```

### 🔧 技術實作架構

#### 1. 自定義 Hooks 設計
```typescript
// useHomeData.ts - 首頁主要資料管理
export function useHomeData() {
  const [stories, setStories] = useState<StoryWithChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 獲取故事列表和最新章節
  // 處理載入狀態和錯誤
  // 提供重新載入功能
}

// useChapterVoting.ts - 章節投票管理
export function useChapterVoting(chapterId: number) {
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [userVoted, setUserVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 獲取投票統計
  // 提交投票
  // 即時更新統計
  // 檢查門檻觸發
}

// useVotePolling.ts - 投票統計輪詢
export function useVotePolling(chapterId: number, enabled: boolean) {
  // 定期更新投票統計
  // 處理網路錯誤
  // 優化輪詢頻率
}
```

#### 2. 組件架構設計
```typescript
// StoryCard.tsx - 故事卡片組件
interface StoryCardProps {
  story: StoryWithChapter;
  onVote?: (optionId: string) => void;
  onViewDetails?: () => void;
  onExpandContent?: (chapterId: number) => void;
}

// VotingSection.tsx - 投票區域組件
interface VotingSectionProps {
  chapterId: number;
  votingOptions: VotingOption[];
  voteStats: VoteStats;
  onVote: (optionId: string) => void;
  disabled?: boolean;
}

// VoteOption.tsx - 投票選項組件
interface VoteOptionProps {
  option: VotingOption;
  voteCount: number;
  percentage: number;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

// ContentExpander.tsx - 內容展開組件
interface ContentExpanderProps {
  content: string;
  previewLength?: number;
  onExpand?: () => void;
  isExpanded?: boolean;
}
```

### 📱 用戶體驗設計

#### 投票流程
1. **載入狀態** - 顯示載入動畫
2. **投票選項** - 清晰的選項展示
3. **即時統計** - 動態更新票數和百分比
4. **投票回饋** - 成功投票後的視覺回饋
5. **結果展示** - 投票截止後的結果展示
6. **AI 生成提示** - 達到門檻時的生成提示

#### 響應式設計
- **手機版** - 垂直排列投票選項
- **桌面版** - 網格排列投票選項
- **平板版** - 自適應佈局

## 🚀 分階段執行計畫

### 階段 1：首頁UI重構 (優先級：高)
**目標**：實現新的首頁UI設計，移除不需要的元素，調整版面配置

#### 1.1 移除頁面標題區塊
- [ ] 移除「最新章節」和「跟隨故事的最新發展」文字
- [ ] 調整首頁標題區塊為空白或簡化

#### 1.2 重構StoryCard組件
- [ ] 調整章節標題顯示格式：`[故事標題] 第X章: 章節標題`
- [ ] 將「投票中」標籤移到章節文字右邊
- [ ] 移除重複的故事標題和建立日期區塊
- [ ] 在章節標題下方添加故事起源標籤顯示

#### 1.3 實現文章預覽功能
- [ ] 限制章節內容顯示為前200字
- [ ] 添加「點擊展開完整內容」功能
- [ ] 處理滑動手勢衝突（文章區域禁用滑動）

#### 1.4 簡化投票區塊
- [ ] 移除「章節投票」標題
- [ ] 用一行簡短文字說明投票狀態
- [ ] 移除故事起源投票區塊

#### 1.5 實現章節排序與導航
- [ ] 實現**跨故事**章節按生成時間由新到舊排序顯示
- [ ] 新章節自動置頂功能（不區分故事）
- [ ] 非第一章節時顯示左右箭頭導航
- [ ] 實現章節跳轉功能

#### 1.6 實現故事篩選功能
- [ ] 點擊故事標題篩選該故事所有章節
- [ ] 篩選後的章節按新到舊排序
- [ ] 提供返回全部章節的選項

#### 1.7 實現章節投票UI改進
- [ ] 投票項目收合功能：預設收合狀態，點擊展開投票選項
- [ ] 導航按鈕圖標化：移除文字，使用圖標按鈕
- [ ] 三按鈕導航佈局：上一章、章節列表、下一章
- [ ] 動態圖標切換：根據視圖狀態切換中間按鈕圖標
- [ ] 章節列表展開功能：顯示該故事所有章節並支援跳轉

### 階段 2：故事起源標籤整合 (優先級：中)
**目標**：從資料庫獲取並顯示故事起源的三個類型標籤

#### 2.1 擴展資料獲取
- [ ] 修改 `useHomeData` Hook 獲取故事起源投票資料
- [ ] 建立標籤映射函數（ID → 中文標籤）
- [ ] 處理未投票狀態的顯示

#### 2.2 標籤顯示組件
- [ ] 建立 `OriginTags` 組件
- [ ] 實現三圈標籤的視覺設計
- [ ] 處理標籤的響應式顯示

### 階段 3：內容展開機制 (優先級：中)
**目標**：實現流暢的文章內容展開體驗

#### 3.1 展開組件開發
- [ ] 建立 `ContentExpander` 組件
- [ ] 實現 Modal 或 Accordion 展開方式
- [ ] 處理長內容的載入優化

#### 3.2 手勢衝突處理
- [ ] 區分點擊和滑動手勢
- [ ] 在文章內容區域禁用滑動
- [ ] 保持頁籤切換功能正常

### 階段 4：章節投票系統完善 (優先級：低)
**目標**：完善章節投票功能，實現即時統計和AI觸發

#### 4.1 資料庫擴展
- [ ] 建立 `chapter_votes` 表
- [ ] 建立 `chapter_vote_totals` 表
- [ ] 建立相關索引和觸發器

#### 4.2 API 開發
- [ ] 建立章節投票 API 端點
- [ ] 建立投票統計 API 端點
- [ ] 實作投票限制和驗證

#### 4.3 前端整合
- [ ] 建立投票相關 Hooks
- [ ] 建立投票組件
- [ ] 整合到故事卡片中

### 階段 5：優化與測試 (優先級：低)
**目標**：效能優化、錯誤處理、用戶體驗完善

#### 5.1 效能優化
- [ ] 實作投票輪詢機制
- [ ] 優化資料載入策略
- [ ] 實作內容懶載入

#### 5.2 錯誤處理
- [ ] 完善載入狀態處理
- [ ] 實作錯誤重試機制
- [ ] 添加用戶友好的錯誤提示

#### 5.3 測試與驗收
- [ ] 功能測試
- [ ] 響應式測試
- [ ] 效能測試
- [ ] 用戶體驗測試

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
│   └── hooks/
│       ├── useHomeData.ts          # 首頁資料獲取
│       ├── useChapterVoting.ts     # 章節投票管理
│       └── useVotePolling.ts       # 投票統計輪詢
├── types/
│   ├── story.ts                    # 故事型別定義
│   ├── chapter.ts                  # 章節型別定義
│   └── voting.ts                   # 投票型別定義
├── components/
│   ├── StoryCard.tsx               # 故事卡片組件
│   ├── VotingSection.tsx           # 投票區域組件
│   ├── VoteOption.tsx              # 投票選項組件
│   ├── ContentExpander.tsx         # 內容展開組件
│   ├── OriginTags.tsx              # 故事起源標籤組件
│   ├── LoadingState.tsx            # 載入狀態組件
│   ├── ErrorState.tsx              # 錯誤狀態組件
│   └── EmptyState.tsx              # 空資料狀態組件
├── app/
│   └── api/
│       └── stories/
│           └── [id]/
│               └── chapters/
│                   └── [chapterId]/
│                       └── vote/
│                           └── route.ts  # 章節投票 API
└── app/
    └── page.tsx                    # 首頁主組件
```

## 📝 驗收標準

### 階段 1 驗收標準
- [ ] 首頁不顯示「最新章節」等標題文字
- [ ] 章節標題格式為「[故事標題] 第X章: 章節標題」
- [ ] 「投票中」標籤位於章節文字右邊
- [ ] 移除重複的故事標題和建立日期區塊
- [ ] 章節內容限制為前200字預覽
- [ ] 點擊文章可展開完整內容
- [ ] 滑動手勢不影響文章展開功能
- [ ] 投票區塊簡化為一行說明文字
- [ ] 移除故事起源投票區塊
- [ ] 投票項目預設收合，點擊可展開
- [ ] 導航按鈕使用圖標，無文字顯示
- [ ] 三按鈕導航佈局正常運作
- [ ] 章節列表展開功能正常
- [ ] 動態圖標切換功能正常

### 階段 2 驗收標準
- [ ] 章節標題下方顯示故事起源標籤
- [ ] 標籤顯示為中文名稱而非ID
- [ ] 未投票狀態有適當的顯示處理
- [ ] 標籤在手機版和桌面版都有良好顯示

### 階段 3 驗收標準
- [ ] 文章內容可流暢展開和收合
- [ ] 展開方式不影響頁面其他功能
- [ ] 長內容載入效能良好
- [ ] 手勢操作直觀且無衝突

### 整體驗收標準
- [ ] 資料庫擴展完成，包含章節投票相關表
- [ ] API 端點正常運作，支援投票和統計查詢
- [ ] 首頁能正確顯示真實的故事資料
- [ ] 章節投票功能正常運作
- [ ] 投票達到門檻時能觸發 AI 生成
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
