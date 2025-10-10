/**
 * 章節插圖生成服務
 * 整合 OpenAI DALL-E 3 API 和圖片處理功能
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { query } from '../db';
import {
  IllustrationGenerateRequest,
  IllustrationResult,
  IllustrationStyle,
  GenreStyleMapping,
  DalleApiRequest,
  DalleApiResponse,
  ImageProcessingOptions
} from '../../types/illustration';

export class IllustrationService {
  private readonly openaiApiKey: string;
  private readonly imageModel: string;
  private readonly imageQuality: string;
  private readonly imageSize: string;
  private readonly outputFormat: string;
  private readonly imageQualityValue: number;
  private readonly storagePath: string;

  // 故事類型與插圖風格對應表
  private readonly genreStyleMapping: GenreStyleMapping = {
    '科幻': {
      styleName: '賽博龐克插畫風',
      stylePrompt: 'Cyberpunk illustration style, neon colors, dark atmosphere, futuristic cityscape, detailed character design, high contrast lighting, digital art aesthetic',
      colorPalette: ['#00FFFF', '#FF00FF', '#FFFF00', '#000000'],
      artStyle: 'Digital illustration with clean lines and vibrant neon colors',
      mood: 'Dark, mysterious, high-tech',
      characterStyle: 'Anime-inspired character design with cyberpunk elements'
    },
    '奇幻': {
      styleName: '魔幻插畫風',
      stylePrompt: 'Fantasy illustration style, magical atmosphere, epic fantasy setting, detailed character design, mystical lighting, digital art aesthetic',
      colorPalette: ['#FFD700', '#8A2BE2', '#32CD32'],
      artStyle: 'Rich colors, magical elements, mystical atmosphere',
      mood: 'Epic, magical, mysterious',
      characterStyle: 'Fantasy character design with magical elements'
    },
    '都市': {
      styleName: '現代插畫風',
      stylePrompt: 'Modern illustration style, clean lines, urban life, realistic atmosphere, detailed character design, contemporary lighting, digital art aesthetic',
      colorPalette: ['#4682B4', '#FFA500', '#F5F5DC'],
      artStyle: 'Clean lines, urban life, realistic feel',
      mood: 'Modern, urban, contemporary',
      characterStyle: 'Modern character design with urban elements'
    },
    '懸疑': {
      styleName: '暗黑插畫風',
      stylePrompt: 'Dark illustration style, mysterious atmosphere, suspenseful setting, detailed character design, dramatic lighting, digital art aesthetic',
      colorPalette: ['#696969', '#8B0000', '#006400'],
      artStyle: 'Dark atmosphere, mysterious, tense',
      mood: 'Dark, mysterious, suspenseful',
      characterStyle: 'Dramatic character design with dark elements'
    },
    '愛情': {
      styleName: '浪漫插畫風',
      stylePrompt: 'Romantic illustration style, soft colors, warm atmosphere, emotional setting, detailed character design, gentle lighting, digital art aesthetic',
      colorPalette: ['#FFB6C1', '#DDA0DD', '#FFE4B5'],
      artStyle: 'Soft colors, warm atmosphere, emotional',
      mood: 'Romantic, warm, emotional',
      characterStyle: 'Romantic character design with soft elements'
    },
    '冒險': {
      styleName: '動感插畫風',
      stylePrompt: 'Dynamic illustration style, energetic atmosphere, adventurous setting, detailed character design, vibrant lighting, digital art aesthetic',
      colorPalette: ['#FF8C00', '#1E90FF', '#DC143C'],
      artStyle: 'Dynamic composition, energetic, exciting',
      mood: 'Energetic, exciting, adventurous',
      characterStyle: 'Dynamic character design with adventurous elements'
    }
  };

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.imageModel = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';
    this.imageQuality = process.env.OPENAI_IMAGE_QUALITY || 'standard';
    this.imageSize = process.env.OPENAI_IMAGE_SIZE || '1024x1024';
    this.outputFormat = process.env.IMAGE_OUTPUT_FORMAT || 'webp';
    this.imageQualityValue = parseInt(process.env.IMAGE_QUALITY || '85');
    this.storagePath = process.env.IMAGE_STORAGE_PATH || 'public/images/stories';

    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY 環境變數未設定');
    }
  }

  /**
   * 生成章節插圖
   */
  async generateIllustration(request: IllustrationGenerateRequest): Promise<IllustrationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`開始生成章節 ${request.chapterId} 的插圖...`);

      // 1. 獲取或建立故事風格設定
      const illustrationStyle = await this.getOrCreateIllustrationStyle(request.storyId, request.storyGenre);
      
      // 2. 生成插圖提示詞
      const illustrationPrompt = this.generateIllustrationPrompt(
        request.chapterTitle,
        request.chapterContent,
        illustrationStyle
      );

      // 3. 呼叫 OpenAI DALL-E 3 API
      const dalleResponse = await this.callDalleApi(illustrationPrompt);

      // 4. 下載並處理圖片
      const processedImagePath = await this.downloadAndProcessImage(
        dalleResponse.data[0].url,
        request.storyId,
        request.chapterId
      );

      // 5. 更新資料庫
      await this.updateChapterIllustration(
        request.chapterId,
        processedImagePath,
        illustrationPrompt,
        illustrationStyle.style_name
      );

      const processingTime = Date.now() - startTime;
      console.log(`章節 ${request.chapterId} 插圖生成完成，耗時: ${processingTime}ms`);

      return {
        success: true,
        illustrationUrl: processedImagePath,
        illustrationPrompt,
        illustrationStyle: illustrationStyle.style_name,
        generatedAt: new Date().toISOString(),
        processingTime
      };

    } catch (error) {
      console.error(`章節 ${request.chapterId} 插圖生成失敗:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤'
      };
    }
  }

  /**
   * 獲取或建立故事插圖風格設定
   */
  private async getOrCreateIllustrationStyle(storyId: string, storyGenre: string): Promise<IllustrationStyle> {
    try {
      // 先嘗試從資料庫獲取現有設定
      const result = await query(
        'SELECT setting_data FROM story_settings WHERE story_id = $1 AND setting_type = $2',
        [storyId, '插圖風格']
      );

      if (result.rows.length > 0) {
        return result.rows[0].setting_data as IllustrationStyle;
      }

      // 如果沒有現有設定，根據故事類型建立新設定
      const styleConfig = this.genreStyleMapping[storyGenre] || this.genreStyleMapping['都市'];
      
      const illustrationStyle: IllustrationStyle = {
        story_genre: storyGenre,
        style_name: styleConfig.styleName,
        style_prompt: styleConfig.stylePrompt,
        color_palette: styleConfig.colorPalette,
        art_style: styleConfig.artStyle,
        mood: styleConfig.mood,
        character_style: styleConfig.characterStyle
      };

      // 儲存到資料庫
      await query(
        'INSERT INTO story_settings (story_id, setting_type, setting_data) VALUES ($1, $2, $3)',
        [storyId, '插圖風格', JSON.stringify(illustrationStyle)]
      );

      return illustrationStyle;

    } catch (error) {
      console.error('獲取插圖風格設定失敗:', error);
      // 返回預設風格
      const styleConfig = this.genreStyleMapping[storyGenre] || this.genreStyleMapping['都市'];
      return {
        story_genre: storyGenre,
        style_name: styleConfig.styleName,
        style_prompt: styleConfig.stylePrompt,
        color_palette: styleConfig.colorPalette,
        art_style: styleConfig.artStyle,
        mood: styleConfig.mood,
        character_style: styleConfig.characterStyle
      };
    }
  }

  /**
   * 生成插圖提示詞
   */
  private generateIllustrationPrompt(
    chapterTitle: string,
    chapterContent: string,
    style: IllustrationStyle
  ): string {
    // 提取章節內容的關鍵場景描述（前200字）
    const sceneDescription = chapterContent.substring(0, 200).replace(/\n/g, ' ').trim();
    
    // 組合完整的提示詞
    const prompt = `${style.style_prompt}. Scene: ${chapterTitle} - ${sceneDescription}. Style: ${style.art_style}. Mood: ${style.mood}. Character Style: ${style.character_style}.`;
    
    return prompt;
  }

  /**
   * 呼叫 OpenAI DALL-E 3 API
   */
  private async callDalleApi(prompt: string): Promise<DalleApiResponse> {
    const requestBody: DalleApiRequest = {
      model: this.imageModel,
      prompt,
      n: 1,
      size: this.imageSize,
      quality: this.imageQuality
    };

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API 錯誤: ${response.status} - ${errorData.error?.message || '未知錯誤'}`);
    }

    return await response.json();
  }

  /**
   * 下載並處理圖片
   */
  private async downloadAndProcessImage(
    imageUrl: string,
    storyId: string,
    chapterId: number
  ): Promise<string> {
    try {
      // 下載原始圖片
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`圖片下載失敗: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // 建立儲存目錄
      const storyDir = path.join(this.storagePath, storyId);
      await fs.mkdir(storyDir, { recursive: true });

      // 處理圖片（轉換為 WebP 格式）
      const processedBuffer = await sharp(Buffer.from(imageBuffer))
        .webp({ quality: this.imageQualityValue })
        .toBuffer();

      // 儲存處理後的圖片
      const fileName = `${chapterId}.webp`;
      const filePath = path.join(storyDir, fileName);
      await fs.writeFile(filePath, processedBuffer);

      console.log(`章節 ${chapterId} 插圖已儲存: ${fileName}`);

      // 返回相對路徑
      return `/images/stories/${storyId}/${fileName}`;

    } catch (error) {
      console.error('圖片處理失敗:', error);
      throw new Error(`圖片處理失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 生成分享用多尺寸圖片（基於已生成的插圖）
   */
  async generateShareImages(
    storyId: string,
    chapterId: number
  ): Promise<void> {
    try {
      // 讀取已生成的插圖
      const originalImagePath = path.join(this.storagePath, storyId, `${chapterId}.webp`);
      
      // 檢查原始插圖是否存在
      try {
        await fs.access(originalImagePath);
      } catch (error) {
        console.log(`章節 ${chapterId} 的原始插圖不存在，跳過分享圖片生成`);
        return;
      }

      const originalBuffer = await fs.readFile(originalImagePath);
      const shareDir = path.join(this.storagePath, storyId);
      
      // 各平台分享圖片尺寸設定
      const shareSizes = {
        x: { width: 1200, height: 630 }, // X (Twitter) Card 尺寸
        fb: { width: 1200, height: 630 }, // Facebook Open Graph 尺寸
        line: { width: 800, height: 600 }, // Line 分享尺寸
        threads: { width: 1200, height: 630 }, // Threads 分享尺寸
      };

      // 檢查是否啟用多尺寸生成
      const generateSizes = process.env.SOCIAL_IMAGE_GENERATE_SIZES === 'true';
      if (!generateSizes) {
        console.log('分享圖片生成已禁用');
        return;
      }

      const imageQuality = parseInt(process.env.SOCIAL_IMAGE_QUALITY || '85');
      const imageFormat = process.env.SOCIAL_IMAGE_FORMAT || 'webp';

      console.log(`開始為章節 ${chapterId} 生成分享圖片...`);

      for (const [platform, size] of Object.entries(shareSizes)) {
        try {
          const processedBuffer = await sharp(originalBuffer)
            .resize(size.width, size.height, {
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality: imageQuality })
            .toBuffer();

          const fileName = `${chapterId}_${platform}.${imageFormat}`;
          const filePath = path.join(shareDir, fileName);
          await fs.writeFile(filePath, processedBuffer);

          console.log(`已生成 ${platform} 分享圖片: ${fileName}`);
        } catch (error) {
          console.error(`生成 ${platform} 分享圖片失敗:`, error);
        }
      }

      console.log(`章節 ${chapterId} 的分享圖片生成完成`);
    } catch (error) {
      console.error('生成分享圖片失敗:', error);
    }
  }

  /**
   * 更新章節插圖資訊到資料庫
   */
  private async updateChapterIllustration(
    chapterId: number,
    illustrationUrl: string,
    illustrationPrompt: string,
    illustrationStyle: string
  ): Promise<void> {
    await query(
      `UPDATE chapters 
       SET illustration_url = $1, 
           illustration_prompt = $2, 
           illustration_style = $3, 
           illustration_generated_at = NOW()
       WHERE chapter_id = $4`,
      [illustrationUrl, illustrationPrompt, illustrationStyle, chapterId]
    );
  }

  /**
   * 檢查插圖是否已存在
   */
  async checkIllustrationExists(chapterId: number): Promise<boolean> {
    try {
      const result = await query(
        'SELECT illustration_url FROM chapters WHERE chapter_id = $1 AND illustration_url IS NOT NULL',
        [chapterId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('檢查插圖存在性失敗:', error);
      return false;
    }
  }

  /**
   * 獲取章節插圖資訊
   */
  async getChapterIllustration(chapterId: number): Promise<IllustrationRecord | null> {
    try {
      const result = await query(
        `SELECT illustration_url, illustration_prompt, illustration_style, illustration_generated_at
         FROM chapters 
         WHERE chapter_id = $1 AND illustration_url IS NOT NULL`,
        [chapterId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        illustration_url: row.illustration_url,
        illustration_prompt: row.illustration_prompt,
        illustration_style: row.illustration_style,
        illustration_generated_at: row.illustration_generated_at
      };
    } catch (error) {
      console.error('獲取章節插圖資訊失敗:', error);
      return null;
    }
  }
}
