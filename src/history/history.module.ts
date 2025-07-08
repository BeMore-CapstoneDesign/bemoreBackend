import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService, PrismaService],
  exports: [HistoryService],
})
export class HistoryModule {} 