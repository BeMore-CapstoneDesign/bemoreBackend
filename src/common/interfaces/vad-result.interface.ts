export interface VadResult {
  valence: number;    // 감정의 긍정성 (0-1)
  arousal: number;    // 감정의 활성화 정도 (0-1)
  dominance: number;  // 감정의 지배성 (0-1)
  confidence: number; // 분석 신뢰도 (0-1)
}

export interface EmotionAnalysisResult {
  vad: VadResult;
  summary: string;
  cbtFeedback: string;
  timestamp: Date;
} 