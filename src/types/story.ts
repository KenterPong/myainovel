/**
 * 故事相關型別定義
 */

import { VoteStats, OriginVoteStats } from './voting';

// 故事基本資訊介面
export interface Story {
  story_id: string;
  story_serial: string;
  title: string;
  status: '投票中' | '撰寫中' | '已完結';
  voting_result?: any;
  current_chapter_id?: number;
  origin_voting_start_date?: string;
  writing_start_date?: string;
  completion_date?: string;
  created_at: string;
}

// 章節介面
export interface Chapter {
  chapter_id: number;
  story_id: string;
  chapter_number: string;
  title: string;
  full_text: string;
  summary: string;
  tags?: string[];
  voting_options?: {
    options: Array<{
      id: string;
      content: string;
      description: string;
      votes: number;
    }>;
    total_votes: number;
    deadline?: string;
  };
  voting_deadline?: string;
  voting_status: '進行中' | '已截止' | '已生成';
  user_choice?: string;
  previous_summary_context?: string;
  created_at: string;
}

// 故事設定介面
export interface StorySettings {
  setting_id: number;
  story_id: string;
  setting_type: '角色' | '世界觀' | '大綱';
  setting_data: any;
  last_updated_at: string;
}

// 帶章節的故事介面（用於首頁）
export interface StoryWithChapter {
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
    voting_options?: Array<{
      id: string;
      content: string;
      description: string;
      votes: number;
    }>;
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
  
  // 投票相關資訊
  origin_voting?: OriginVoteStats;
  chapter_voting?: VoteStats;
}

// 首頁資料介面
export interface HomePageData {
  stories: StoryWithChapter[];
}

// API 回應基礎介面
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
