import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PsychologicalAnalysisService } from './services/psychological-analysis.service';
import { GeminiService } from '../../services/gemini.service';

@Module({
  imports: [ConfigModule],
  providers: [PsychologicalAnalysisService, GeminiService],
  exports: [PsychologicalAnalysisService],
})
export class CBTModule {} 