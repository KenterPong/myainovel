# 首頁內容真實化建置指南

## 📋 專案概述

將首頁從硬編碼的假資料轉換為真實的資料庫資料，整合現有的故事起源投票系統和章節投票系統，實現完整的互動式故事平台。

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

#### 投票觸發 AI 生成條件
1. **單一選項達到門檻**：任一選項票數達到環境設定門檻（預設 100 票）
2. **立即觸發生成**：使用該選項作為故事走向生成下一章
3. **更新章節狀態**：將投票狀態更新為「已生成」

#### 投票流程圖
```
用戶投票 → 更新統計 → 檢查門檻 → 達到門檻？
                                    ↓
                              是：觸發 AI 生成
                                    ↓
                              更新章節狀態
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
    votingStatus: '進行中' | '已截止' | '已生成';
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
    voting_status: '進行中' | '已截止' | '已生成';
    voting_deadline?: string;
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

### 🚀 實作步驟規劃

#### 階段 1：資料庫擴展
1. 建立 `chapter_votes` 表
2. 建立 `chapter_vote_totals` 表
3. 建立相關索引和約束
4. 建立觸發器自動更新統計

#### 階段 2：API 開發
1. 建立章節投票 API 端點
2. 建立投票統計 API 端點
3. 實作投票限制和驗證（參考 README.md 中的防作弊機制）
4. 實作即時統計更新
5. 整合 AI 生成觸發邏輯

#### 階段 3：前端整合
1. 建立型別定義
2. 建立自定義 Hooks
3. 建立投票組件
4. 整合到首頁

#### 階段 4：優化完善
1. 實作投票輪詢
2. 優化載入狀態
3. 實作錯誤處理
4. 效能優化

### 🔍 關鍵技術考量

#### 1. 資料快取策略
- **React Query 快取** - 快取 API 資料
- **智慧型更新** - 避免不必要的 API 呼叫
- **本地狀態同步** - 確保 UI 與後端資料一致

#### 2. 分頁載入機制
- **無限滾動** - 載入更多故事
- **虛擬滾動** - 處理大量投票選項
- **懶載入** - 圖片和組件按需載入

#### 3. 樂觀更新策略
- **立即更新 UI** - 投票後立即顯示結果
- **後端驗證** - 確保投票有效性
- **錯誤回滾** - 投票失敗時恢復原狀態

#### 4. 投票限制策略
- **IP + Session 限制** - 防止重複投票（參考 README.md）
- **時間窗口限制** - 投票有效期管理（參考 README.md）
- **頻率限制** - 防止惡意投票

#### 5. 即時更新策略
- **輪詢機制** - 定期更新投票統計
- **WebSocket** - 即時推送更新（可選）
- **狀態同步** - 確保多用戶間資料一致

### 📁 檔案結構

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

### 📝 驗收標準

- [ ] 資料庫擴展完成，包含章節投票相關表
- [ ] API 端點正常運作，支援投票和統計查詢
- [ ] 首頁能正確顯示真實的故事資料
- [ ] 章節投票功能正常運作
- [ ] 投票達到門檻時能觸發 AI 生成
- [ ] 載入狀態和錯誤處理完善
- [ ] 響應式設計正常
- [ ] 效能符合預期
- [ ] 程式碼品質良好，有適當的註解

### 🔄 與現有系統整合

#### 故事起源投票系統
- 保持現有的 `origin_votes` 和 `origin_vote_totals` 表
- 維持現有的投票限制和驗證機制
- 整合到首頁的故事展示中

#### 章節投票系統
- 新增 `chapter_votes` 和 `chapter_vote_totals` 表
- 實作章節投票 API
- 整合到故事卡片中

#### AI 生成系統
- 保持現有的故事生成流程
- 新增章節投票觸發機制
- 整合投票結果到 AI 生成參數中
