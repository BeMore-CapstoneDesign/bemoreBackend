import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConversationContext {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  totalTokens?: number;
}

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);
  private readonly MAX_CONTEXT_MESSAGES = 20; // 최대 컨텍스트 메시지 수
  private readonly MAX_TOKENS = 800000; // Gemini 2.5-flash 토큰 제한의 80% 사용

  constructor(private prisma: PrismaService) {}

  /**
   * 세션의 대화 히스토리를 가져와서 컨텍스트로 구성
   */
  async getConversationContext(sessionId: string): Promise<ConversationContext> {
    try {
      // Prisma 쿼리를 더 간단하게 작성
      const messages = await this.prisma.message.findMany({
        where: { sessionId },
        orderBy: { id: 'asc' }, // ID로 정렬 (시간 순서와 동일)
        select: {
          role: true,
          content: true,
        },
      });

      // 메시지 수 제한 적용
      const limitedMessages = this.truncateMessages(messages);
      
      // 토큰 수 추정 (대략적인 계산)
      const totalTokens = this.estimateTokens(limitedMessages);

      return {
        sessionId,
        messages: limitedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(), // 현재 시간으로 설정
        })),
        totalTokens,
      };
    } catch (error) {
      this.logger.error('Error retrieving conversation context:', error);
      throw new Error('Failed to retrieve conversation context');
    }
  }

  /**
   * 메시지 수를 제한하여 컨텍스트 윈도우 관리
   */
  private truncateMessages(messages: any[]): any[] {
    if (messages.length <= this.MAX_CONTEXT_MESSAGES) {
      return messages;
    }

    // 최근 메시지들을 우선적으로 유지
    const recentMessages = messages.slice(-this.MAX_CONTEXT_MESSAGES);
    
    // 첫 번째 메시지(시작점)는 항상 유지
    if (messages.length > 0 && recentMessages[0].role !== messages[0].role) {
      recentMessages.unshift(messages[0]);
    }

    return recentMessages;
  }

  /**
   * 토큰 수를 대략적으로 추정 (실제 토큰화는 Gemini API에서 처리)
   */
  private estimateTokens(messages: any[]): number {
    let totalTokens = 0;
    
    for (const message of messages) {
      // 한국어 기준으로 대략적인 토큰 수 계산
      // 1 토큰 ≈ 4글자 (한국어)
      const estimatedTokens = Math.ceil(message.content.length / 4);
      totalTokens += estimatedTokens;
    }

    return totalTokens;
  }

  /**
   * 컨텍스트가 토큰 제한을 초과하는지 확인
   */
  isContextTooLong(context: ConversationContext): boolean {
    return (context.totalTokens || 0) > this.MAX_TOKENS;
  }

  /**
   * 긴 컨텍스트를 요약하여 축소
   */
  async summarizeLongContext(context: ConversationContext): Promise<ConversationContext> {
    if (!this.isContextTooLong(context)) {
      return context;
    }

    // 가장 최근 메시지들을 우선적으로 유지
    const recentMessages = context.messages.slice(-10);
    
    // 오래된 메시지들은 요약 생성
    const oldMessages = context.messages.slice(0, -10);
    if (oldMessages.length > 0) {
      const summary = await this.createConversationSummary(oldMessages);
      
      // 요약을 첫 번째 메시지로 추가
      const summarizedMessages = [
        {
          role: 'assistant' as const,
          content: `[이전 대화 요약] ${summary}`,
          timestamp: new Date(),
        },
        ...recentMessages,
      ];

      const summarizedContext: ConversationContext = {
        sessionId: context.sessionId,
        messages: summarizedMessages,
        totalTokens: this.estimateTokens(summarizedMessages),
      };

      return summarizedContext;
    }

    return context;
  }

  /**
   * 오래된 대화 내용을 요약
   */
  private async createConversationSummary(messages: any[]): Promise<string> {
    // 간단한 요약 로직 (실제로는 Gemini API를 사용하여 요약 생성)
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    return `사용자가 ${userMessages.length}개의 메시지를 보냈고, 상담사가 ${assistantMessages.length}개의 응답을 제공했습니다. 주요 주제는 감정 상태와 일상적인 스트레스에 관한 것이었습니다.`;
  }

  /**
   * 컨텍스트를 프롬프트 형식으로 변환
   */
  formatContextForPrompt(context: ConversationContext): string {
    if (context.messages.length === 0) {
      return '';
    }

    let prompt = '\n\n이전 대화 내용:\n';
    
    for (const message of context.messages) {
      const role = message.role === 'user' ? '사용자' : '상담사';
      prompt += `[${role}]: ${message.content}\n`;
    }

    prompt += '\n위의 대화 맥락을 고려하여 적절한 응답을 제공해주세요.\n';
    
    return prompt;
  }
} 