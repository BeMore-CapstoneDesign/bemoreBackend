# BeMore Backend API Documentation

## 📋 **API 개요**

BeMore 백엔드는 멀티모달 감정 분석과 CBT 피드백을 제공하는 RESTful API 서버입니다.

**Base URL**: `http://localhost:3000/api`

**인증**: JWT Bearer Token (대부분의 엔드포인트에서 필요)

---

## 🔐 **인증**

### **회원가입**
```http
POST /api/user/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**응답**:
```json
{
  "id": "clx1234567890",
  "email": "user@example.com",
  "name": "홍길동",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### **로그인**
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "홍길동",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **프로필 조회**
```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**:
```json
{
  "id": "clx1234567890",
  "email": "user@example.com",
  "name": "홍길동",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🧠 **감정 분석**

### **멀티모달 감정 분석**
```http
POST /api/emotion/analyze
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "audio": "data:audio/wav;base64,UklGRnoGAABXQVZFZm10...",
  "text": "오늘은 정말 힘든 하루였어요."
}
```

**응답**:
```json
{
  "vad": {
    "valence": 0.3,
    "arousal": 0.7,
    "dominance": 0.2,
    "confidence": 0.85
  },
  "summary": "사용자는 현재 부정적인 감정 상태에 있으며, 높은 긴장감을 보이고 있습니다.",
  "cbtFeedback": "현재 부정적인 감정을 느끼고 계시는군요. 이런 감정이 자연스럽다는 것을 인정하고, 차분히 호흡을 가다듬어보세요. 긴장이나 흥분 상태에 계시는 것 같습니다. 깊은 호흡을 통해 몸을 이완시켜보세요. 현재 상황에 대한 통제감이 낮으신 것 같습니다. 할 수 있는 작은 것들부터 시작해보세요.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**VAD 설명**:
- **Valence (긍정성)**: 0.0 (매우 부정적) ~ 1.0 (매우 긍정적)
- **Arousal (활성화)**: 0.0 (매우 차분함) ~ 1.0 (매우 흥분)
- **Dominance (지배성)**: 0.0 (통제감 없음) ~ 1.0 (완전한 통제)
- **Confidence (신뢰도)**: 0.0 (낮음) ~ 1.0 (높음)

---

## 💬 **AI 채팅**

### **Gemini AI 대화**
```http
POST /api/chat/gemini
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "오늘 감정이 많이 복잡해요. 어떻게 하면 좋을까요?",
  "history": [
    {
      "content": "안녕하세요!",
      "role": "user"
    },
    {
      "content": "안녕하세요! 어떤 도움이 필요하신가요?",
      "role": "assistant"
    }
  ]
}
```

**응답**:
```json
{
  "message": "복잡한 감정을 느끼고 계시는군요. 이런 감정들이 자연스럽다는 것을 먼저 인정해보세요. 그리고 차분히 호흡을 가다듬으면서 현재 상황을 객관적으로 바라보는 시간을 가져보시는 건 어떨까요?",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### **채팅 히스토리 조회**
```http
GET /api/chat/history?limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**:
```json
[
  {
    "id": "clx1234567890",
    "userId": "clx1234567890",
    "content": "오늘 감정이 많이 복잡해요.",
    "role": "user",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  {
    "id": "clx1234567891",
    "userId": "clx1234567890",
    "content": "복잡한 감정을 느끼고 계시는군요...",
    "role": "assistant",
    "createdAt": "2024-01-01T12:00:01.000Z"
  }
]
```

---

## 📊 **세션 히스토리**

### **사용자 히스토리 조회**
```http
GET /api/history/{userId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**:
```json
[
  {
    "id": "clx1234567890",
    "date": "2024-01-01T12:00:00.000Z",
    "vad": {
      "valence": 0.3,
      "arousal": 0.7,
      "dominance": 0.2,
      "confidence": 0.85
    },
    "summary": "사용자는 현재 부정적인 감정 상태에 있으며...",
    "pdfUrl": "/reports/clx1234567890.pdf",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### **세션 상세 조회**
```http
GET /api/history/session/{sessionId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**: (사용자 히스토리와 동일한 구조)

### **PDF 리포트 생성**
```http
POST /api/history/session/{sessionId}/pdf
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**:
```json
{
  "pdfUrl": "/reports/clx1234567890.pdf"
}
```

---

## ⚠️ **에러 응답**

### **일반적인 에러 형식**
```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/emotion/analyze"
}
```

### **주요 에러 코드**
- **400 Bad Request**: 잘못된 요청 데이터
- **401 Unauthorized**: 인증 실패
- **403 Forbidden**: 권한 없음
- **404 Not Found**: 리소스를 찾을 수 없음
- **409 Conflict**: 중복 데이터 (이메일 등)
- **500 Internal Server Error**: 서버 내부 오류

---

## 📝 **데이터 타입**

### **VAD Result**
```typescript
interface VadResult {
  valence: number;    // 0.0 ~ 1.0
  arousal: number;    // 0.0 ~ 1.0
  dominance: number;  // 0.0 ~ 1.0
  confidence: number; // 0.0 ~ 1.0
}
```

### **Emotion Analysis Result**
```typescript
interface EmotionAnalysisResult {
  vad: VadResult;
  summary: string;
  cbtFeedback: string;
  timestamp: Date;
}
```

### **Chat Message**
```typescript
interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
}
```

### **Session**
```typescript
interface Session {
  id: string;
  userId: string;
  date: Date;
  vad: VadResult;
  summary?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔧 **환경 설정**

### **필수 환경 변수**
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bemore_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Analysis Server
ANALYSIS_SERVER_URL="http://localhost:8000"

# File Upload
MAX_FILE_SIZE=10485760 # 10MB
UPLOAD_DEST="./uploads"

# Server
PORT=3000
NODE_ENV="development"
```

---

## 🚀 **사용 예시**

### **전체 워크플로우**
1. **회원가입/로그인** → JWT 토큰 획득
2. **감정 분석** → 이미지/오디오/텍스트 업로드
3. **AI 채팅** → 감정 상태에 대한 상담
4. **히스토리 조회** → 과거 분석 결과 확인
5. **PDF 생성** → 리포트 다운로드

### **cURL 예시**
```bash
# 로그인
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 감정 분석
curl -X POST http://localhost:3000/api/emotion/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"오늘은 정말 힘든 하루였어요."}'
```

---

## 📞 **지원**

API 관련 문의사항이나 버그 리포트는 프로젝트 이슈 트래커를 통해 제출해 주세요. 