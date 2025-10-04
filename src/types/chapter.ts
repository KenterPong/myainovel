/**
 * 章節相關型別定義
 */

import { VotingOption, VoteStats } from './voting';

// 章節基本資訊
export interface ChapterInfo {
  chapter_id: number;
  story_id: string;
  chapter_number: string;
  title: string;
  full_text: string;
  summary: string;
  tags: string[];
  voting_status: '進行中' | '已截止' | '已生成';
  voting_deadline?: string;
  user_choice?: string;
  previous_summary_context?: string;
  created_at: string;
}

// 章節投票選項
export interface ChapterVotingOptions {
  options: VotingOption[];
  total_votes: number;
  deadline?: string;
}

// 章節詳細資訊（包含投票）
export interface ChapterDetails extends ChapterInfo {
  voting_options?: ChapterVotingOptions;
  vote_stats?: VoteStats;
}

// 章節列表項目
export interface ChapterListItem {
  chapter_id: number;
  chapter_number: string;
  title: string;
  summary: string;
  voting_status: '進行中' | '已截止' | '已生成';
  created_at: string;
}

// 章節建立請求
export interface CreateChapterRequest {
  story_id: string;
  chapter_number: string;
  title: string;
  full_text: string;
  summary: string;
  tags?: string[];
  voting_options?: ChapterVotingOptions;
  voting_deadline?: string;
}

// 章節更新請求
export interface UpdateChapterRequest {
  title?: string;
  full_text?: string;
  summary?: string;
  tags?: string[];
  voting_status?: '進行中' | '已截止' | '已生成';
  voting_options?: ChapterVotingOptions;
  voting_deadline?: string;
  user_choice?: string;
}

// 章節列表回應
export interface ChapterListResponse {
  success: boolean;
  data: {
    chapters: ChapterListItem[];
    total: number;
    current_page: number;
    total_pages: number;
  };
}

// 章節詳情回應
export interface ChapterDetailsResponse {
  success: boolean;
  data: ChapterDetails;
}
