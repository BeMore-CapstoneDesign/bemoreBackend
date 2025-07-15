import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum MediaType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
}

export class EmotionAnalysisRequestDto {
  @IsEnum(MediaType)
  mediaType: MediaType;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class EmotionAnalysisResponseDto {
  success: boolean;
  data: {
    primaryEmotion: string;
    secondaryEmotions: string[];
    confidence: number;
    intensity: number;
    analysis: string;
    cbtSuggestions: string[];
    timestamp: string;
  };
} 