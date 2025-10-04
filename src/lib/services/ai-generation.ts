/**
 * AI 生成服務
 */

import { 
  AIGenerationRequest, 
  AIGenerationResponse, 
  AIGenerationStatus, 
  AIGenerationConfig 
} from '@/types/ai-generation';

// AI 生成配置
const DEFAULT_CONFIG: AIGenerationConfig = {
  model: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.8,
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1,
  timeout: 30000, // 30 秒
  retryAttempts: 3
};

// 生成狀態存儲（實際應用中應該使用 Redis 或資料庫）
const generationStatus = new Map<string, AIGenerationStatus>();

export class AIGenerationService {
  private config: AIGenerationConfig;
  private apiKey: string;

  constructor(config?: Partial<AIGenerationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API Key 未設定，AI 生成功能將使用模擬模式');
    }
  }

  /**
   * 生成章節內容
   */
  async generateChapter(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const generationId = this.generateId();
    
    try {
      // 更新生成狀態
      this.updateStatus(generationId, {
        generationId,
        status: 'processing',
        progress: 0,
        startedAt: new Date().toISOString()
      });

      // 檢查 API Key
      if (!this.apiKey) {
        return this.generateMockContent(request, generationId);
      }

      // 構建提示詞
      const prompt = this.buildPrompt(request);
      
      // 調用 OpenAI API
      const response = await this.callOpenAI(prompt);
      
      // 解析回應
      const generatedContent = this.parseResponse(response);
      
      // 更新狀態為完成
      this.updateStatus(generationId, {
        generationId,
        status: 'completed',
        progress: 100,
        startedAt: generationId,
        completedAt: new Date().toISOString()
      });

      return {
        success: true,
        data: {
          generatedContent: generatedContent.content,
          title: generatedContent.title,
          summary: generatedContent.summary,
          tags: generatedContent.tags,
          nextVotingOptions: generatedContent.nextVotingOptions,
          generationId,
          processingTime: Date.now() - new Date(generationId).getTime()
        },
        message: '章節生成成功'
      };

    } catch (error) {
      let errorMessage = '未知錯誤';
      let userMessage = '章節生成失敗';

      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 處理特定的 OpenAI 錯誤
        if (error.message.includes('insufficient_quota')) {
          userMessage = 'OpenAI 配額不足，請檢查帳戶餘額';
        } else if (error.message.includes('rate_limit_exceeded')) {
          userMessage = 'API 調用頻率超限，請稍後再試';
        } else if (error.message.includes('invalid_api_key')) {
          userMessage = 'OpenAI API Key 無效';
        } else if (error.message.includes('401')) {
          userMessage = 'OpenAI API 認證失敗';
        } else if (error.message.includes('429')) {
          userMessage = 'API 調用次數超限';
        }
      }

      // 更新狀態為失敗
      this.updateStatus(generationId, {
        generationId,
        status: 'failed',
        progress: 0,
        startedAt: generationId,
        error: errorMessage
      });

      return {
        success: false,
        message: userMessage,
        error: errorMessage
      };
    }
  }

  /**
   * 獲取生成狀態
   */
  getGenerationStatus(generationId: string): AIGenerationStatus | null {
    return generationStatus.get(generationId) || null;
  }

  /**
   * 構建提示詞
   */
  private buildPrompt(request: AIGenerationRequest): string {
    const { votingResult, previousContext, storySettings } = request;
    
    let prompt = `請根據以下資訊生成下一章的小說內容：

故事背景：
${previousContext || '這是一個全新的故事開始'}

讀者投票結果：
選項 ${votingResult.optionId}: ${votingResult.content}
描述：${votingResult.description}
得票率：${votingResult.percentage}%

請生成：
1. 章節標題（簡潔有力）
2. 章節內容（2000字左右，生動有趣）
3. 章節摘要（100字以內）
4. 相關標籤（3-5個）
5. 下一章的投票選項（3個選項，每個選項包含ID、內容和描述）

格式要求：
- 使用繁體中文
- 內容要有創意和吸引力
- 保持故事連貫性
- 投票選項要有明顯差異性

請以 JSON 格式回應：
{
  "title": "章節標題",
  "content": "章節內容",
  "summary": "章節摘要",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "nextVotingOptions": [
    {
      "id": "A",
      "content": "選項A內容",
      "description": "選項A描述"
    },
    {
      "id": "B", 
      "content": "選項B內容",
      "description": "選項B描述"
    },
    {
      "id": "C",
      "content": "選項C內容", 
      "description": "選項C描述"
    }
  ]
}`;

    return prompt;
  }

  /**
   * 調用 OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 錯誤: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * 解析 AI 回應
   */
  private parseResponse(response: string): any {
    try {
      // 嘗試解析 JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // 如果無法解析 JSON，返回預設格式
      return {
        title: '新章節',
        content: response,
        summary: response.substring(0, 100) + '...',
        tags: ['小說', '章節'],
        nextVotingOptions: [
          { id: 'A', content: '選項A', description: '選項A描述' },
          { id: 'B', content: '選項B', description: '選項B描述' },
          { id: 'C', content: '選項C', description: '選項C描述' }
        ]
      };
    } catch (error) {
      throw new Error('無法解析 AI 回應');
    }
  }

  /**
   * 生成模擬內容（用於測試）
   */
  private generateMockContent(request: AIGenerationRequest, generationId: string): AIGenerationResponse {
    const { votingResult } = request;
    
    // 模擬處理時間
    setTimeout(() => {
      this.updateStatus(generationId, {
        generationId,
        status: 'completed',
        progress: 100,
        startedAt: generationId,
        completedAt: new Date().toISOString()
      });
    }, 2000);

    const mockContent = {
      title: `第${Math.floor(Math.random() * 10) + 2}章：${votingResult.content}`,
      content: `基於讀者的選擇「${votingResult.content}」，故事繼續發展...

${votingResult.description}

這是一個精彩的故事發展，展現了主角的智慧和勇氣。故事情節跌宕起伏，引人入勝。

讀者的選擇帶來了意想不到的轉折，讓故事更加豐富多彩。每一個決定都影響著故事的走向，這就是互動小說的魅力所在。

隨著故事的深入，更多的謎團和挑戰等待著主角去解決。讀者們的投票將繼續引導故事的發展方向。`,
      summary: `基於「${votingResult.content}」的選擇，故事展現了新的發展方向。`,
      tags: ['互動小說', '讀者選擇', '故事發展'],
      nextVotingOptions: [
        {
          id: 'A',
          content: '勇敢面對挑戰',
          description: '直接面對即將到來的困難'
        },
        {
          id: 'B',
          content: '謹慎觀察情況',
          description: '先觀察環境再決定下一步'
        },
        {
          id: 'C',
          content: '尋求他人幫助',
          description: '尋找盟友或導師的協助'
        }
      ]
    };

    return {
      success: true,
      data: {
        ...mockContent,
        generationId,
        processingTime: 2000
      },
      message: '章節生成成功（模擬模式）'
    };
  }

  /**
   * 更新生成狀態
   */
  private updateStatus(generationId: string, status: AIGenerationStatus): void {
    generationStatus.set(generationId, status);
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 導出單例實例
export const aiGenerationService = new AIGenerationService();
