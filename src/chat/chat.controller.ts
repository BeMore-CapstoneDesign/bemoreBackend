import { Controller, Post, Body, UseGuards, Request, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  
  constructor(private readonly chatService: ChatService) {}

  @Post('gemini')
  async chatWithGemini(
    @Body() chatRequestDto: ChatRequestDto,
    @Request() req: any,
  ): Promise<ChatResponseDto> {
    try {
      // 임시로 userId를 하드코딩 (실제로는 JWT 토큰에서 추출)
      const userId = 'temp-user-id';
      
      const response = await this.chatService.processChatMessage(chatRequestDto, userId);
      return response;
    } catch (error) {
      this.logger.error('Chat error:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || '채팅 처리 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 