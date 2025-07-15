import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      this.logger.warn('GEMINI_API_KEY is not configured, using mock responses');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async analyzeEmotion(content: string, mediaType: 'text' | 'audio' | 'image'): Promise<any> {
    try {
      if (!this.model) {
        // Mock response when API key is not configured
        return {
          primaryEmotion: '중립',
          secondaryEmotions: ['호기심'],
          confidence: 0.8,
          intensity: 0.6,
          analysis: '사용자의 메시지를 분석한 결과, 전반적으로 중립적인 감정 상태로 보입니다.',
          cbtSuggestions: ['심호흡 기법', '마음챙김 명상', '긍정적 사고 전환']
        };
      }

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
      if (!this.model) {
        // Mock response when API key is not configured
        return {
          content: `안녕하세요! ${message}에 대해 말씀해주셨네요. 현재 상황을 더 자세히 설명해주시면, 적절한 CBT 기법을 제안해드릴 수 있습니다. 어떤 부분에서 도움이 필요하신가요?`,
          emotionAnalysis: {
            primaryEmotion: '중립',
            confidence: 0.7,
            suggestions: ['심호흡 기법', '마음챙김 명상', '인지 재구성']
          }
        };
      }

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