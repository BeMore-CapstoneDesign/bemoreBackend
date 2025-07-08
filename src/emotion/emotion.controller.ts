import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EmotionService } from './emotion.service';
import { EmotionAnalyzeDto } from '../common/dto/emotion-analyze.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/emotion')
export class EmotionController {
  constructor(private readonly emotionService: EmotionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  async analyzeEmotion(
    @Body() emotionAnalyzeDto: EmotionAnalyzeDto,
    @Request() req,
  ) {
    const result = await this.emotionService.analyzeEmotion(emotionAnalyzeDto);
    
    // TODO: 세션 저장 로직 추가
    // await this.historyService.saveSession(req.user.userId, result);
    
    return result;
  }
} 