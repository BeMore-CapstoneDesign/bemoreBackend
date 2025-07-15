import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryResponseDto, SessionDto } from '../dto/history.dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(private prisma: PrismaService) {}

  async getUserSessions(userId: string): Promise<HistoryResponseDto> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
        orderBy: { startTime: 'desc' },
      });

      const sessionDtos: SessionDto[] = sessions.map(session => {
        // 감정 변화 추이 계산
        const emotionTrends = this.calculateEmotionTrends(session.messages);
        
        // 세션 요약 생성
        const summary = this.generateSessionSummary(session.messages);

        return {
          id: session.id,
          startTime: session.startTime.toISOString(),
          endTime: session.endTime?.toISOString(),
          messageCount: session.messageCount,
          emotionTrends,
          summary,
        };
      });

      return {
        success: true,
        data: {
          sessions: sessionDtos,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching user sessions:', error);
      throw new Error('세션 히스토리 조회 중 오류가 발생했습니다.');
    }
  }

  async generateSessionPdf(sessionId: string): Promise<Buffer> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      if (!session) {
        throw new Error('세션을 찾을 수 없습니다.');
      }

      // PDF 생성 로직 (실제로는 PDF 라이브러리 사용)
      const pdfContent = this.createPdfContent(session);
      
      // 임시로 텍스트를 Buffer로 반환 (실제로는 PDF 생성)
      return Buffer.from(pdfContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error generating session PDF:', error);
      throw new Error('PDF 생성 중 오류가 발생했습니다.');
    }
  }

  private calculateEmotionTrends(messages: any[]): string[] {
    const emotions = messages
      .filter(msg => msg.emotionAnalysis)
      .map(msg => msg.emotionAnalysis.primaryEmotion);
    
    return emotions.slice(-10); // 최근 10개 감정만 반환
  }

  private generateSessionSummary(messages: any[]): string {
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    
    return `총 ${messages.length}개의 메시지가 교환되었습니다. 사용자: ${userMessages.length}개, AI: ${assistantMessages.length}개`;
  }

  private createPdfContent(session: any): string {
    const messages = session.messages;
    const emotionTrends = this.calculateEmotionTrends(messages);
    
    return `
세션 리포트
==========
세션 ID: ${session.id}
시작 시간: ${session.startTime}
종료 시간: ${session.endTime || '진행 중'}
총 메시지 수: ${session.messageCount}

감정 변화 추이:
${emotionTrends.join(' → ')}

대화 요약:
${this.generateSessionSummary(messages)}

CBT 기법 제안:
- 심호흡 기법
- 마음챙김 명상
- 인지 재구성
    `;
  }
} 