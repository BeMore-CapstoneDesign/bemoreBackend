import { Controller, Get, Post, Param, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { HistoryService } from './history.service';
import { HistoryResponseDto } from '../dto/history.dto';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get(':userId')
  async getUserHistory(@Param('userId') userId: string): Promise<HistoryResponseDto> {
    try {
      return await this.historyService.getUserSessions(userId);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || '히스토리 조회 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('session/:sessionId/pdf')
  async generateSessionPdf(
    @Param('sessionId') sessionId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const pdfBuffer = await this.historyService.generateSessionPdf(sessionId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="session-${sessionId}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'PDF 생성 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 