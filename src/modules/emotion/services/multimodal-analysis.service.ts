import { Injectable, Logger } from '@nestjs/common';
import { 
  IntegratedEmotionAnalysis, 
  FacialAnalysisResult, 
  VoiceAnalysisResult, 
  TextAnalysisResult,
  VADScore 
} from '../../../types/vad.types';

@Injectable()
export class MultimodalAnalysisService {
  private readonly logger = new Logger(MultimodalAnalysisService.name);

  /**
   * 멀티모달 데이터 통합 분석
   */
  async integrateAnalysis(data: {
    facial?: FacialAnalysisResult;
    voice?: VoiceAnalysisResult;
    text?: TextAnalysisResult;
  }): Promise<IntegratedEmotionAnalysis> {
    try {
      this.logger.log('Starting multimodal emotion analysis integration');

      const { facial, voice, text } = data;
      const availableModalities = this.getAvailableModalities(data);

      // 통합 VAD 점수 계산
      const overallVAD = this.calculateIntegratedVAD(facial, voice, text);
      
      // 주요 감정 식별
      const primaryEmotion = this.identifyPrimaryEmotion(overallVAD);
      const secondaryEmotions = this.identifySecondaryEmotions(overallVAD, data);
      
      // 신뢰도 계산
      const confidence = this.calculateConfidence(data);
      
      // 위험 수준 평가
      const riskLevel = this.assessRiskLevel(overallVAD, data);
      
      // 권장사항 생성
      const recommendations = this.generateRecommendations(overallVAD, riskLevel, availableModalities);

      return {
        overallVAD,
        confidence,
        primaryEmotion,
        secondaryEmotions,
        analysis: { facial, voice, text },
        recommendations,
        riskLevel,
      };
    } catch (error) {
      this.logger.error('Error in multimodal analysis integration:', error);
      throw new Error('Failed to integrate multimodal analysis');
    }
  }

  /**
   * 사용 가능한 모달리티 확인
   */
  private getAvailableModalities(data: any): string[] {
    const modalities: string[] = [];
    if (data.facial) modalities.push('facial');
    if (data.voice) modalities.push('voice');
    if (data.text) modalities.push('text');
    return modalities;
  }

  /**
   * 통합 VAD 점수 계산
   */
  private calculateIntegratedVAD(
    facial?: FacialAnalysisResult,
    voice?: VoiceAnalysisResult,
    text?: TextAnalysisResult
  ): VADScore {
    const weights = this.calculateModalityWeights(facial, voice, text);
    
    let totalValence = 0;
    let totalArousal = 0;
    let totalDominance = 0;
    let totalWeight = 0;

    // 얼굴 표정 분석 가중치 적용
    if (facial) {
      totalValence += facial.vadScore.valence * weights.facial;
      totalArousal += facial.vadScore.arousal * weights.facial;
      totalDominance += facial.vadScore.dominance * weights.facial;
      totalWeight += weights.facial;
    }

    // 음성 분석 가중치 적용
    if (voice) {
      totalValence += voice.vadScore.valence * weights.voice;
      totalArousal += voice.vadScore.arousal * weights.voice;
      totalDominance += voice.vadScore.dominance * weights.voice;
      totalWeight += weights.voice;
    }

    // 텍스트 분석 가중치 적용
    if (text) {
      totalValence += text.vadScore.valence * weights.text;
      totalArousal += text.vadScore.arousal * weights.text;
      totalDominance += text.vadScore.dominance * weights.text;
      totalWeight += weights.text;
    }

    // 가중 평균 계산
    if (totalWeight > 0) {
      return {
        valence: totalValence / totalWeight,
        arousal: totalArousal / totalWeight,
        dominance: totalDominance / totalWeight,
      };
    }

    // 기본값 반환
    return { valence: 0.5, arousal: 0.5, dominance: 0.5 };
  }

  /**
   * 모달리티별 가중치 계산
   */
  private calculateModalityWeights(
    facial?: FacialAnalysisResult,
    voice?: VoiceAnalysisResult,
    text?: TextAnalysisResult
  ): { facial: number; voice: number; text: number } {
    const weights = { facial: 0, voice: 0, text: 0 };
    let totalWeight = 0;

    // 얼굴 표정: 높은 신뢰도 (감정 표현의 직접적 지표)
    if (facial) {
      weights.facial = facial.confidence * 0.4; // 40% 기본 가중치
      totalWeight += weights.facial;
    }

    // 음성: 중간 신뢰도 (감정의 음성적 표현)
    if (voice) {
      weights.voice = voice.confidence * 0.35; // 35% 기본 가중치
      totalWeight += weights.voice;
    }

    // 텍스트: 낮은 신뢰도 (의식적 제어 가능)
    if (text) {
      weights.text = text.confidence * 0.25; // 25% 기본 가중치
      totalWeight += weights.text;
    }

    // 가중치 정규화
    if (totalWeight > 0) {
      weights.facial /= totalWeight;
      weights.voice /= totalWeight;
      weights.text /= totalWeight;
    }

    return weights;
  }

  /**
   * 주요 감정 식별
   */
  private identifyPrimaryEmotion(vadScore: VADScore): string {
    const { valence, arousal, dominance } = vadScore;

    // VAD 공간에서 감정 매핑
    if (valence > 0.7 && arousal > 0.6) return '기쁨';
    if (valence > 0.7 && arousal < 0.4) return '만족';
    if (valence < 0.3 && arousal > 0.6) return '분노';
    if (valence < 0.3 && arousal < 0.4) return '우울';
    if (valence < 0.4 && arousal > 0.7) return '불안';
    if (valence > 0.6 && arousal < 0.3) return '평온';
    if (dominance > 0.7) return '자신감';
    if (dominance < 0.3) return '두려움';

    return '중립';
  }

  /**
   * 보조 감정 식별
   */
  private identifySecondaryEmotions(
    vadScore: VADScore, 
    data: { facial?: FacialAnalysisResult; voice?: VoiceAnalysisResult; text?: TextAnalysisResult; }
  ): string[] {
    const emotions: string[] = [];
    const { valence, arousal, dominance } = vadScore;

    // VAD 점수 기반 보조 감정 추가
    if (valence > 0.6) emotions.push('긍정적');
    if (valence < 0.4) emotions.push('부정적');
    if (arousal > 0.6) emotions.push('활발한');
    if (arousal < 0.4) emotions.push('차분한');
    if (dominance > 0.6) emotions.push('지배적');
    if (dominance < 0.4) emotions.push('복종적');

    // 얼굴 표정에서 감지된 감정들 추가
    if (data.facial?.emotions) {
      const facialEmotions = Object.entries(data.facial.emotions)
        .filter(([_, score]) => score > 0.3)
        .map(([emotion, _]) => emotion);
      emotions.push(...facialEmotions);
    }

    // 중복 제거 및 상위 3개만 반환
    return [...new Set(emotions)].slice(0, 3);
  }

  /**
   * 통합 신뢰도 계산
   */
  private calculateConfidence(data: {
    facial?: FacialAnalysisResult;
    voice?: VoiceAnalysisResult;
    text?: TextAnalysisResult;
  }): number {
    const confidences: number[] = [];
    
    if (data.facial) confidences.push(data.facial.confidence);
    if (data.voice) confidences.push(data.voice.confidence);
    if (data.text) confidences.push(data.text.confidence);

    if (confidences.length === 0) return 0.5;

    // 가중 평균 계산 (모달리티 수에 따라 가중치 증가)
    const weight = Math.min(confidences.length / 3, 1);
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    return avgConfidence * (0.7 + weight * 0.3);
  }

  /**
   * 위험 수준 평가
   */
  private assessRiskLevel(
    vadScore: VADScore,
    data: { facial?: FacialAnalysisResult; voice?: VoiceAnalysisResult; text?: TextAnalysisResult; }
  ): 'low' | 'medium' | 'high' {
    const { valence, arousal, dominance } = vadScore;

    // 극단적인 감정 상태 체크
    if (valence < 0.2 && arousal > 0.8) return 'high'; // 극도로 부정적 + 높은 활성화
    if (valence < 0.1) return 'high'; // 극도로 부정적
    if (arousal > 0.9) return 'high'; // 극도로 높은 활성화

    // 중간 위험 수준 체크
    if (valence < 0.3 || arousal > 0.7) return 'medium';
    if (dominance < 0.2) return 'medium'; // 극도로 낮은 지배성

    return 'low';
  }

  /**
   * 권장사항 생성
   */
  private generateRecommendations(
    vadScore: VADScore,
    riskLevel: 'low' | 'medium' | 'high',
    availableModalities: string[]
  ): string[] {
    const recommendations = [];
    const { valence, arousal, dominance } = vadScore;

    // 위험 수준별 기본 권장사항
    if (riskLevel === 'high') {
      recommendations.push('전문가 상담을 권장합니다');
      recommendations.push('즉시 안전한 환경으로 이동하세요');
    } else if (riskLevel === 'medium') {
      recommendations.push('심호흡 기법을 시도해보세요');
      recommendations.push('신뢰할 수 있는 사람과 대화해보세요');
    }

    // VAD 점수별 맞춤 권장사항
    if (valence < 0.4) {
      recommendations.push('긍정적 사고 전환 기법을 연습해보세요');
    }
    if (arousal > 0.7) {
      recommendations.push('진정 기법 (4-7-8 호흡법)을 시도해보세요');
    }
    if (dominance < 0.3) {
      recommendations.push('자기효능감 증진 활동을 해보세요');
    }

    // 모달리티별 권장사항
    if (availableModalities.includes('facial')) {
      recommendations.push('얼굴 표정을 통해 감정 상태를 모니터링하세요');
    }
    if (availableModalities.includes('voice')) {
      recommendations.push('음성 톤을 통해 감정 변화를 관찰하세요');
    }

    return recommendations.slice(0, 5); // 최대 5개 권장사항
  }

  /**
   * 감정 변화 추적
   */
  async trackEmotionChanges(
    currentAnalysis: IntegratedEmotionAnalysis,
    previousAnalyses: IntegratedEmotionAnalysis[]
  ): Promise<{
    trend: 'improving' | 'worsening' | 'stable';
    changes: string[];
    progress: number;
  }> {
    if (previousAnalyses.length === 0) {
      return {
        trend: 'stable',
        changes: ['첫 번째 분석입니다'],
        progress: 0,
      };
    }

    const recentAnalysis = previousAnalyses[previousAnalyses.length - 1];
    const currentVAD = currentAnalysis.overallVAD;
    const previousVAD = recentAnalysis.overallVAD;

    // VAD 변화 계산
    const valenceChange = currentVAD.valence - previousVAD.valence;
    const arousalChange = currentVAD.arousal - previousVAD.arousal;
    const dominanceChange = currentVAD.dominance - previousVAD.dominance;

    // 변화 추세 판단
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    const changes = [];

    if (valenceChange > 0.1) {
      trend = 'improving';
      changes.push('긍정적 감정이 향상되었습니다');
    } else if (valenceChange < -0.1) {
      trend = 'worsening';
      changes.push('부정적 감정이 증가했습니다');
    }

    if (arousalChange > 0.1) {
      changes.push('감정 활성화가 증가했습니다');
    } else if (arousalChange < -0.1) {
      changes.push('감정 활성화가 감소했습니다');
    }

    if (dominanceChange > 0.1) {
      changes.push('자신감이 향상되었습니다');
    } else if (dominanceChange < -0.1) {
      changes.push('자신감이 감소했습니다');
    }

    // 진행도 계산 (긍정적 변화 기준)
    const progress = Math.max(0, Math.min(100, 
      (valenceChange + dominanceChange) * 50 + 50
    ));

    return { trend, changes, progress };
  }
} 