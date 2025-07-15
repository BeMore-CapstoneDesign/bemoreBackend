import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { EmotionService } from './emotion.service';
import { EmotionAnalysisRequestDto, EmotionAnalysisResponseDto } from '../dto/emotion.dto';

@Controller('api/emotion')
export class EmotionController {
  constructor(private readonly emotionService: EmotionService) {}

  @Post('analyze')
  async analyzeEmotion(
    @Body() request: EmotionAnalysisRequestDto,
  ): Promise<EmotionAnalysisResponseDto> {
    try {
      // 임시로 userId를 하드코딩 (실제로는 JWT 토큰에서 추출)
      const userId = 'temp-user-id';

      const response = await this.emotionService.analyzeEmotion(request, userId);
      return response;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || '감정 분석 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 