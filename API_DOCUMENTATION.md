# BeMore Backend API Documentation

## 개요
BeMore는 AI 기반 감정 분석 및 CBT 피드백 서비스의 백엔드 API입니다.

## 기본 정보
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **인증**: JWT 토큰 (향후 구현 예정)

## API 엔드포인트

### 1. AI 채팅 API

#### POST /chat/gemini
Gemini AI와의 대화를 처리합니다.

**요청 본문:**
```json
{
  "message": "사용자 메시지",
  "sessionId": "세션 ID (선택사항)",
  "emotionContext": {
    "currentEmotion": "현재 감정 상태",
    "emotionHistory": ["감정 히스토리"]
  }
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "메시지 ID",
    "content": "AI 응답 내용",
    "role": "assistant",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "sessionId": "세션 ID",
    "emotionAnalysis": {
      "primaryEmotion": "주요 감정",
      "confidence": 0.95,
      "suggestions": ["CBT 기법 제안"]
    }
  }
}
```

### 2. 감정 분석 API

#### POST /emotion/analyze
텍스트, 오디오, 이미지의 감정을 분석합니다.

**요청 본문:**
```json
{
  "mediaType": "text",
  "text": "분석할 텍스트 내용",
  "sessionId": "세션 ID (선택사항)"
}
```

**미디어 타입:**
- `text`: 텍스트 분석
- `audio`: 오디오 분석 (향후 구현)
- `image`: 이미지 분석 (향후 구현)

**응답:**
```json
{
  "success": true,
  "data": {
    "primaryEmotion": "주요 감정",
    "secondaryEmotions": ["보조 감정들"],
    "confidence": 0.95,
    "intensity": 0.8,
    "analysis": "감정 분석 결과 설명",
    "cbtSuggestions": ["CBT 기법 제안들"],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 세션 히스토리 조회 API

#### GET /history/{userId}
사용자의 세션 히스토리를 조회합니다.

**응답:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "세션 ID",
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-01-01T01:00:00.000Z",
        "messageCount": 10,
        "emotionTrends": ["감정 변화 추이"],
        "summary": "세션 요약"
      }
    ]
  }
}
```

### 4. PDF 리포트 생성 API

#### POST /history/session/{sessionId}/pdf
특정 세션의 PDF 리포트를 생성합니다.

**응답:**
- Content-Type: `application/pdf`
- 파일 다운로드

## 에러 응답 형식

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

## HTTP 상태 코드

- `200`: 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

## 환경 변수

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bemore"
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-jwt-secret"
PORT=3000
```

## 개발 및 실행

### 설치
```bash
npm install
```

### 데이터베이스 설정
```bash
npx prisma generate
npx prisma db push
```

### 개발 서버 실행
```bash
npm run start:dev
```

### 프로덕션 빌드
```bash
npm run build
npm run start:prod
```

## 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma
- **AI**: Google Gemini API
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer

## 향후 개선 사항

1. **인증 시스템**: JWT 기반 사용자 인증
2. **파일 업로드**: 오디오/이미지 파일 처리
3. **PDF 생성**: 실제 PDF 라이브러리 사용
4. **캐싱**: Redis를 통한 성능 최적화
5. **로깅**: 구조화된 로깅 시스템
6. **테스트**: 단위 테스트 및 통합 테스트 