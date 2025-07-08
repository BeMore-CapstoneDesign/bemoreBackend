import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatRequestDto, ChatMessageDto } from '../common/dto/chat.dto';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async chatWithGemini(chatRequestDto: ChatRequestDto, userId: string) {
    const { message, history = [] } = chatRequestDto;

    try {
      // 대화 히스토리 구성
      const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      // Gemini 채팅 시작
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      // 메시지 전송
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const responseText = response.text();

      // 대화 내용 저장
      await this.saveMessage(userId, message, 'user');
      await this.saveMessage(userId, responseText, 'assistant');

      return {
        message: responseText,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error('Gemini AI와의 대화 중 오류가 발생했습니다.');
    }
  }

  private async saveMessage(userId: string, content: string, role: string) {
    await this.prisma.message.create({
      data: {
        userId,
        content,
        role,
      },
    });
  }

  async getChatHistory(userId: string, limit = 50) {
    return this.prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
} 