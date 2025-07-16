import { IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class VADScoreDto {
  @IsNumber()
  valence: number;

  @IsNumber()
  arousal: number;

  @IsNumber()
  dominance: number;
}

export class FacialAnalysisDto {
  @ValidateNested()
  @Type(() => VADScoreDto)
  vadScore: VADScoreDto;

  @IsNumber()
  confidence: number;

  @IsArray()
  @IsNumber({}, { each: true })
  landmarks: number[][];

  emotions: { [key: string]: number };
}

export class VoiceAnalysisDto {
  @ValidateNested()
  @Type(() => VADScoreDto)
  vadScore: VADScoreDto;

  @IsNumber()
  confidence: number;

  @IsString()
  transcription: string;

  audioFeatures: {
    pitch: number;
    tempo: number;
    volume: number;
    clarity: number;
  };
}

export class TextAnalysisDto {
  @ValidateNested()
  @Type(() => VADScoreDto)
  vadScore: VADScoreDto;

  @IsNumber()
  confidence: number;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsString()
  sentiment: 'positive' | 'negative' | 'neutral';
}

export class MultimodalAnalysisDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FacialAnalysisDto)
  facial?: FacialAnalysisDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VoiceAnalysisDto)
  voice?: VoiceAnalysisDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TextAnalysisDto)
  text?: TextAnalysisDto;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class IntegratedEmotionAnalysisDto {
  @ValidateNested()
  @Type(() => VADScoreDto)
  overallVAD: VADScoreDto;

  @IsNumber()
  confidence: number;

  @IsString()
  primaryEmotion: string;

  @IsArray()
  @IsString({ each: true })
  secondaryEmotions: string[];

  @IsOptional()
  analysis?: {
    facial?: FacialAnalysisDto;
    voice?: VoiceAnalysisDto;
    text?: TextAnalysisDto;
  };

  @IsArray()
  @IsString({ each: true })
  recommendations: string[];

  @IsString()
  riskLevel: 'low' | 'medium' | 'high';
}

export class CBTFeedbackDto {
  @ValidateNested()
  @Type(() => Object)
  emotionAssessment: {
    currentState: string;
    triggers: string[];
    patterns: string[];
  };

  @ValidateNested()
  @Type(() => Object)
  cognitiveTechniques: {
    technique: string;
    description: string;
    exercises: string[];
  };

  @ValidateNested()
  @Type(() => Object)
  behavioralStrategies: {
    strategy: string;
    steps: string[];
    expectedOutcome: string;
  };

  @ValidateNested()
  @Type(() => Object)
  progressTracking: {
    metrics: string[];
    goals: string[];
    timeline: string;
  };
}

export class EmotionHistoryDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class RiskAssessmentDto {
  @ValidateNested()
  @Type(() => VADScoreDto)
  vadScore: VADScoreDto;

  @IsString()
  context: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
} 