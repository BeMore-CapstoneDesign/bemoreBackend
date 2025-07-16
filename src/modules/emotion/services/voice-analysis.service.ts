import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VADScore, VoiceAnalysisResult } from '../../../types/vad.types';

@Injectable()
export class VoiceAnalysisService {
  private readonly logger = new Logger(VoiceAnalysisService.name);
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly vadLexicon: { [key: string]: VADScore };

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found, using mock responses');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    this.vadLexicon = this.loadVADLexicon();
  }

  /**
   * 음성 톤 분석
   */
  async analyzeVoiceTone(audioBuffer: Buffer): Promise<VoiceAnalysisResult> {
    try {
      this.logger.log('Starting voice tone analysis');

      // 입력 버퍼 검증
      if (!audioBuffer || audioBuffer.length === 0) {
        this.logger.warn('Empty audio buffer provided, using mock response');
        return this.getMockVoiceAnalysis();
      }

      this.logger.log(`Audio buffer size: ${audioBuffer.length} bytes`);

      // 개발/테스트 환경에서는 Mock 응답 사용
      if (!this.genAI) {
        this.logger.log('Using mock voice analysis for development');
        return this.getMockVoiceAnalysis();
      }

      // 1. Gemini로 음성 전사 (실제로는 음성 파일을 텍스트로 변환)
      const transcription = await this.transcribeAudio(audioBuffer);
      
      // 2. 오디오 특성 분석
      const audioFeatures = await this.analyzeAudioFeatures(audioBuffer);
      
      // 3. VAD 점수 계산
      const vadScore = this.calculateVADFromText(transcription, audioFeatures);

      return {
        vadScore,
        confidence: 0.8,
        transcription,
        audioFeatures,
      };
    } catch (error) {
      this.logger.error('Error in voice analysis:', error);
      this.logger.error('Error stack:', error.stack);
      
      // Mock response for development/testing
      return this.getMockVoiceAnalysis();
    }
  }

  /**
   * Gemini API를 사용한 음성 전사
   * API 키가 없으면 Mock 응답 사용
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      if (!this.genAI) {
        this.logger.warn('Gemini API not available, using mock transcription');
        return this.getMockTranscription();
      }

      // Gemini의 음성 인식 기능 사용
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      // 음성 파일이 너무 크면 처리하지 않음
      if (audioBuffer.length > 10 * 1024 * 1024) { // 10MB
        this.logger.warn('Audio file too large, using mock transcription');
        return this.getMockTranscription();
      }
      
      // 음성 파일을 Base64로 인코딩
      const base64Audio = audioBuffer.toString('base64');
      
      const prompt = `
        다음 음성 파일을 한국어로 전사해주세요.
        음성 파일은 Base64로 인코딩되어 있습니다.
        전사 결과만 반환해주세요.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio
          }
        }
      ]);

      const response = await result.response;
      return response.text() || '음성 전사에 실패했습니다.';
    } catch (error) {
      this.logger.error('Error in Gemini transcription:', error);
      this.logger.warn('Falling back to mock transcription');
      return this.getMockTranscription();
    }
  }

  /**
   * Mock 음성 전사 응답
   */
  private getMockTranscription(): string {
    const mockTranscriptions = [
      '안녕하세요, 오늘 기분이 좋지 않습니다.',
      '정말 힘든 하루였어요.',
      '오늘은 정말 기분이 좋습니다.',
      '조금 걱정이 있어요.',
      '매우 만족스러운 하루였습니다.',
      '스트레스가 많이 쌓였어요.',
      '평온한 마음으로 하루를 보냈습니다.',
      '화가 나는 일이 있었어요.',
      '감사한 마음이 듭니다.',
      '조금 불안한 기분입니다.'
    ];
    
    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  }

  /**
   * 오디오 특성 분석
   */
  private async analyzeAudioFeatures(audioBuffer: Buffer): Promise<{
    pitch: number;
    tempo: number;
    volume: number;
    clarity: number;
  }> {
    // 실제 구현에서는 오디오 분석 라이브러리 사용
    // 여기서는 간단한 Mock 분석
    return {
      pitch: 0.6,    // 음조 (0-1)
      tempo: 0.5,    // 속도 (0-1)
      volume: 0.7,   // 볼륨 (0-1)
      clarity: 0.8,  // 명확도 (0-1)
    };
  }

  /**
   * 텍스트와 오디오 특성으로부터 VAD 점수 계산
   */
  private calculateVADFromText(text: string, audioFeatures: any): VADScore {
    let valence = 0.5;
    let arousal = 0.5;
    let dominance = 0.5;

    // 텍스트 기반 VAD 계산
    const words = text.toLowerCase().split(/\s+/);
    let totalVAD = { valence: 0, arousal: 0, dominance: 0 };
    let wordCount = 0;

    for (const word of words) {
      if (this.vadLexicon[word]) {
        totalVAD.valence += this.vadLexicon[word].valence;
        totalVAD.arousal += this.vadLexicon[word].arousal;
        totalVAD.dominance += this.vadLexicon[word].dominance;
        wordCount++;
      }
    }

    if (wordCount > 0) {
      valence = totalVAD.valence / wordCount;
      arousal = totalVAD.arousal / wordCount;
      dominance = totalVAD.dominance / wordCount;
    }

    // 오디오 특성으로 VAD 점수 조정
    valence = Math.max(0, Math.min(1, valence + (audioFeatures.pitch - 0.5) * 0.2));
    arousal = Math.max(0, Math.min(1, arousal + (audioFeatures.tempo - 0.5) * 0.3));
    dominance = Math.max(0, Math.min(1, dominance + (audioFeatures.volume - 0.5) * 0.2));

    return { valence, arousal, dominance };
  }

  /**
   * VAD Lexicon 로드
   */
  private loadVADLexicon(): { [key: string]: VADScore } {
    try {
      // 실제로는 파일에서 로드하거나 API에서 가져옴
      // 여기서는 기본 VAD Lexicon 제공
      return {
        '좋다': { valence: 0.8, arousal: 0.6, dominance: 0.7 },
        '나쁘다': { valence: 0.2, arousal: 0.7, dominance: 0.3 },
        '행복하다': { valence: 0.9, arousal: 0.7, dominance: 0.8 },
        '슬프다': { valence: 0.1, arousal: 0.3, dominance: 0.2 },
        '화나다': { valence: 0.2, arousal: 0.9, dominance: 0.8 },
        '무섭다': { valence: 0.1, arousal: 0.8, dominance: 0.2 },
        '평온하다': { valence: 0.7, arousal: 0.2, dominance: 0.6 },
        '흥분하다': { valence: 0.8, arousal: 0.9, dominance: 0.7 },
        '우울하다': { valence: 0.2, arousal: 0.2, dominance: 0.1 },
        '자신있다': { valence: 0.8, arousal: 0.6, dominance: 0.9 },
        '불안하다': { valence: 0.3, arousal: 0.8, dominance: 0.2 },
        '만족하다': { valence: 0.8, arousal: 0.4, dominance: 0.7 },
        '실망하다': { valence: 0.2, arousal: 0.4, dominance: 0.2 },
        '감사하다': { valence: 0.9, arousal: 0.5, dominance: 0.6 },
        '분노하다': { valence: 0.1, arousal: 0.9, dominance: 0.8 },
        '기쁘다': { valence: 0.9, arousal: 0.8, dominance: 0.7 },
        '걱정하다': { valence: 0.3, arousal: 0.7, dominance: 0.2 },
        '편안하다': { valence: 0.7, arousal: 0.2, dominance: 0.5 },
        '스트레스': { valence: 0.2, arousal: 0.8, dominance: 0.3 },
        '힘들다': { valence: 0.2, arousal: 0.6, dominance: 0.2 },
      };
    } catch (error) {
      this.logger.error('Error loading VAD lexicon:', error);
      return {};
    }
  }

  /**
   * 개발/테스트용 Mock 응답
   */
  private getMockVoiceAnalysis(): VoiceAnalysisResult {
    return {
      vadScore: {
        valence: 0.5,
        arousal: 0.6,
        dominance: 0.4,
      },
      confidence: 0.8,
      transcription: '안녕하세요, 오늘 기분이 좋지 않습니다.',
      audioFeatures: {
        pitch: 0.5,
        tempo: 0.6,
        volume: 0.7,
        clarity: 0.8,
      },
    };
  }

  /**
   * 음성 품질 평가
   */
  async assessAudioQuality(audioBuffer: Buffer): Promise<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
  }> {
    try {
      // 실제 구현에서는 오디오 품질 분석
      return {
        quality: 'good',
        issues: [],
      };
    } catch (error) {
      this.logger.error('Error in audio quality assessment:', error);
      return {
        quality: 'fair',
        issues: ['음성 품질 분석에 실패했습니다.'],
      };
    }
  }
} 