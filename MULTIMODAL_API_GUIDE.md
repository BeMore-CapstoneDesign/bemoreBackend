# BeMore 멀티모달 감정 분석 API 가이드

## 개요

BeMore 프로젝트의 멀티모달 감정 분석 시스템은 얼굴 표정, 음성 톤, 텍스트를 통합하여 정확한 감정 상태를 분석하고 CBT 기반 피드백을 제공합니다.

## 기술 스택

- **백엔드**: NestJS + TypeScript
- **AI 모델**: 
  - MediaPipe Face Landmarker (얼굴 표정 분석)
  - OpenAI Whisper (음성 전사)
  - Google Gemini 2.5-flash (CBT 피드백)
- **데이터베이스**: PostgreSQL + Prisma
- **감정 모델**: VAD (Valence, Arousal, Dominance)

## 환경 설정

### 환경 변수 (.env)
```env
# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# OpenAI Whisper API
WHISPER_API_KEY=your-openai-key-here

# MediaPipe Service
MEDIAPIPE_SERVICE_URL=http://localhost:5001

# VAD Lexicon
VAD_LEXICON_PATH=./data/vad_lexicon.json

# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/bemore"
```

## API 엔드포인트

### 1. 멀티모달 감정 분석

#### POST /api/emotion/analyze/multimodal
통합 멀티모달 감정 분석을 수행합니다.

**Request Body:**
```json
{
  "facial": {
    "vadScore": {
      "valence": 0.6,
      "arousal": 0.4,
      "dominance": 0.5
    },
    "confidence": 0.85,
    "landmarks": [[x1, y1], [x2, y2], ...],
    "emotions": {
      "happy": 0.3,
      "neutral": 0.5,
      "sad": 0.1
    }
  },
  "voice": {
    "vadScore": {
      "valence": 0.5,
      "arousal": 0.6,
      "dominance": 0.4
    },
    "confidence": 0.8,
    "transcription": "안녕하세요, 오늘 기분이 좋지 않습니다.",
    "audioFeatures": {
      "pitch": 0.5,
      "tempo": 0.6,
      "volume": 0.7,
      "clarity": 0.8
    }
  },
  "text": {
    "vadScore": {
      "valence": 0.4,
      "arousal": 0.5,
      "dominance": 0.3
    },
    "confidence": 0.9,
    "keywords": ["스트레스", "힘들다", "불안"],
    "sentiment": "negative"
  },
  "context": "업무 스트레스로 인한 감정 상태",
  "sessionId": "session-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallVAD": {
      "valence": 0.5,
      "arousal": 0.5,
      "dominance": 0.4
    },
    "confidence": 0.85,
    "primaryEmotion": "우울",
    "secondaryEmotions": ["부정적", "차분한", "복종적"],
    "analysis": {
      "facial": { ... },
      "voice": { ... },
      "text": { ... }
    },
    "recommendations": [
      "심호흡 기법을 시도해보세요",
      "긍정적 사고 전환 기법을 연습해보세요",
      "신뢰할 수 있는 사람과 대화해보세요"
    ],
    "riskLevel": "medium"
  }
}
```

### 2. 얼굴 표정 분석

#### POST /api/emotion/analyze/facial
이미지 파일을 업로드하여 얼굴 표정을 분석합니다.

**Request:**
- Content-Type: multipart/form-data
- File: image (jpg, jpeg, png, gif, max 5MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "vadScore": {
      "valence": 0.6,
      "arousal": 0.4,
      "dominance": 0.5
    },
    "confidence": 0.85,
    "landmarks": [[x1, y1], [x2, y2], ...],
    "emotions": {
      "happy": 0.3,
      "neutral": 0.5,
      "sad": 0.1,
      "surprised": 0.1
    }
  }
}
```

### 3. 음성 톤 분석

#### POST /api/emotion/analyze/voice
오디오 파일을 업로드하여 음성 톤을 분석합니다.

**Request:**
- Content-Type: multipart/form-data
- File: audio (wav, mp3, m4a, ogg, max 10MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "vadScore": {
      "valence": 0.5,
      "arousal": 0.6,
      "dominance": 0.4
    },
    "confidence": 0.8,
    "transcription": "안녕하세요, 오늘 기분이 좋지 않습니다.",
    "audioFeatures": {
      "pitch": 0.5,
      "tempo": 0.6,
      "volume": 0.7,
      "clarity": 0.8
    }
  }
}
```

### 4. CBT 피드백 생성

#### POST /api/emotion/cbt/feedback
VAD 분석 결과를 바탕으로 CBT 피드백을 생성합니다.

**Request Body:**
```json
{
  "vadScore": {
    "valence": 0.3,
    "arousal": 0.7,
    "dominance": 0.2
  },
  "context": "업무 스트레스로 인한 불안감과 우울감",
  "sessionId": "session-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emotionAssessment": {
      "currentState": "부정적인 감정 상태가 지속되고 있습니다.",
      "triggers": ["업무 압박", "대인관계 스트레스"],
      "patterns": ["완벽주의적 사고", "부정적 예측"]
    },
    "cognitiveTechniques": {
      "technique": "인지 재구성",
      "description": "부정적인 사고 패턴을 더 건설적인 관점으로 바꾸는 기법입니다.",
      "exercises": ["사고 기록하기", "증거 검토하기", "대안적 관점 찾기"]
    },
    "behavioralStrategies": {
      "strategy": "점진적 노출",
      "steps": ["작은 목표 설정", "단계적 실행", "성과 기록"],
      "expectedOutcome": "점진적인 행동 변화와 자신감 향상"
    },
    "progressTracking": {
      "metrics": ["일일 감정 점수", "목표 달성률", "스트레스 수준"],
      "goals": ["단기: 감정 조절 기법 습득", "장기: 지속적 정신 건강 유지"],
      "timeline": "6-12주"
    }
  }
}
```

### 5. 감정 변화 패턴 분석

#### GET /api/emotion/patterns/{sessionId}
세션의 감정 변화 패턴을 분석합니다.

**Query Parameters:**
- limit: 분석할 최근 기록 수 (기본값: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "patterns": ["자주 나타나는 감정: 우울, 불안"],
    "trends": ["부정적 감정이 증가하는 경향이 있습니다."],
    "recommendations": ["인지 재구성 기법을 더 적극적으로 활용하세요."]
  }
}
```

### 6. 위험 신호 감지

#### POST /api/emotion/risk-assessment
VAD 점수를 바탕으로 위험 신호를 감지합니다.

**Request Body:**
```json
{
  "vadScore": {
    "valence": 0.1,
    "arousal": 0.9,
    "dominance": 0.1
  },
  "context": "극도로 부정적인 감정 상태",
  "sessionId": "session-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "riskLevel": "high",
    "signals": ["극도로 낮은 긍정성", "극도로 높은 감정 활성화"],
    "actions": [
      "즉시 전문가 상담을 권장합니다",
      "안전한 환경으로 이동하세요",
      "신뢰할 수 있는 사람과 연락하세요"
    ]
  }
}
```

### 7. 감정 히스토리 조회

#### GET /api/emotion/history/{sessionId}
세션의 감정 분석 히스토리를 조회합니다.

**Query Parameters:**
- limit: 조회할 최근 기록 수
- startDate: 시작 날짜 (ISO 8601)
- endDate: 종료 날짜 (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "sessionId": "session-123",
      "timestamp": "2024-01-15T10:30:00Z",
      "primaryEmotion": "중립",
      "vadScore": {
        "valence": 0.5,
        "arousal": 0.5,
        "dominance": 0.5
      },
      "confidence": 0.8
    }
  ]
}
```

## 테스트 엔드포인트

### 8. 얼굴 감지 테스트

#### POST /api/emotion/test/face-detection
얼굴 감지 기능을 테스트합니다.

**Request:**
- Content-Type: multipart/form-data
- File: image

**Response:**
```json
{
  "success": true,
  "data": {
    "faceDetected": true,
    "landmarks": [[x1, y1], [x2, y2], ...]
  }
}
```

### 9. 음성 품질 평가

#### POST /api/emotion/test/audio-quality
음성 품질을 평가합니다.

**Request:**
- Content-Type: multipart/form-data
- File: audio

**Response:**
```json
{
  "success": true,
  "data": {
    "quality": "good",
    "issues": []
  }
}
```

## VAD 모델 설명

### VAD (Valence, Arousal, Dominance) 모델

- **Valence (긍정성)**: 0-1, 낮을수록 부정적, 높을수록 긍정적
- **Arousal (활성화)**: 0-1, 낮을수록 차분, 높을수록 활발
- **Dominance (지배성)**: 0-1, 낮을수록 복종적, 높을수록 자신감

### 감정 매핑
```
기쁨: V>0.7, A>0.6
만족: V>0.7, A<0.4
분노: V<0.3, A>0.6
우울: V<0.3, A<0.4
불안: V<0.4, A>0.7
평온: V>0.6, A<0.3
자신감: D>0.7
두려움: D<0.3
```

## 사용 예시

### cURL 예시

#### 1. 얼굴 표정 분석
```bash
curl -X POST http://localhost:3000/api/emotion/analyze/facial \
  -H "Content-Type: multipart/form-data" \
  -F "image=@face.jpg"
```

#### 2. 음성 톤 분석
```bash
curl -X POST http://localhost:3000/api/emotion/analyze/voice \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@voice.wav"
```

#### 3. 멀티모달 분석
```bash
curl -X POST http://localhost:3000/api/emotion/analyze/multimodal \
  -H "Content-Type: application/json" \
  -d '{
    "facial": {
      "vadScore": {"valence": 0.6, "arousal": 0.4, "dominance": 0.5},
      "confidence": 0.85,
      "landmarks": [],
      "emotions": {"happy": 0.3, "neutral": 0.5}
    },
    "context": "일상적 스트레스 상황"
  }'
```

#### 4. CBT 피드백 생성
```bash
curl -X POST http://localhost:3000/api/emotion/cbt/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "vadScore": {"valence": 0.3, "arousal": 0.7, "dominance": 0.2},
    "context": "업무 스트레스로 인한 불안감"
  }'
```

### JavaScript 예시

#### 1. 얼굴 표정 분석
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/emotion/analyze/facial', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Facial analysis:', result.data);
```

#### 2. 멀티모달 분석
```javascript
const multimodalData = {
  facial: {
    vadScore: { valence: 0.6, arousal: 0.4, dominance: 0.5 },
    confidence: 0.85,
    landmarks: [],
    emotions: { happy: 0.3, neutral: 0.5 }
  },
  voice: {
    vadScore: { valence: 0.5, arousal: 0.6, dominance: 0.4 },
    confidence: 0.8,
    transcription: "안녕하세요",
    audioFeatures: { pitch: 0.5, tempo: 0.6, volume: 0.7, clarity: 0.8 }
  },
  context: "일상적 스트레스 상황"
};

const response = await fetch('/api/emotion/analyze/multimodal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(multimodalData),
});

const result = await response.json();
console.log('Multimodal analysis:', result.data);
```

## 에러 처리

### 공통 에러 응답 형식
```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "에러 코드 (선택사항)"
}
```

### 주요 에러 코드
- `400`: 잘못된 요청 (파일 형식, 크기 등)
- `500`: 서버 내부 오류
- `503`: 외부 서비스 연결 실패 (MediaPipe, Whisper 등)

## 성능 최적화

### 파일 업로드 제한
- 이미지: 최대 5MB (jpg, jpeg, png, gif)
- 오디오: 최대 10MB (wav, mp3, m4a, ogg)

### 응답 시간
- 얼굴 분석: ~2-5초
- 음성 분석: ~3-8초 (Whisper API 호출 시간 포함)
- 멀티모달 분석: ~5-10초
- CBT 피드백: ~2-3초

## 보안 고려사항

1. **파일 업로드 보안**
   - 파일 형식 검증
   - 파일 크기 제한
   - 악성 파일 검사

2. **API 키 보안**
   - 환경 변수로 관리
   - 프로덕션에서 안전한 키 관리

3. **데이터 개인정보 보호**
   - 업로드된 파일 자동 삭제
   - 개인정보 암호화

## 모니터링 및 로깅

### 로그 레벨
- `INFO`: 일반적인 API 호출
- `WARN`: 외부 서비스 연결 실패
- `ERROR`: 심각한 오류

### 성능 지표
- API 응답 시간
- 외부 서비스 호출 성공률
- 파일 업로드 성공률
- 에러 발생률

## 향후 개선 사항

1. **실시간 분석**: WebSocket을 통한 실시간 감정 분석
2. **배치 처리**: 대량 데이터 처리 최적화
3. **캐싱**: Redis를 통한 분석 결과 캐싱
4. **개인화**: 사용자별 맞춤 분석 모델
5. **모바일 최적화**: 모바일 디바이스 최적화 