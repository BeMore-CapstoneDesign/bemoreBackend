import { IsString, IsArray, IsOptional } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  content: string;

  @IsString()
  role: 'user' | 'assistant';
}

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  history?: ChatMessageDto[];
} 