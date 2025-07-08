import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IChatRepository, Message } from '../../common/interfaces/repositories.interface';
import { IChatService, ChatInput, ChatResponse } from '../../common/interfaces/services.interface';

@Injectable()
export class ChatDomainService implements IChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private chatRepository: IChatRepository,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async chatWithAI(data: ChatInput): Promise<ChatResponse> {
    const { message, history = [], userId } = data;

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
      await this.chatRepository.saveMessage({
        userId,
        content: message,
        role: 'user',
      });
      
      await this.chatRepository.saveMessage({
        userId,
        content: responseText,
        role: 'assistant',
      });

      return {
        message: responseText,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error('Gemini AI와의 대화 중 오류가 발생했습니다.');
    }
  }

  async getChatHistory(userId: string, limit?: number): Promise<Message[]> {
    return this.chatRepository.findUserMessages(userId, limit);
  }
} 