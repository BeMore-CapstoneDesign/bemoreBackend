import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GeminiService } from '../services/gemini.service';
import { ContextService } from '../services/context.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [ChatService, GeminiService, ContextService],
  exports: [ChatService],
})
export class ChatModule {} 