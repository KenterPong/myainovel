/**
 * 章節插圖相關型別定義
 */

// 插圖生成請求
export interface IllustrationGenerateRequest {
  chapterId: number;
  storyId: string;
  chapterTitle: string;
  chapterContent: string;
  storyGenre: string;
  illustrationStyle?: string;
}

// 插圖生成回應
export interface IllustrationGenerateResponse {
  success: boolean;
  data?: {
    illustrationUrl: string;
    illustrationPrompt: string;
    illustrationStyle: string;
    generatedAt: string;
  };
  error?: string;
}

// 插圖風格設定
export interface IllustrationStyle {
  story_genre: string;
  style_name: string;
  style_prompt: string;
  color_palette: string[];
  art_style: string;
  mood: string;
  character_style: string;
}

// 插圖資料庫記錄
export interface IllustrationRecord {
  illustration_url: string;
  illustration_prompt: string;
  illustration_style: string;
  illustration_generated_at: string;
}

// 故事類型與風格對應
export interface GenreStyleMapping {
  [key: string]: {
    styleName: string;
    stylePrompt: string;
    colorPalette: string[];
    artStyle: string;
    mood: string;
    characterStyle: string;
  };
}

// 插圖生成狀態
export type IllustrationStatus = 'pending' | 'generating' | 'completed' | 'failed';

// 插圖生成進度
export interface IllustrationProgress {
  status: IllustrationStatus;
  progress: number; // 0-100
  message?: string;
  error?: string;
}

// OpenAI DALL-E 3 API 請求
export interface DalleApiRequest {
  model: string;
  prompt: string;
  n: number;
  size: string;
  quality: string;
}

// OpenAI DALL-E 3 API 回應
export interface DalleApiResponse {
  created: number;
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

// 圖片處理選項
export interface ImageProcessingOptions {
  outputFormat: 'webp' | 'png' | 'jpg';
  quality: number;
  width?: number;
  height?: number;
  storagePath: string;
}

// 插圖生成結果
export interface IllustrationResult {
  success: boolean;
  illustrationUrl?: string;
  illustrationPrompt?: string;
  illustrationStyle?: string;
  generatedAt?: string;
  error?: string;
  processingTime?: number;
}
