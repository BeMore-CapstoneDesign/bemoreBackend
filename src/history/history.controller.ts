import { Controller, Get, Param, UseGuards, Request, Post } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getUserHistory(@Param('userId') userId: string, @Request() req) {
    // 사용자 본인의 히스토리만 조회 가능
    if (req.user.userId !== userId) {
      throw new Error('권한이 없습니다.');
    }
    return this.historyService.getUserHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('session/:sessionId')
  async getSessionById(@Param('sessionId') sessionId: string, @Request() req) {
    return this.historyService.getSessionById(sessionId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('session/:sessionId/pdf')
  async generatePDF(@Param('sessionId') sessionId: string, @Request() req) {
    return this.historyService.generatePDF(sessionId, req.user.userId);
  }
} 