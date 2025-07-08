import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from '../common/dto/chat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('gemini')
  async chatWithGemini(
    @Body() chatRequestDto: ChatRequestDto,
    @Request() req,
  ) {
    return this.chatService.chatWithGemini(chatRequestDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getChatHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getChatHistory(req.user.userId, limitNum);
  }
} 