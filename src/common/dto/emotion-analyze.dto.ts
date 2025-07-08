import { IsOptional, IsString, IsBase64 } from 'class-validator';

export class EmotionAnalyzeDto {
  @IsOptional()
  @IsBase64()
  image?: string;

  @IsOptional()
  @IsBase64()
  audio?: string;

  @IsOptional()
  @IsString()
  text?: string;
} 