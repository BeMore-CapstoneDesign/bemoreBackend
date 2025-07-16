export interface VADScore {
  valence: number;    // 감정의 긍정성 (0-1)
  arousal: number;    // 감정의 활성화 정도 (0-1)
  dominance: number;  // 감정의 지배성 (0-1)
}

export interface FacialAnalysisResult {
  vadScore: VADScore;
  confidence: number;
  landmarks: number[][];
  emotions: {
    [key: string]: number;
  };
}

export interface VoiceAnalysisResult {
  vadScore: VADScore;
  confidence: number;
  transcription: string;
  audioFeatures: {
    pitch: number;
    tempo: number;
    volume: number;
    clarity: number;
  };
}

export interface TextAnalysisResult {
  vadScore: VADScore;
  confidence: number;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface IntegratedEmotionAnalysis {
  overallVAD: VADScore;
  confidence: number;
  primaryEmotion: string;
  secondaryEmotions: string[];
  analysis: {
    facial?: FacialAnalysisResult;
    voice?: VoiceAnalysisResult;
    text?: TextAnalysisResult;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CBTFeedback {
  emotionAssessment: {
    currentState: string;
    triggers: string[];
    patterns: string[];
  };
  cognitiveTechniques: {
    technique: string;
    description: string;
    exercises: string[];
  };
  behavioralStrategies: {
    strategy: string;
    steps: string[];
    expectedOutcome: string;
  };
  progressTracking: {
    metrics: string[];
    goals: string[];
    timeline: string;
  };
} 