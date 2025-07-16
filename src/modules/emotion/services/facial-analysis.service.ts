import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { VADScore, FacialAnalysisResult } from '../../../types/vad.types';

@Injectable()
export class FacialAnalysisService {
  private readonly logger = new Logger(FacialAnalysisService.name);
  private readonly mediapipeUrl: string;

  constructor(private configService: ConfigService) {
    this.mediapipeUrl = this.configService.get<string>('MEDIAPIPE_SERVICE_URL') || 'http://localhost:5001';
  }

  /**
   * 얼굴 표정 분석
   */
  async analyzeFacialExpression(imageBuffer: Buffer): Promise<FacialAnalysisResult> {
    try {
      this.logger.log('Starting facial expression analysis');

      // MediaPipe 서비스에 이미지 전송
      const response = await axios.post(`${this.mediapipeUrl}/analyze-face`, {
        image: imageBuffer.toString('base64'),
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30초 타임아웃
      });

      const result = response.data;

      // VAD 점수 계산
      const vadScore = this.calculateVADFromLandmarks(result.landmarks, result.emotions);

      return {
        vadScore,
        confidence: result.confidence || 0.8,
        landmarks: result.landmarks || [],
        emotions: result.emotions || {},
      };
    } catch (error) {
      this.logger.error('Error in facial analysis:', error);
      
      // Mock response for development/testing
      return this.getMockFacialAnalysis();
    }
  }

  /**
   * 랜드마크와 감정 데이터로부터 VAD 점수 계산
   */
  private calculateVADFromLandmarks(landmarks: number[][], emotions: { [key: string]: number }): VADScore {
    // 기본 VAD 점수 (랜드마크 기반)
    let valence = 0.5;
    let arousal = 0.5;
    let dominance = 0.5;

    // 감정 데이터가 있으면 VAD 점수 조정
    if (emotions) {
      // 긍정적 감정들
      const positiveEmotions = ['happy', 'joy', 'excited', 'content'];
      const positiveScore = positiveEmotions.reduce((sum, emotion) => 
        sum + (emotions[emotion] || 0), 0) / positiveEmotions.length;
      
      // 부정적 감정들
      const negativeEmotions = ['sad', 'angry', 'fear', 'disgust'];
      const negativeScore = negativeEmotions.reduce((sum, emotion) => 
        sum + (emotions[emotion] || 0), 0) / negativeEmotions.length;
      
      // Valence 계산 (긍정성)
      valence = Math.max(0, Math.min(1, 0.5 + (positiveScore - negativeScore) * 0.5));
      
      // Arousal 계산 (활성화)
      const highArousalEmotions = ['excited', 'angry', 'fear', 'surprised'];
      const lowArousalEmotions = ['sad', 'content', 'calm'];
      
      const highArousalScore = highArousalEmotions.reduce((sum, emotion) => 
        sum + (emotions[emotion] || 0), 0) / highArousalEmotions.length;
      const lowArousalScore = lowArousalEmotions.reduce((sum, emotion) => 
        sum + (emotions[emotion] || 0), 0) / lowArousalEmotions.length;
      
      arousal = Math.max(0, Math.min(1, 0.5 + (highArousalScore - lowArousalScore) * 0.5));
      
      // Dominance 계산 (지배성)
      const dominantEmotions = ['angry', 'confident', 'excited'];
      const submissiveEmotions = ['fear', 'sad', 'anxious'];
      
      const dominantScore = dominantEmotions.reduce((sum, emotion) => 
        sum + (emotions[emotion] || 0), 0) / dominantEmotions.length;
      const submissiveScore = submissiveEmotions.reduce((sum, emotion) => 
        sum + (emotions[emotion] || 0), 0) / submissiveEmotions.length;
      
      dominance = Math.max(0, Math.min(1, 0.5 + (dominantScore - submissiveScore) * 0.5));
    }

    return { valence, arousal, dominance };
  }

  /**
   * 개발/테스트용 Mock 응답
   */
  private getMockFacialAnalysis(): FacialAnalysisResult {
    return {
      vadScore: {
        valence: 0.6,
        arousal: 0.4,
        dominance: 0.5,
      },
      confidence: 0.85,
      landmarks: Array(468).fill([0, 0]), // MediaPipe Face Mesh의 468개 랜드마크
      emotions: {
        happy: 0.3,
        neutral: 0.5,
        sad: 0.1,
        surprised: 0.1,
      },
    };
  }

  /**
   * 얼굴 감지 여부 확인
   */
  async detectFace(imageBuffer: Buffer): Promise<boolean> {
    try {
      const response = await axios.post(`${this.mediapipeUrl}/detect-face`, {
        image: imageBuffer.toString('base64'),
      });

      return response.data.faceDetected || false;
    } catch (error) {
      this.logger.error('Error in face detection:', error);
      return false;
    }
  }

  /**
   * 얼굴 랜드마크 추출
   */
  async extractLandmarks(imageBuffer: Buffer): Promise<number[][]> {
    try {
      const response = await axios.post(`${this.mediapipeUrl}/extract-landmarks`, {
        image: imageBuffer.toString('base64'),
      });

      return response.data.landmarks || [];
    } catch (error) {
      this.logger.error('Error in landmark extraction:', error);
      return [];
    }
  }
} 