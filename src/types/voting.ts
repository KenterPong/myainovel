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
  votingStatus: '進行中' | '已截止' | '已生成';
  votingDeadline?: string;
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
