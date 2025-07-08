import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { IChatRepository, SaveMessageData, Message } from '../../common/interfaces/repositories.interface';

@Injectable()
export class PrismaChatRepository implements IChatRepository {
  constructor(private prisma: PrismaService) {}

  async saveMessage(data: SaveMessageData): Promise<Message> {
    const message = await this.prisma.message.create({
      data: {
        userId: data.userId,
        content: data.content,
        role: data.role,
      },
    });

    return this.mapToDomain(message);
  }

  async findUserMessages(userId: string, limit?: number): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.map(message => this.mapToDomain(message));
  }

  async findMessagesBySession(sessionId: string): Promise<Message[]> {
    // Note: 현재 스키마에는 sessionId가 없으므로, 
    // 향후 세션 기반 메시지 그룹핑을 위해 확장 가능
    const messages = await this.prisma.message.findMany({
      where: { userId: sessionId }, // 임시로 userId 사용
      orderBy: { createdAt: 'asc' },
    });

    return messages.map(message => this.mapToDomain(message));
  }

  private mapToDomain(prismaMessage: any): Message {
    return {
      id: prismaMessage.id,
      userId: prismaMessage.userId,
      content: prismaMessage.content,
      role: prismaMessage.role,
      sessionId: prismaMessage.sessionId,
      createdAt: prismaMessage.createdAt,
    };
  }
} 