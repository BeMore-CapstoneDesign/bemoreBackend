import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('gemini')
  async chatWithGemini(@Body() request: ChatRequestDto): Promise<ChatResponseDto> {
    this.logger.log(`Chat request received: ${request.message}`);
    // 임시로 고정된 userId 사용 (실제로는 인증에서 가져와야 함)
    const userId = request.userId || 'default-user';
    return this.chatService.processChatMessage(request, userId);
  }

  @Get('context/:sessionId')
  async getConversationContext(@Param('sessionId') sessionId: string) {
    this.logger.log(`Context request for session: ${sessionId}`);
    return this.chatService.getConversationContext(sessionId);
  }

  @Get('history/:sessionId')
  async getConversationHistory(@Param('sessionId') sessionId: string) {
    this.logger.log(`History request for session: ${sessionId}`);
    return this.chatService.getConversationHistory(sessionId);
  }

  @Post('test-context')
  async testContextualResponse(@Body() request: { message: string; sessionId: string }) {
    this.logger.log(`Test contextual response for session: ${request.sessionId}`);
    return this.chatService.testContextualResponse(request.message, request.sessionId);
  }

  @Post('test-tokens')
  async testTokenManagement(@Body() request: { messages: Array<{ role: string; content: string }> }) {
    this.logger.log('Test token management');
    return this.chatService.testTokenManagement(request.messages);
  }
} 