import { Injectable } from '@nestjs/common';
import { IEmotionAnalysisRepository, Session } from '../../common/interfaces/repositories.interface';
import { IHistoryService, EmotionAnalysisResult } from '../../common/interfaces/services.interface';

@Injectable()
export class HistoryDomainService implements IHistoryService {
  constructor(private emotionAnalysisRepository: IEmotionAnalysisRepository) {}

  async saveSession(userId: string, analysisResult: EmotionAnalysisResult): Promise<Session> {
    return this.emotionAnalysisRepository.saveSession({
      userId,
      vad: analysisResult.vad,
      summary: analysisResult.summary,
      pdfUrl: undefined, // TODO: PDF 생성 로직 추가
    });
  }

  async getUserHistory(userId: string): Promise<Session[]> {
    return this.emotionAnalysisRepository.findUserSessions(userId);
  }

  async getSessionById(sessionId: string, userId: string): Promise<Session | null> {
    return this.emotionAnalysisRepository.findSessionById(sessionId, userId);
  }

  async generatePDF(sessionId: string, userId: string): Promise<{ pdfUrl: string }> {
    // TODO: PDF 생성 로직 구현
    const session = await this.getSessionById(sessionId, userId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    // PDF 생성 후 URL 반환
    const pdfUrl = `/reports/${sessionId}.pdf`;
    
    // PDF URL 업데이트
    await this.emotionAnalysisRepository.updateSession(sessionId, { pdfUrl });

    return { pdfUrl };
  }
} 