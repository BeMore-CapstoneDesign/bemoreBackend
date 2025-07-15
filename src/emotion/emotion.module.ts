import { Module } from '@nestjs/common';
import { EmotionController } from './emotion.controller';
import { EmotionService } from './emotion.service';
import { GeminiService } from '../services/gemini.service';

@Module({
  controllers: [EmotionController],
  providers: [EmotionService, GeminiService],
  exports: [EmotionService],
})
export class EmotionModule {} 