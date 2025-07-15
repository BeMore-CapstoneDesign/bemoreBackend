import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../services/gemini.service';
import { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  async processChatMessage(request: ChatRequestDto, userId: string): Promise<ChatResponseDto> {
    try {
      // 세션 생성 또는 기존 세션 사용
      let sessionId = request.sessionId;
      if (!sessionId) {
        const session = await this.prisma.session.create({
          data: {
            userId,
            startTime: new Date(),
          },
        });
        sessionId = session.id;
      }

      // 사용자 메시지 저장
      const userMessage = await this.prisma.message.create({
        data: {
          sessionId,
          content: request.message,
          role: 'user',
          timestamp: new Date(),
        },
      });

      // Gemini API를 통한 응답 생성
      const geminiResponse = await this.geminiService.generateChatResponse(
        request.message,
        request.emotionContext,
      );

      // AI 응답 저장
      const assistantMessage = await this.prisma.message.create({
        data: {
          sessionId,
          content: geminiResponse.content,
          role: 'assistant',
          timestamp: new Date(),
          emotionAnalysis: geminiResponse.emotionAnalysis,
        },
      });

      // 세션 메시지 수 업데이트
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          messageCount: {
            increment: 2, // 사용자 메시지 + AI 응답
          },
        },
      });

      return {
        success: true,
        data: {
          id: assistantMessage.id,
          content: assistantMessage.content,
          role: assistantMessage.role,
          timestamp: assistantMessage.timestamp.toISOString(),
          sessionId,
          emotionAnalysis: {
            primaryEmotion: geminiResponse.emotionAnalysis.primaryEmotion,
            confidence: geminiResponse.emotionAnalysis.confidence,
            suggestions: geminiResponse.emotionAnalysis.suggestions,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error processing chat message:', error);
      throw new Error('Failed to process chat message');
    }
  }

  async getSessionMessages(sessionId: string): Promise<any[]> {
    try {
      const messages = await this.prisma.message.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'asc' },
      });

      return messages.map(message => ({
        id: message.id,
        content: message.content,
        role: message.role,
        timestamp: message.timestamp.toISOString(),
        emotionAnalysis: message.emotionAnalysis,
      }));
    } catch (error) {
      this.logger.error('Error fetching session messages:', error);
      throw new Error('Failed to fetch session messages');
    }
  }
} 