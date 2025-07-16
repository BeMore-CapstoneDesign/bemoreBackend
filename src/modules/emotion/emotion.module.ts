import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmotionController } from './controllers/emotion.controller';
import { FacialAnalysisService } from './services/facial-analysis.service';
import { VoiceAnalysisService } from './services/voice-analysis.service';
import { MultimodalAnalysisService } from './services/multimodal-analysis.service';
import { PsychologicalAnalysisService } from '../cbt/services/psychological-analysis.service';
import { GeminiService } from '../../services/gemini.service';

@Module({
  imports: [ConfigModule],
  controllers: [EmotionController],
  providers: [
    FacialAnalysisService,
    VoiceAnalysisService,
    MultimodalAnalysisService,
    PsychologicalAnalysisService,
    GeminiService,
  ],
  exports: [
    FacialAnalysisService,
    VoiceAnalysisService,
    MultimodalAnalysisService,
    PsychologicalAnalysisService,
  ],
})
export class EmotionModule {} 