import { IsString, IsOptional, IsObject } from 'class-validator';

export class EmotionContext {
  @IsString()
  currentEmotion: string;

  @IsString({ each: true })
  emotionHistory: string[];
}

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsObject()
  emotionContext?: EmotionContext;
}

export class ChatResponseDto {
  success: boolean;
  data: {
    id: string;
    content: string;
    role: string;
    timestamp: string;
    sessionId: string;
    emotionAnalysis: {
      primaryEmotion: string;
      confidence: number;
      suggestions: string[];
    };
  };
} 