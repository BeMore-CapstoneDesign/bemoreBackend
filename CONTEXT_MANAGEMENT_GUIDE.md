# BeMore 대화 컨텍스트 관리 시스템 가이드

## 개요

이 가이드는 BeMore 프로젝트의 대화 컨텍스트 관리 시스템 사용법을 설명합니다. Gemini 2.5-flash 모델을 사용하여 연속성 있는 AI 상담을 제공합니다.

## 주요 기능

### 1. 컨텍스트 관리 서비스 (ContextService)
- 세션별 대화 히스토리 관리
- 메시지 수 제한 (최대 20개)
- 토큰 수 추정 및 관리
- 스마트 컨텍스트 축소

### 2. 향상된 Gemini 서비스
- 컨텍스트를 포함한 응답 생성
- 프롬프트 엔지니어링
- 감정 분석 통합

### 3. 토큰 관리 서비스
- 토큰 수 추정 및 제한 관리
- 스마트 메시지 축소
- 컨텍스트 윈도우 최적화

### 4. 프롬프트 엔지니어링 서비스
- CBT 상담 특화 프롬프트
- 컨텍스트 포함 프롬프트 생성
- 감정 분석 및 위험 신호 감지

## API 엔드포인트

### 기본 채팅
```bash
POST /api/chat/gemini
Content-Type: application/json

{
  "message": "안녕하세요, 오늘 기분이 좋지 않아요",
  "emotionContext": {
    "currentEmotion": "슬픔",
    "confidence": 0.8
  }
}
```

### 컨텍스트 조회
```bash
GET /api/chat/context/{sessionId}
```

### 대화 히스토리 조회
```bash
GET /api/chat/history/{sessionId}
```

### 컨텍스트 응답 테스트
```bash
POST /api/chat/test-context
Content-Type: application/json

{
  "message": "이전에 말씀드린 문제가 계속 생각나요",
  "sessionId": "session-id-here"
}
```

### 토큰 관리 테스트
```bash
POST /api/chat/test-tokens
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "첫 번째 메시지"},
    {"role": "assistant", "content": "첫 번째 응답"},
    {"role": "user", "content": "두 번째 메시지"}
  ]
}
```

## 사용 예시

### 1. 기본 대화 시작
```javascript
// 첫 번째 메시지 (컨텍스트 없음)
const response1 = await fetch('/api/chat/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '안녕하세요, 요즘 스트레스가 많아요',
    emotionContext: { currentEmotion: '불안' }
  })
});

const result1 = await response1.json();
const sessionId = result1.data.sessionId;
```

### 2. 연속 대화 (컨텍스트 포함)
```javascript
// 두 번째 메시지 (이전 대화 컨텍스트 포함)
const response2 = await fetch('/api/chat/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '앞서 말씀드린 스트레스가 더 심해졌어요',
    emotionContext: { currentEmotion: '우울' }
  })
});
```

### 3. 컨텍스트 확인
```javascript
// 현재 세션의 컨텍스트 확인
const contextResponse = await fetch(`/api/chat/context/${sessionId}`);
const context = await contextResponse.json();

console.log('컨텍스트 정보:', {
  messageCount: context.messages.length,
  estimatedTokens: context.totalTokens,
  isOverLimit: context.totalTokens > 800000
});
```

## 프롬프트 엔지니어링

### CBT 상담 프롬프트 구조
```
1. 시스템 프롬프트 (CBT 상담사 역할 정의)
2. 이전 대화 내용 (컨텍스트)
3. 현재 사용자 메시지
4. 감정 컨텍스트 정보
5. 응답 형식 정의
```

### 응답 형식
```json
{
  "content": "상담사 응답 내용",
  "emotionAnalysis": {
    "primaryEmotion": "감지된 주요 감정",
    "confidence": 0.95,
    "suggestions": ["CBT 기법 제안들"],
    "contextualNotes": "이전 대화와의 연결점"
  },
  "therapeuticApproach": {
    "technique": "사용된 CBT 기법",
    "rationale": "이 기법을 선택한 이유",
    "nextSteps": "다음 단계 제안"
  }
}
```

## 토큰 관리 전략

### 1. 토큰 제한
- Gemini 2.5-flash: ~1M 토큰
- 안전 마진: 80% (800,000 토큰)
- 추정 방법: 1 토큰 ≈ 4글자 (한국어)

### 2. 컨텍스트 축소 전략
1. **최근 메시지 우선**: 최근 10개 메시지 유지
2. **첫 메시지 보존**: 대화 시작점 항상 유지
3. **스마트 요약**: 오래된 메시지 요약 생성
4. **내용 축약**: 긴 메시지 내용 축약

### 3. 최적화 기준
- 메시지 수: 최대 20개
- 토큰 수: 80% 초과시 축소 고려
- 최소 유지 길이: 50글자

## 테스트 방법

### 1. 컨텍스트 테스트
```bash
# 1. 첫 번째 메시지 전송
curl -X POST http://localhost:3000/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요"}'

# 2. sessionId 추출 후 두 번째 메시지 전송
curl -X POST http://localhost:3000/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "이전에 말씀드린 내용이 생각나요"}'

# 3. 컨텍스트 확인
curl http://localhost:3000/api/chat/context/{sessionId}
```

### 2. 토큰 관리 테스트
```bash
# 긴 메시지들로 토큰 사용량 테스트
curl -X POST http://localhost:3000/api/chat/test-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "매우 긴 메시지..."},
      {"role": "assistant", "content": "매우 긴 응답..."}
    ]
  }'
```

## 모니터링 및 로깅

### 로그 확인
```bash
# 서버 로그에서 컨텍스트 관련 정보 확인
tail -f logs/app.log | grep -E "(ContextService|TokenManager|conversation)"
```

### 성능 지표
- 컨텍스트 길이 (메시지 수)
- 토큰 사용량
- 응답 시간
- 컨텍스트 축소 빈도

## 문제 해결

### 1. Prisma 타입 에러
```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 데이터베이스 스키마 동기화
npx prisma db push
```

### 2. 컨텍스트 로딩 실패
- 데이터베이스 연결 확인
- 세션 ID 유효성 검증
- 메시지 데이터 무결성 확인

### 3. 토큰 제한 초과
- 컨텍스트 축소 로직 확인
- 메시지 길이 제한 적용
- 요약 생성 기능 활성화

## 향후 개선 사항

1. **실시간 토큰 계산**: 정확한 토큰 수 계산
2. **컨텍스트 캐싱**: Redis를 통한 성능 향상
3. **동적 축소**: 사용자 패턴 기반 스마트 축소
4. **멀티모달 컨텍스트**: 이미지, 음성 포함
5. **개인화된 프롬프트**: 사용자별 맞춤 프롬프트

## 결론

이 컨텍스트 관리 시스템을 통해 Gemini 2.5-flash 모델이 이전 대화를 기억하고 연속성 있는 CBT 상담을 제공할 수 있습니다. 토큰 제한을 고려한 스마트 컨텍스트 관리로 안정적이고 효과적인 AI 상담 서비스를 구현할 수 있습니다. 