import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../../services/gemini.service';
import { VADScore, CBTFeedback } from '../../../types/vad.types';

@Injectable()
export class PsychologicalAnalysisService {
  private readonly logger = new Logger(PsychologicalAnalysisService.name);

  constructor(private geminiService: GeminiService) {}

  /**
   * CBT 피드백 생성
   */
  async generateCBTFeedback(
    vadScore: VADScore,
    context: string,
    emotionHistory: any[]
  ): Promise<CBTFeedback> {
    try {
      this.logger.log('Generating CBT feedback based on VAD analysis');

      // Gemini API를 사용한 CBT 피드백 생성
      const prompt = this.buildCBTFeedbackPrompt(vadScore, context, emotionHistory);
      
      const response = await this.geminiService.generateContent(prompt);
      
      return this.parseCBTFeedback(response);
    } catch (error) {
      this.logger.error('Error generating CBT feedback:', error);
      
      // Mock CBT 피드백 반환
      return this.getMockCBTFeedback(vadScore);
    }
  }

  /**
   * CBT 피드백 프롬프트 생성
   */
  private buildCBTFeedbackPrompt(
    vadScore: VADScore,
    context: string,
    emotionHistory: any[]
  ): string {
    const { valence, arousal, dominance } = vadScore;
    
    return `
당신은 전문적인 CBT(인지행동치료) 상담사입니다. 다음 정보를 바탕으로 개인화된 CBT 피드백을 제공해주세요.

**현재 감정 상태 (VAD 분석):**
- Valence (긍정성): ${valence.toFixed(2)} (0-1, 높을수록 긍정적)
- Arousal (활성화): ${arousal.toFixed(2)} (0-1, 높을수록 활발)
- Dominance (지배성): ${dominance.toFixed(2)} (0-1, 높을수록 자신감)

**상황 맥락:**
${context}

**감정 변화 히스토리:**
${emotionHistory.length > 0 ? 
  emotionHistory.slice(-5).map(h => `- ${h.timestamp}: ${h.primaryEmotion} (V:${h.vadScore?.valence?.toFixed(2)}, A:${h.vadScore?.arousal?.toFixed(2)}, D:${h.vadScore?.dominance?.toFixed(2)})`).join('\n') :
  '이전 기록이 없습니다.'
}

다음 JSON 형식으로 응답해주세요:

{
  "emotionAssessment": {
    "currentState": "현재 감정 상태에 대한 전문적 분석",
    "triggers": ["감정을 유발한 요인들"],
    "patterns": ["반복되는 사고/행동 패턴"]
  },
  "cognitiveTechniques": {
    "technique": "적합한 CBT 기법명",
    "description": "기법에 대한 상세 설명",
    "exercises": ["구체적인 연습 방법들"]
  },
  "behavioralStrategies": {
    "strategy": "행동 변화 전략",
    "steps": ["단계별 실행 방법"],
    "expectedOutcome": "기대되는 결과"
  },
  "progressTracking": {
    "metrics": ["추적할 지표들"],
    "goals": ["단기/장기 목표"],
    "timeline": "목표 달성 예상 기간"
  }
}

응답 시 다음을 고려하세요:
1. VAD 점수를 정확히 해석하여 맞춤형 조언 제공
2. 감정 변화 패턴을 분석하여 근본 원인 파악
3. 실현 가능하고 구체적인 행동 전략 제시
4. 단계적이고 체계적인 접근 방법 제안
5. 긍정적이고 지지적인 톤 유지
`;
  }

  /**
   * Gemini 응답을 CBT 피드백으로 파싱
   */
  private parseCBTFeedback(response: any): CBTFeedback {
    try {
      // JSON 응답 파싱 시도
      if (typeof response === 'string') {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      // 구조화된 응답에서 추출
      if (response.content) {
        return this.extractFromStructuredResponse(response.content);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      this.logger.error('Error parsing CBT feedback:', error);
      return this.getMockCBTFeedback({ valence: 0.5, arousal: 0.5, dominance: 0.5 });
    }
  }

  /**
   * 구조화된 응답에서 CBT 피드백 추출
   */
  private extractFromStructuredResponse(content: string): CBTFeedback {
    // 기본 CBT 피드백 구조 반환
    return {
      emotionAssessment: {
        currentState: '현재 감정 상태를 분석 중입니다.',
        triggers: ['감정 유발 요인을 파악 중입니다.'],
        patterns: ['반복 패턴을 분석 중입니다.'],
      },
      cognitiveTechniques: {
        technique: '인지 재구성',
        description: '부정적인 사고 패턴을 더 건설적인 관점으로 바꾸는 기법입니다.',
        exercises: ['사고 기록하기', '증거 검토하기', '대안적 관점 찾기'],
      },
      behavioralStrategies: {
        strategy: '점진적 노출',
        steps: ['작은 목표 설정', '단계적 실행', '성과 기록'],
        expectedOutcome: '점진적인 행동 변화와 자신감 향상',
      },
      progressTracking: {
        metrics: ['일일 감정 점수', '목표 달성률', '스트레스 수준'],
        goals: ['단기: 일상적 스트레스 관리', '장기: 전반적 정신 건강 향상'],
        timeline: '4-8주',
      },
    };
  }

  /**
   * Mock CBT 피드백 생성
   */
  private getMockCBTFeedback(vadScore: VADScore): CBTFeedback {
    const { valence, arousal, dominance } = vadScore;
    
    let currentState = '중립적인 감정 상태입니다.';
    let technique = '마음챙김 명상';
    let strategy = '일상적 스트레스 관리';
    
    if (valence < 0.3) {
      currentState = '부정적인 감정 상태가 지속되고 있습니다.';
      technique = '인지 재구성';
      strategy = '긍정적 사고 전환';
    } else if (valence > 0.7) {
      currentState = '긍정적인 감정 상태를 유지하고 있습니다.';
      technique = '감사 연습';
      strategy = '긍정적 경험 확장';
    }
    
    if (arousal > 0.7) {
      currentState += ' 높은 감정 활성화가 관찰됩니다.';
      technique = '진정 기법';
      strategy = '이완 훈련';
    }

    return {
      emotionAssessment: {
        currentState,
        triggers: ['일상적 스트레스', '대인관계', '업무 압박'],
        patterns: ['완벽주의적 사고', '부정적 예측', '과도한 걱정'],
      },
      cognitiveTechniques: {
        technique,
        description: '현재 감정 상태에 적합한 CBT 기법입니다.',
        exercises: ['호흡 명상', '사고 기록', '감정 라벨링'],
      },
      behavioralStrategies: {
        strategy,
        steps: ['작은 목표 설정', '일일 실천', '성과 기록'],
        expectedOutcome: '감정 조절 능력 향상과 전반적 웰빙 증진',
      },
      progressTracking: {
        metrics: ['일일 감정 점수', '스트레스 수준', '목표 달성률'],
        goals: ['단기: 감정 조절 기법 습득', '장기: 지속적 정신 건강 유지'],
        timeline: '6-12주',
      },
    };
  }

  /**
   * 감정 변화 패턴 분석
   */
  async analyzeEmotionPatterns(emotionHistory: any[]): Promise<{
    patterns: string[];
    trends: string[];
    recommendations: string[];
  }> {
    if (emotionHistory.length < 2) {
      return {
        patterns: ['충분한 데이터가 없습니다.'],
        trends: ['추가 관찰이 필요합니다.'],
        recommendations: ['정기적인 감정 기록을 권장합니다.'],
      };
    }

    const patterns: string[] = [];
    const trends: string[] = [];
    const recommendations: string[] = [];

    // VAD 변화 패턴 분석
    const recentVAD = emotionHistory.slice(-3).map(h => h.vadScore);
    const valenceTrend = this.calculateTrend(recentVAD.map(v => v.valence));
    const arousalTrend = this.calculateTrend(recentVAD.map(v => v.arousal));
    const dominanceTrend = this.calculateTrend(recentVAD.map(v => v.dominance));

    if (valenceTrend > 0.1) {
      trends.push('긍정적 감정이 점진적으로 향상되고 있습니다.');
      recommendations.push('긍정적 변화를 유지하기 위한 활동을 계속하세요.');
    } else if (valenceTrend < -0.1) {
      trends.push('부정적 감정이 증가하는 경향이 있습니다.');
      recommendations.push('인지 재구성 기법을 더 적극적으로 활용하세요.');
    }

    if (arousalTrend > 0.1) {
      trends.push('감정 활성화가 증가하고 있습니다.');
      recommendations.push('진정 기법을 정기적으로 연습하세요.');
    }

    if (dominanceTrend > 0.1) {
      trends.push('자신감이 향상되고 있습니다.');
      recommendations.push('자기효능감 증진 활동을 계속하세요.');
    }

    // 반복 패턴 분석
    const emotions = emotionHistory.map(h => h.primaryEmotion);
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const frequentEmotions = Object.entries(emotionCounts)
      .filter(([_, count]) => count > emotionHistory.length * 0.3)
      .map(([emotion, _]) => emotion);

    if (frequentEmotions.length > 0) {
      patterns.push(`자주 나타나는 감정: ${frequentEmotions.join(', ')}`);
    }

    return { patterns, trends, recommendations };
  }

  /**
   * 트렌드 계산
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const recent = values[values.length - 1];
    const previous = values[values.length - 2];
    
    return recent - previous;
  }

  /**
   * 위험 신호 감지
   */
  async detectRiskSignals(vadScore: VADScore, context: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    signals: string[];
    actions: string[];
  }> {
    const signals: string[] = [];
    const actions: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    const { valence, arousal, dominance } = vadScore;

    // 극단적인 감정 상태 체크
    if (valence < 0.2) {
      signals.push('극도로 낮은 긍정성');
      riskLevel = 'high';
    } else if (valence < 0.4) {
      signals.push('낮은 긍정성');
      riskLevel = 'medium';
    }

    if (arousal > 0.8) {
      signals.push('극도로 높은 감정 활성화');
      riskLevel = 'high';
    } else if (arousal > 0.6) {
      signals.push('높은 감정 활성화');
      riskLevel = 'medium';
    }

    if (dominance < 0.2) {
      signals.push('극도로 낮은 자신감');
      riskLevel = 'high';
    }

    // 위험 수준별 조치
    if (riskLevel === 'high') {
      actions.push('즉시 전문가 상담을 권장합니다');
      actions.push('안전한 환경으로 이동하세요');
      actions.push('신뢰할 수 있는 사람과 연락하세요');
    } else if (riskLevel === 'medium') {
      actions.push('심호흡 기법을 시도해보세요');
      actions.push('긴급 연락처를 준비하세요');
      actions.push('정기적인 상담을 고려해보세요');
    } else {
      actions.push('현재 상태를 모니터링하세요');
      actions.push('예방적 CBT 기법을 연습하세요');
    }

    return { riskLevel, signals, actions };
  }
} 