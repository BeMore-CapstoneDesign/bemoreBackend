import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { EmotionAnalysisResult } from '../common/interfaces/vad-result.interface';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async saveSession(userId: string, analysisResult: EmotionAnalysisResult) {
    return this.prisma.session.create({
      data: {
        userId,
        vad: analysisResult.vad,
        summary: analysisResult.summary,
        pdfUrl: null, // TODO: PDF 생성 로직 추가
      },
    });
  }

  async getUserHistory(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        date: true,
        vad: true,
        summary: true,
        pdfUrl: true,
        createdAt: true,
      },
    });
  }

  async getSessionById(sessionId: string, userId: string) {
    return this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      select: {
        id: true,
        date: true,
        vad: true,
        summary: true,
        pdfUrl: true,
        createdAt: true,
      },
    });
  }

  async generatePDF(sessionId: string, userId: string) {
    // TODO: PDF 생성 로직 구현
    const session = await this.getSessionById(sessionId, userId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    // PDF 생성 후 URL 반환
    const pdfUrl = `/reports/${sessionId}.pdf`;
    
    // PDF URL 업데이트
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { pdfUrl },
    });

    return { pdfUrl };
  }
} 