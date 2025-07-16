import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../services/gemini.service';
import { ContextService } from '../services/context.service';
import { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
    private contextService: ContextService,
  ) {}

  async processChatMessage(request: ChatRequestDto, userId: string): Promise<ChatResponseDto> {
    try {
      // 먼저 사용자가 존재하는지 확인하고, 없으면 생성
      let user = await this.prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@temp.com`,
            name: '임시 사용자'
          }
        });
      }
      
      // 항상 새로운 세션 생성 (기존 sessionId 무시)
      const session = await this.prisma.session.create({
        data: {
          userId: user.id,
        },
      });
      
      const sessionId = session.id;

      // 사용자 메시지 저장
      const userMessage = await this.prisma.message.create({
        data: {
          sessionId,
          content: request.message,
          role: 'user',
          timestamp: new Date(),
        },
      });

      // 대화 컨텍스트 가져오기
      let conversationContext = '';
      try {
        const context = await this.contextService.getConversationContext(sessionId);
        if (context.messages.length > 0) {
          conversationContext = this.contextService.formatContextForPrompt(context);
        }
      } catch (error) {
        this.logger.warn('Failed to retrieve conversation context:', error);
      }

      // 컨텍스트가 있으면 컨텍스트를 포함한 응답 생성, 없으면 기본 응답 생성
      let geminiResponse;
      if (conversationContext) {
        geminiResponse = await this.geminiService.generateContextualChatResponse(
          request.message,
          conversationContext,
        );
      } else {
        geminiResponse = await this.geminiService.generateChatResponse(
          request.message,
          request.emotionContext,
        );
      }

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
      this.logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error(`Failed to process chat message: ${error.message}`);
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

  /**
   * 대화 컨텍스트 가져오기
   */
  async getConversationContext(sessionId: string) {
    try {
      return await this.contextService.getConversationContext(sessionId);
    } catch (error) {
      this.logger.error('Error getting conversation context:', error);
      throw new Error('Failed to get conversation context');
    }
  }

  /**
   * 대화 히스토리 가져오기
   */
  async getConversationHistory(sessionId: string) {
    try {
      return await this.getSessionMessages(sessionId);
    } catch (error) {
      this.logger.error('Error getting conversation history:', error);
      throw new Error('Failed to get conversation history');
    }
  }

  /**
   * 컨텍스트를 포함한 응답 테스트
   */
  async testContextualResponse(message: string, sessionId: string) {
    try {
      const context = await this.contextService.getConversationContext(sessionId);
      const conversationContext = this.contextService.formatContextForPrompt(context);
      
      const response = await this.geminiService.generateContextualChatResponse(
        message,
        conversationContext,
      );

      return {
        success: true,
        data: {
          message,
          context: context.messages,
          response,
          contextLength: context.messages.length,
          estimatedTokens: context.totalTokens,
        },
      };
    } catch (error) {
      this.logger.error('Error testing contextual response:', error);
      throw new Error('Failed to test contextual response');
    }
  }

  /**
   * 토큰 관리 테스트
   */
  async testTokenManagement(messages: Array<{ role: string; content: string }>) {
    try {
      // 간단한 토큰 계산 (실제로는 TokenManagerService 사용)
      const totalTokens = messages.reduce((total, msg) => {
        return total + Math.ceil(msg.content.length / 4);
      }, 0);

      return {
        success: true,
        data: {
          messageCount: messages.length,
          totalTokens,
          averageTokensPerMessage: Math.round(totalTokens / messages.length),
          isOverLimit: totalTokens > 800000,
          recommendations: totalTokens > 800000 ? 
            ['메시지 수 줄이기', '긴 메시지 축약', '컨텍스트 요약'] : 
            ['현재 상태 유지 가능'],
        },
      };
    } catch (error) {
      this.logger.error('Error testing token management:', error);
      throw new Error('Failed to test token management');
    }
  }
} 