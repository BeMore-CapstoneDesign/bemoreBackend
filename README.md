# 🧬 BeMore Backend

> **멀티모달 감정 분석 & CBT 피드백 API 서버**

BeMore는 이미지, 오디오, 텍스트를 통합 분석하여 사용자의 감정 상태를 VAD(Valence, Arousal, Dominance) 모델로 분석하고, 인지행동치료(CBT) 기반의 개인화된 피드백을 제공하는 AI 기반 정신건강 서비스입니다.

![BeMore Logo](https://img.shields.io/badge/BeMore-Emotion%20Analysis%20%26%20CBT-blue?style=for-the-badge&logo=heart)

---

## 🚀 **주요 기능**

| 기능 | 설명 | 상태 |
|------|------|------|
| 🧠 **멀티모달 감정 분석** | 이미지, 오디오, 텍스트 통합 분석 | ✅ |
| 💬 **AI 상담** | Gemini AI 기반 대화형 상담 | ✅ |
| 📊 **VAD 시각화** | 감정 상태의 3차원 분석 | ✅ |
| 🎯 **CBT 피드백** | 인지행동치료 기반 개인화 피드백 | ✅ |
| 📈 **세션 히스토리** | 분석 기록 및 트렌드 추적 | ✅ |
| 📄 **PDF 리포트** | 상세 분석 리포트 생성 | 🔄 |
| 🔐 **JWT 인증** | 보안 인증 및 권한 관리 | ✅ |

---

## 🛠️ **기술 스택**

### **Backend Framework**
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

### **Database & ORM**
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### **AI & External Services**
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![OpenAI Whisper](https://img.shields.io/badge/Whisper-412991?style=for-the-badge&logo=openai&logoColor=white)

### **Authentication & Security**
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-00A3CC?style=for-the-badge&logo=bcrypt&logoColor=white)

---

## 🏗️ **아키텍처**

### **DDD + Clean Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   User      │ │  Emotion    │ │    Chat     │           │
│  │ Controller  │ │ Controller  │ │ Controller  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   User      │ │  Emotion    │ │    Chat     │           │
│  │   Domain    │ │   Domain    │ │   Domain    │           │
│  │   Service   │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Prisma    │ │   External  │ │   File      │           │
│  │ Repository  │ │    APIs     │ │   Storage   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### **프로젝트 구조**
```
src/
├── 📁 common/           # 공통 모듈
│   ├── 📁 dto/         # Data Transfer Objects
│   ├── 📁 guards/      # 인증 가드
│   ├── 📁 strategies/  # JWT 전략
│   ├── 📁 services/    # 공통 서비스
│   ├── 📁 interfaces/  # 타입 인터페이스
│   └── 📁 constants/   # Provider 토큰
├── 📁 domain/          # 도메인 레이어
│   └── 📁 services/    # 도메인 서비스
├── 📁 infrastructure/  # 인프라 레이어
│   └── 📁 repositories/ # Repository 구현체
├── 📁 user/            # 사용자 관리
├── 📁 emotion/         # 감정 분석
├── 📁 chat/            # AI 채팅
└── 📁 history/         # 세션 히스토리
```

---

## 📚 **API 엔드포인트**

### **인증**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user/register` | 회원가입 |
| `POST` | `/api/user/login` | 로그인 |
| `GET` | `/api/user/profile` | 프로필 조회 |

### **감정 분석**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/emotion/analyze` | 멀티모달 감정 분석 |

### **AI 채팅**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/gemini` | Gemini AI 대화 |
| `GET` | `/api/chat/history` | 채팅 히스토리 |

### **세션 히스토리**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history/:userId` | 사용자 세션 목록 |
| `GET` | `/api/history/session/:sessionId` | 세션 상세 조회 |
| `POST` | `/api/history/session/:sessionId/pdf` | PDF 리포트 생성 |

---

## 🚀 **빠른 시작**

### **1. 저장소 클론**
```bash
git clone https://github.com/your-username/bemore-backend.git
cd bemore-backend
```

### **2. 의존성 설치**
```bash
npm install
```

### **3. 환경 변수 설정**
```bash
cp env.example .env
```

`.env` 파일을 편집하여 다음 값들을 설정하세요:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bemore_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Analysis Server
ANALYSIS_SERVER_URL="http://localhost:8000"

# Server
PORT=3000
NODE_ENV="development"
```

### **4. 데이터베이스 설정**
```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate
```

### **5. 개발 서버 실행**
```bash
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

---

## 🔧 **사용 가능한 스크립트**

| 스크립트 | 설명 |
|----------|------|
| `npm run start` | 프로덕션 모드로 서버 실행 |
| `npm run start:dev` | 개발 모드로 서버 실행 (핫 리로드) |
| `npm run start:debug` | 디버그 모드로 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run test` | 단위 테스트 실행 |
| `npm run test:e2e` | E2E 테스트 실행 |
| `npm run db:generate` | Prisma 클라이언트 생성 |
| `npm run db:migrate` | 데이터베이스 마이그레이션 |
| `npm run db:studio` | Prisma Studio 실행 |

---

## 📊 **데이터베이스 스키마**

### **User Model**
```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
  messages     Message[]
}
```

### **Session Model**
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @default(now())
  vad       Json     # VAD 분석 결과
  summary   String?  # 세션 요약
  pdfUrl    String?  # PDF 리포트 URL
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### **Message Model**
```prisma
model Message {
  id        String   @id @default(cuid())
  userId    String
  content   String
  role      String   # 'user' | 'assistant'
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🧪 **테스트**

### **테스트 실행**
```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

### **테스트 구조**
```
test/
├── unit/                     # 단위 테스트
├── integration/              # 통합 테스트
└── e2e/                      # 엔드투엔드 테스트
```

---

## 🔒 **보안**

- **JWT 기반 인증**: Bearer 토큰 사용
- **비밀번호 해시화**: bcrypt 사용
- **입력 검증**: class-validator 사용
- **CORS 설정**: 프론트엔드 도메인 허용
- **GDPR 준수**: 개인정보 보호법 준수

---

## 📈 **성능 최적화**

- **데이터베이스 인덱싱**: 자주 조회되는 필드 인덱스
- **캐싱 전략**: Redis 기반 캐싱 (향후 구현)
- **비동기 처리**: 대용량 파일 처리
- **연결 풀링**: 데이터베이스 연결 최적화

---

## 🤝 **기여하기**

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **라이센스**

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

## 📞 **지원**

- **이슈 리포트**: [GitHub Issues](https://github.com/your-username/bemore-backend/issues)
- **문서**: [API Documentation](./API_DOCUMENTATION.md)
- **아키텍처**: [Architecture Guide](./ARCHITECTURE.md)

---

## 🎯 **로드맵**

- [ ] PDF 리포트 생성 기능 완성
- [ ] 실시간 채팅 (WebSocket)
- [ ] Redis 캐싱 구현
- [ ] 마이크로서비스 아키텍처 전환
- [ ] 모니터링 및 로깅 시스템
- [ ] Docker 컨테이너화
- [ ] CI/CD 파이프라인 구축

---

<div align="center">

**BeMore Backend** - 멀티모달 감정 분석 & CBT 피드백 API 서버

[![GitHub stars](https://img.shields.io/github/stars/your-username/bemore-backend?style=social)](https://github.com/your-username/bemore-backend/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-username/bemore-backend?style=social)](https://github.com/your-username/bemore-backend/network)
[![GitHub issues](https://img.shields.io/github/issues/your-username/bemore-backend)](https://github.com/your-username/bemore-backend/issues)
[![GitHub license](https://img.shields.io/github/license/your-username/bemore-backend)](https://github.com/your-username/bemore-backend/blob/main/LICENSE)

</div>