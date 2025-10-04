/**
 * AI 生成相關型別定義
 */

// AI 生成請求介面
export interface AIGenerationRequest {
  storyId: string;
  chapterId: number;
  previousContext?: string;
  votingResult: {
    optionId: string;
    content: string;
    description: string;
    voteCount: number;
    percentage: number;
  };
  storySettings?: {
    characters?: any;
    worldview?: any;
    outline?: any;
  };
  generationType: 'chapter' | 'continuation' | 'branch';
}

// AI 生成回應介面
export interface AIGenerationResponse {
  success: boolean;
  data?: {
    generatedContent: string;
    title: string;
    summary: string;
    tags: string[];
    nextVotingOptions: Array<{
      id: string;
      content: string;
      description: string;
    }>;
    generationId: string;
    processingTime: number;
  };
  message?: string;
  error?: string;
}

// AI 生成狀態介面
export interface AIGenerationStatus {
  generationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  estimatedTime?: number; // 秒
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// AI 生成歷史記錄介面
export interface AIGenerationHistory {
  generation_id: string;
  story_id: string;
  chapter_id: number;
  generation_type: 'chapter' | 'continuation' | 'branch';
  input_data: any;
  output_data: any;
  processing_time: number;
  status: 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

// AI 生成配置介面
export interface AIGenerationConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  timeout: number; // 毫秒
  retryAttempts: number;
}

// AI 生成觸發條件介面
export interface AIGenerationTrigger {
  threshold: number;
  minVotes: number;
  timeLimit: number; // 小時
  cooldownPeriod: number; // 小時
  autoGenerate: boolean;
}
