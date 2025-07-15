export class SessionDto {
  id: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  emotionTrends: string[];
  summary?: string;
}

export class HistoryResponseDto {
  success: boolean;
  data: {
    sessions: SessionDto[];
  };
} 