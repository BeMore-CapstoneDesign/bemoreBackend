import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeEmotion(content: string, mediaType: 'text' | 'audio' | 'image'): Promise<any> {
    try {
      const prompt = this.buildEmotionAnalysisPrompt(content, mediaType);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseEmotionAnalysisResponse(text);
    } catch (error) {
      this.logger.error('Error analyzing emotion with Gemini:', error);
      throw new Error('Failed to analyze emotion');
    }
  }

  async generateChatResponse(message: string, context?: any): Promise<any> {
    try {
      const prompt = this.buildChatPrompt(message, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseChatResponse(text);
    } catch (error) {
      this.logger.error('Error generating chat response with Gemini:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  private buildEmotionAnalysisPrompt(content: string, mediaType: string): string {
    return `
당신은 전문적인 감정 분석 AI입니다. 다음 ${mediaType} 내용을 분석하여 감정을 파악하고 CBT 기법을 제안해주세요.

분석할 내용: ${content}

다음 JSON 형식으로 응답해주세요:
{
  "primaryEmotion": "주요 감정 (기쁨, 슬픔, 분노, 불안, 평온 등)",
  "secondaryEmotions": ["보조 감정들"],
  "confidence": 0.95,
  "intensity": 0.8,
  "analysis": "감정 분석 결과에 대한 상세한 설명",
  "cbtSuggestions": ["적절한 CBT 기법 제안들"]
}
    `;
  }

  private buildChatPrompt(message: string, context?: any): string {
    let prompt = `
당신은 전문적인 CBT 상담사입니다. 사용자의 감정 상태를 고려하여 공감적이고 치료적인 응답을 제공해주세요.

사용자 메시지: ${message}
    `;

    if (context?.currentEmotion) {
      prompt += `\n현재 감정 상태: ${context.currentEmotion}`;
    }

    if (context?.emotionHistory?.length > 0) {
      prompt += `\n감정 변화 히스토리: ${context.emotionHistory.join(', ')}`;
    }

    prompt += `
다음 JSON 형식으로 응답해주세요:
{
  "content": "상담사 응답 내용",
  "emotionAnalysis": {
    "primaryEmotion": "감지된 주요 감정",
    "confidence": 0.95,
    "suggestions": ["CBT 기법 제안들"]
  }
}
    `;

    return prompt;
  }

  private parseEmotionAnalysisResponse(text: string): any {
    try {
      // JSON 추출을 위한 정규식
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error parsing emotion analysis response:', error);
      // 기본 응답 반환
      return {
        primaryEmotion: '중립',
        secondaryEmotions: [],
        confidence: 0.5,
        intensity: 0.5,
        analysis: '감정 분석을 완료했습니다.',
        cbtSuggestions: ['심호흡 기법', '마음챙김 명상']
      };
    }
  }

  private parseChatResponse(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error parsing chat response:', error);
      return {
        content: '죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다.',
        emotionAnalysis: {
          primaryEmotion: '중립',
          confidence: 0.5,
          suggestions: ['심호흡 기법']
        }
      };
    }
  }
} 