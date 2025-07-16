import { Injectable, Logger } from '@nestjs/common';
import { VADScore, TextAnalysisResult } from '../../../types/vad.types';

@Injectable()
export class TextAnalysisService {
  private readonly logger = new Logger(TextAnalysisService.name);
  private readonly emotionKeywords: { [key: string]: VADScore } = {
    // 긍정적 감정 키워드
    '기쁘': { valence: 0.9, arousal: 0.7, dominance: 0.8 },
    '행복': { valence: 0.95, arousal: 0.6, dominance: 0.7 },
    '좋': { valence: 0.8, arousal: 0.5, dominance: 0.6 },
    '설레': { valence: 0.85, arousal: 0.8, dominance: 0.7 },
    '신나': { valence: 0.9, arousal: 0.9, dominance: 0.8 },
    '성공': { valence: 0.8, arousal: 0.7, dominance: 0.9 },
    '자신감': { valence: 0.7, arousal: 0.6, dominance: 0.9 },
    '감사': { valence: 0.9, arousal: 0.5, dominance: 0.6 },
    '만족': { valence: 0.8, arousal: 0.4, dominance: 0.7 },
    '편안': { valence: 0.7, arousal: 0.2, dominance: 0.5 },
    '평온': { valence: 0.7, arousal: 0.2, dominance: 0.6 },
    
    // 부정적 감정 키워드
    '힘들': { valence: 0.2, arousal: 0.6, dominance: 0.2 },
    '스트레스': { valence: 0.2, arousal: 0.8, dominance: 0.3 },
    '화나': { valence: 0.1, arousal: 0.9, dominance: 0.8 },
    '우울': { valence: 0.2, arousal: 0.2, dominance: 0.1 },
    '걱정': { valence: 0.3, arousal: 0.7, dominance: 0.2 },
    '불안': { valence: 0.3, arousal: 0.8, dominance: 0.2 },
    '슬프': { valence: 0.1, arousal: 0.3, dominance: 0.2 },
    '실망': { valence: 0.2, arousal: 0.4, dominance: 0.2 },
    '분노': { valence: 0.1, arousal: 0.9, dominance: 0.8 },
    '짜증': { valence: 0.2, arousal: 0.8, dominance: 0.6 },
    '답답': { valence: 0.2, arousal: 0.7, dominance: 0.3 },
    '무서': { valence: 0.1, arousal: 0.8, dominance: 0.2 },
    
    // 강도 키워드
    '정말': { valence: 0.0, arousal: 0.3, dominance: 0.0 },
    '너무': { valence: 0.0, arousal: 0.3, dominance: 0.0 },
    '완전히': { valence: 0.0, arousal: 0.3, dominance: 0.0 },
    '조금': { valence: 0.0, arousal: -0.2, dominance: 0.0 },
    '약간': { valence: 0.0, arousal: -0.2, dominance: 0.0 },
    '매우': { valence: 0.0, arousal: 0.3, dominance: 0.0 },
    '굉장히': { valence: 0.0, arousal: 0.3, dominance: 0.0 },
  };

  /**
   * 텍스트 기반 감정 분석
   */
  async analyzeTextEmotion(text: string): Promise<TextAnalysisResult> {
    try {
      this.logger.log(`Analyzing text emotion: "${text}"`);

      if (!text || text.trim().length === 0) {
        return this.getDefaultTextAnalysis();
      }

      // VAD 점수 계산
      const vadScore = this.calculateVADFromText(text);
      
      // 주요 감정 분류
      const primaryEmotion = this.classifyEmotion(vadScore);
      
      // 신뢰도 계산
      const confidence = this.calculateConfidence(text);
      
      // 키워드 분석
      const keywords = this.extractKeywords(text);
      
      // 감정 강도 분석
      const intensity = this.analyzeIntensity(text);

      return {
        vadScore,
        confidence,
        primaryEmotion,
        keywords,
        intensity,
        textLength: text.length,
      };
    } catch (error) {
      this.logger.error('Error in text emotion analysis:', error);
      return this.getDefaultTextAnalysis();
    }
  }

  /**
   * 텍스트에서 VAD 점수 계산
   */
  private calculateVADFromText(text: string): VADScore {
    const words = text.toLowerCase().split(/\s+/);
    let totalVAD = { valence: 0, arousal: 0, dominance: 0 };
    let wordCount = 0;
    let intensityMultiplier = 1.0;

    for (const word of words) {
      // 강도 키워드 확인
      if (this.emotionKeywords[word] && 
          (word === '정말' || word === '너무' || word === '완전히' || word === '매우' || word === '굉장히')) {
        intensityMultiplier = 1.5;
        continue;
      }
      
      if (word === '조금' || word === '약간') {
        intensityMultiplier = 0.7;
        continue;
      }

      // 감정 키워드 확인
      for (const [keyword, vadScore] of Object.entries(this.emotionKeywords)) {
        if (word.includes(keyword)) {
          totalVAD.valence += vadScore.valence * intensityMultiplier;
          totalVAD.arousal += vadScore.arousal * intensityMultiplier;
          totalVAD.dominance += vadScore.dominance * intensityMultiplier;
          wordCount++;
          break;
        }
      }
      
      // 강도 리셋
      intensityMultiplier = 1.0;
    }

    if (wordCount > 0) {
      return {
        valence: Math.max(0, Math.min(1, totalVAD.valence / wordCount)),
        arousal: Math.max(0, Math.min(1, totalVAD.arousal / wordCount)),
        dominance: Math.max(0, Math.min(1, totalVAD.dominance / wordCount)),
      };
    }

    // 키워드가 없으면 중립
    return { valence: 0.5, arousal: 0.5, dominance: 0.5 };
  }

  /**
   * 감정 분류
   */
  private classifyEmotion(vadScore: VADScore): string {
    const { valence, arousal, dominance } = vadScore;

    // 기쁨: 높은 긍정성 (valence > 0.7)
    if (valence > 0.7) {
      return 'happy';
    }
    
    // 슬픔: 낮은 긍정성 (valence < 0.4)
    else if (valence < 0.4) {
      return 'sad';
    }
    
    // 분노: 낮은 긍정성 + 높은 각성도
    else if (valence < 0.4 && arousal > 0.7) {
      return 'angry';
    }
    
    // 놀람: 중간 긍정성 + 높은 각성도
    else if (valence > 0.3 && valence < 0.6 && arousal > 0.7) {
      return 'surprised';
    }
    
    // 중립: 중간 긍정성
    else {
      return 'neutral';
    }
  }

  /**
   * 신뢰도 계산
   */
  private calculateConfidence(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let keywordCount = 0;
    
    for (const word of words) {
      for (const keyword of Object.keys(this.emotionKeywords)) {
        if (word.includes(keyword)) {
          keywordCount++;
          break;
        }
      }
    }
    
    // 키워드 비율에 따른 신뢰도 계산
    const keywordRatio = keywordCount / words.length;
    return Math.min(0.95, Math.max(0.3, keywordRatio * 2));
  }

  /**
   * 키워드 추출
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const keywords: string[] = [];
    
    for (const word of words) {
      for (const keyword of Object.keys(this.emotionKeywords)) {
        if (word.includes(keyword)) {
          keywords.push(keyword);
          break;
        }
      }
    }
    
    return keywords;
  }

  /**
   * 감정 강도 분석
   */
  private analyzeIntensity(text: string): 'low' | 'medium' | 'high' {
    const intensityWords = ['정말', '너무', '완전히', '매우', '굉장히'];
    const lowIntensityWords = ['조금', '약간'];
    
    const textLower = text.toLowerCase();
    
    for (const word of intensityWords) {
      if (textLower.includes(word.toLowerCase())) {
        return 'high';
      }
    }
    
    for (const word of lowIntensityWords) {
      if (textLower.includes(word.toLowerCase())) {
        return 'low';
      }
    }
    
    return 'medium';
  }

  /**
   * 기본 텍스트 분석 결과
   */
  private getDefaultTextAnalysis(): TextAnalysisResult {
    return {
      vadScore: { valence: 0.5, arousal: 0.5, dominance: 0.5 },
      confidence: 0.3,
      primaryEmotion: 'neutral',
      keywords: [],
      intensity: 'medium',
      textLength: 0,
    };
  }
} 