import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  Param,
  Query,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  MultimodalAnalysisDto,
  IntegratedEmotionAnalysisDto,
  CBTFeedbackDto,
  EmotionHistoryDto,
  RiskAssessmentDto,
} from '../../../dto/multimodal.dto';
import { FacialAnalysisService } from '../services/facial-analysis.service';
import { VoiceAnalysisService } from '../services/voice-analysis.service';
import { MultimodalAnalysisService } from '../services/multimodal-analysis.service';
import { PsychologicalAnalysisService } from '../../cbt/services/psychological-analysis.service';

@Controller('api/emotion')
export class EmotionController {
  private readonly logger = new Logger(EmotionController.name);

  constructor(
    private readonly facialAnalysisService: FacialAnalysisService,
    private readonly voiceAnalysisService: VoiceAnalysisService,
    private readonly multimodalAnalysisService: MultimodalAnalysisService,
    private readonly psychologicalAnalysisService: PsychologicalAnalysisService,
  ) {}

  /**
   * 멀티모달 감정 분석
   */
  @Post('analyze/multimodal')
  async analyzeMultimodal(@Body() data: MultimodalAnalysisDto): Promise<{
    success: boolean;
    data: IntegratedEmotionAnalysisDto;
  }> {
    try {
      this.logger.log('Starting multimodal emotion analysis');

      const integratedAnalysis = await this.multimodalAnalysisService.integrateAnalysis({
        facial: data.facial,
        voice: data.voice,
        text: data.text,
      });

      return {
        success: true,
        data: integratedAnalysis,
      };
    } catch (error) {
      this.logger.error('Error in multimodal analysis:', error);
      throw new HttpException(
        {
          success: false,
          message: '멀티모달 감정 분석 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 얼굴 표정 분석
   */
  @Post('analyze/facial')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('지원하지 않는 이미지 형식입니다.'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async analyzeFacial(@UploadedFile() image: Express.Multer.File): Promise<{
    success: boolean;
    data: any;
  }> {
    try {
      this.logger.log('Starting facial expression analysis');

      if (!image) {
        throw new HttpException(
          {
            success: false,
            message: '이미지 파일이 필요합니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.facialAnalysisService.analyzeFacialExpression(
        image.buffer,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in facial analysis:', error);
      throw new HttpException(
        {
          success: false,
          message: '얼굴 표정 분석 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 음성 톤 분석
   */
  @Post('analyze/voice')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(wav|mp3|m4a|ogg)$/)) {
          cb(null, true);
        } else {
          cb(new Error('지원하지 않는 오디오 형식입니다.'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async analyzeVoice(@UploadedFile() audio: Express.Multer.File): Promise<{
    success: boolean;
    data: any;
  }> {
    try {
      this.logger.log('Starting voice tone analysis');

      if (!audio) {
        throw new HttpException(
          {
            success: false,
            message: '오디오 파일이 필요합니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.voiceAnalysisService.analyzeVoiceTone(
        audio.buffer,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error in voice analysis:', error);
      throw new HttpException(
        {
          success: false,
          message: '음성 톤 분석 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * CBT 피드백 생성
   */
  @Post('cbt/feedback')
  async generateCBTFeedback(@Body() data: RiskAssessmentDto): Promise<{
    success: boolean;
    data: CBTFeedbackDto;
  }> {
    try {
      this.logger.log('Generating CBT feedback');

      const feedback = await this.psychologicalAnalysisService.generateCBTFeedback(
        data.vadScore,
        data.context,
        [], // emotionHistory는 별도로 가져와야 함
      );

      return {
        success: true,
        data: feedback,
      };
    } catch (error) {
      this.logger.error('Error generating CBT feedback:', error);
      throw new HttpException(
        {
          success: false,
          message: 'CBT 피드백 생성 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 감정 변화 패턴 분석
   */
  @Get('patterns/:sessionId')
  async analyzeEmotionPatterns(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
  ): Promise<{
    success: boolean;
    data: {
      patterns: string[];
      trends: string[];
      recommendations: string[];
    };
  }> {
    try {
      this.logger.log(`Analyzing emotion patterns for session: ${sessionId}`);

      // 실제로는 데이터베이스에서 감정 히스토리를 가져와야 함
      const mockEmotionHistory = [
        {
          timestamp: new Date(),
          primaryEmotion: '중립',
          vadScore: { valence: 0.5, arousal: 0.5, dominance: 0.5 },
        },
      ];

      const patterns = await this.psychologicalAnalysisService.analyzeEmotionPatterns(
        mockEmotionHistory,
      );

      return {
        success: true,
        data: patterns,
      };
    } catch (error) {
      this.logger.error('Error analyzing emotion patterns:', error);
      throw new HttpException(
        {
          success: false,
          message: '감정 패턴 분석 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 위험 신호 감지
   */
  @Post('risk-assessment')
  async assessRisk(@Body() data: RiskAssessmentDto): Promise<{
    success: boolean;
    data: {
      riskLevel: 'low' | 'medium' | 'high';
      signals: string[];
      actions: string[];
    };
  }> {
    try {
      this.logger.log('Assessing risk signals');

      const riskAssessment = await this.psychologicalAnalysisService.detectRiskSignals(
        data.vadScore,
        data.context,
      );

      return {
        success: true,
        data: riskAssessment,
      };
    } catch (error) {
      this.logger.error('Error in risk assessment:', error);
      throw new HttpException(
        {
          success: false,
          message: '위험 신호 감지 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 감정 분석 히스토리 조회
   */
  @Get('history/:sessionId')
  async getEmotionHistory(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    success: boolean;
    data: any[];
  }> {
    try {
      this.logger.log(`Getting emotion history for session: ${sessionId}`);

      // 실제로는 데이터베이스에서 조회해야 함
      const mockHistory = [
        {
          id: '1',
          sessionId,
          timestamp: new Date(),
          primaryEmotion: '중립',
          vadScore: { valence: 0.5, arousal: 0.5, dominance: 0.5 },
          confidence: 0.8,
        },
      ];

      return {
        success: true,
        data: mockHistory,
      };
    } catch (error) {
      this.logger.error('Error getting emotion history:', error);
      throw new HttpException(
        {
          success: false,
          message: '감정 히스토리 조회 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 얼굴 감지 테스트
   */
  @Post('test/face-detection')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/test',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async testFaceDetection(@UploadedFile() image: Express.Multer.File): Promise<{
    success: boolean;
    data: {
      faceDetected: boolean;
      landmarks: number[][];
    };
  }> {
    try {
      this.logger.log('Testing face detection');

      if (!image) {
        throw new HttpException(
          {
            success: false,
            message: '이미지 파일이 필요합니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const faceDetected = await this.facialAnalysisService.detectFace(
        image.buffer,
      );
      const landmarks = await this.facialAnalysisService.extractLandmarks(
        image.buffer,
      );

      return {
        success: true,
        data: {
          faceDetected,
          landmarks,
        },
      };
    } catch (error) {
      this.logger.error('Error in face detection test:', error);
      throw new HttpException(
        {
          success: false,
          message: '얼굴 감지 테스트 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 음성 품질 평가
   */
  @Post('test/audio-quality')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads/test',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async testAudioQuality(@UploadedFile() audio: Express.Multer.File): Promise<{
    success: boolean;
    data: {
      quality: 'excellent' | 'good' | 'fair' | 'poor';
      issues: string[];
    };
  }> {
    try {
      this.logger.log('Testing audio quality');

      if (!audio) {
        throw new HttpException(
          {
            success: false,
            message: '오디오 파일이 필요합니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const qualityAssessment = await this.voiceAnalysisService.assessAudioQuality(
        audio.buffer,
      );

      return {
        success: true,
        data: qualityAssessment,
      };
    } catch (error) {
      this.logger.error('Error in audio quality test:', error);
      throw new HttpException(
        {
          success: false,
          message: '음성 품질 평가 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 