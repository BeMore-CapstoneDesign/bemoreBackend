import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../services/gemini.service';
import { EmotionAnalysisRequestDto, EmotionAnalysisResponseDto, MediaType } from '../dto/emotion.dto';

@Injectable()
export class EmotionService {
  private readonly logger = new Logger(EmotionService.name);

  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  async analyzeEmotion(request: EmotionAnalysisRequestDto, userId: string): Promise<EmotionAnalysisResponseDto> {
    try {
      let content = '';
      
      // 미디어 타입에 따른 내용 추출
      switch (request.mediaType) {
        case MediaType.TEXT:
          content = request.text || '';
          break;
        case MediaType.AUDIO:
          content = '오디오 파일 분석 결과'; // 실제로는 오디오 파일을 텍스트로 변환
          break;
        case MediaType.IMAGE:
          content = '이미지 파일 분석 결과'; // 실제로는 이미지 분석 결과
          break;
        default:
          throw new Error('지원하지 않는 미디어 타입입니다.');
      }

      // Gemini API를 통한 감정 분석
      const analysisResult = await this.geminiService.analyzeEmotion(content, request.mediaType);

      // 세션이 있는 경우 메시지로 저장
      if (request.sessionId) {
        await this.prisma.message.create({
          data: {
            sessionId: request.sessionId,
            content: content,
            role: 'user',
            timestamp: new Date(),
            emotionAnalysis: analysisResult,
          },
        });
      }

      return {
        success: true,
        data: {
          primaryEmotion: analysisResult.primaryEmotion,
          secondaryEmotions: analysisResult.secondaryEmotions || [],
          confidence: analysisResult.confidence,
          intensity: analysisResult.intensity,
          analysis: analysisResult.analysis,
          cbtSuggestions: analysisResult.cbtSuggestions || [],
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error analyzing emotion:', error);
      throw new Error('감정 분석 중 오류가 발생했습니다.');
    }
  }
} 