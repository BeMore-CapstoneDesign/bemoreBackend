import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EmotionAnalyzeDto } from '../common/dto/emotion-analyze.dto';
import { EmotionAnalysisResult } from '../common/interfaces/vad-result.interface';

@Injectable()
export class EmotionService {
  private readonly analysisServerUrl: string;

  constructor(private configService: ConfigService) {
    this.analysisServerUrl = this.configService.get<string>('ANALYSIS_SERVER_URL');
  }

  async analyzeEmotion(emotionAnalyzeDto: EmotionAnalyzeDto): Promise<EmotionAnalysisResult> {
    const { image, audio, text } = emotionAnalyzeDto;

    // 최소한 하나의 입력이 있어야 함
    if (!image && !audio && !text) {
      throw new BadRequestException('이미지, 오디오, 텍스트 중 최소 하나는 제공해야 합니다.');
    }

    try {
      // Python 분석 서버로 요청
      const response = await axios.post(`${this.analysisServerUrl}/analyze`, {
        image,
        audio,
        text,
      });

      const analysisResult = response.data;

      // CBT 피드백 생성
      const cbtFeedback = this.generateCBTFeedback(analysisResult.vad);

      return {
        vad: analysisResult.vad,
        summary: analysisResult.summary,
        cbtFeedback,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException('감정 분석 중 오류가 발생했습니다.');
    }
  }

  private generateCBTFeedback(vad: any): string {
    const { valence, arousal, dominance } = vad;

    let feedback = '';

    // Valence (긍정성) 기반 피드백
    if (valence < 0.3) {
      feedback += '현재 부정적인 감정을 느끼고 계시는군요. ';
      feedback += '이런 감정이 자연스럽다는 것을 인정하고, ';
      feedback += '차분히 호흡을 가다듬어보세요. ';
    } else if (valence > 0.7) {
      feedback += '긍정적인 감정을 느끼고 계시네요! ';
      feedback += '이런 순간들을 소중히 여기고, ';
      feedback += '감사한 마음을 가져보세요. ';
    } else {
      feedback += '중립적인 감정 상태에 계시네요. ';
      feedback += '현재 상황을 객관적으로 바라보고, ';
      feedback += '차분히 생각해보세요. ';
    }

    // Arousal (활성화) 기반 피드백
    if (arousal > 0.7) {
      feedback += '긴장이나 흥분 상태에 계시는 것 같습니다. ';
      feedback += '깊은 호흡을 통해 몸을 이완시켜보세요. ';
    } else if (arousal < 0.3) {
      feedback += '평온한 상태에 계시네요. ';
      feedback += '이런 차분함을 유지하면서 ';
      feedback += '명확하게 생각해보세요. ';
    }

    // Dominance (지배성) 기반 피드백
    if (dominance < 0.3) {
      feedback += '현재 상황에 대한 통제감이 낮으신 것 같습니다. ';
      feedback += '할 수 있는 작은 것들부터 시작해보세요. ';
    } else if (dominance > 0.7) {
      feedback += '상황을 잘 통제하고 계시네요! ';
      feedback += '이런 자신감을 유지하세요. ';
    }

    return feedback;
  }
} 