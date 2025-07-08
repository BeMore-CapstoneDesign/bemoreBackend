import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { IEmotionAnalysisRepository, SaveSessionData, Session } from '../../common/interfaces/repositories.interface';

@Injectable()
export class PrismaEmotionAnalysisRepository implements IEmotionAnalysisRepository {
  constructor(private prisma: PrismaService) {}

  async saveSession(data: SaveSessionData): Promise<Session> {
    const session = await this.prisma.session.create({
      data: {
        userId: data.userId,
        vad: data.vad,
        summary: data.summary,
        pdfUrl: data.pdfUrl,
      },
    });

    return this.mapToDomain(session);
  }

  async findUserSessions(userId: string, limit?: number): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return sessions.map(session => this.mapToDomain(session));
  }

  async findSessionById(sessionId: string, userId: string): Promise<Session | null> {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    return session ? this.mapToDomain(session) : null;
  }

  async updateSession(sessionId: string, data: Partial<Session>): Promise<Session> {
    const session = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        vad: data.vad,
        summary: data.summary,
        pdfUrl: data.pdfUrl,
        updatedAt: new Date(),
      },
    });

    return this.mapToDomain(session);
  }

  private mapToDomain(prismaSession: any): Session {
    return {
      id: prismaSession.id,
      userId: prismaSession.userId,
      date: prismaSession.date,
      vad: prismaSession.vad,
      summary: prismaSession.summary,
      pdfUrl: prismaSession.pdfUrl,
      createdAt: prismaSession.createdAt,
      updatedAt: prismaSession.updatedAt,
    };
  }
} 