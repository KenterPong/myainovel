/**
 * 投票系統相關型別定義
 */

// 投票選項介面
export interface VotingOption {
  id: string;
  content: string;
  description: string;
  votes?: number;
}

// 投票統計介面
export interface VoteStats {
  chapterId: number;
  votingStatus: '投票中' | '已投票' | '投票截止';
  votingDeadline?: string;
  cooldownUntil?: string;
  voteCounts: {
    A: number;
    B: number;
    C: number;
  };
  totalVotes: number;
  userVoted: boolean;
  userChoice?: string;
  threshold: number;
  thresholdReached: boolean;
  triggerGeneration: boolean;
  isVotingActive: boolean;
}

// 章節投票請求介面
export interface ChapterVoteRequest {
  optionId: string;
  voterSession: string;
}

// 章節投票回應介面
export interface ChapterVoteResponse {
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
  message: string;
}

// 投票統計回應介面
export interface VoteStatsResponse {
  success: boolean;
  data: VoteStats;
}

// 故事起源投票統計介面
export interface OriginVoteStats {
  voteCounts: {
    outer: { [key: string]: number };
    middle: { [key: string]: number };
    inner: { [key: string]: number };
  };
  allThresholdsReached: boolean;
  votingEndDate: string;
}

// 故事起源投票請求介面
export interface OriginVoteRequest {
  storyId: string;
  outerChoice: string;
  middleChoice: string;
  innerChoice: string;
  voterSession: string;
}

// 故事起源投票回應介面
export interface OriginVoteResponse {
  success: boolean;
  data: OriginVoteStats;
  message: string;
}

// 滿意度投票類型枚舉
export enum SatisfactionVoteType {
  LIKE = 1,    // 👍 喜歡
  STAR = 2,    // ⭐ 精彩
  FIRE = 3,    // 🔥 超讚
  HEART = 4    // 💖 感動
}

// 滿意度投票統計介面
export interface SatisfactionVoteStats {
  chapterId: number;
  voteCounts: {
    [SatisfactionVoteType.LIKE]: number;
    [SatisfactionVoteType.STAR]: number;
    [SatisfactionVoteType.FIRE]: number;
    [SatisfactionVoteType.HEART]: number;
  };
  totalVotes: number;
  userVoted: boolean;
  userVoteType?: SatisfactionVoteType;
}

// 滿意度投票請求介面
export interface SatisfactionVoteRequest {
  voteType: SatisfactionVoteType;
}

// 滿意度投票回應介面
export interface SatisfactionVoteResponse {
  success: boolean;
  data: SatisfactionVoteStats;
  message: string;
}

// 社群分享平台枚舉
export enum SharePlatform {
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  LINE = 'line',
  THREADS = 'threads'
}

// 社群分享統計介面
export interface ShareStats {
  chapterId: number;
  shareCounts: {
    [SharePlatform.TWITTER]: number;
    [SharePlatform.FACEBOOK]: number;
    [SharePlatform.LINE]: number;
    [SharePlatform.THREADS]: number;
  };
  totalShares: number;
}

// 社群分享請求介面
export interface ShareRequest {
  platform: SharePlatform;
}

// 社群分享回應介面
export interface ShareResponse {
  success: boolean;
  data: ShareStats;
  message: string;
}

// 分享文案生成介面
export interface ShareContent {
  text: string;
  hashtags: string[];
  url: string;
  imageUrl?: string;
}