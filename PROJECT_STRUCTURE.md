# BeMore Backend Project Structure

## 📁 **전체 프로젝트 구조**

```
bemore-backend/
├── 📄 README.md                    # 프로젝트 개요 및 설치 가이드
├── 📄 ARCHITECTURE.md              # Ultrathink Engineering 아키텍처 문서
├── 📄 API_DOCUMENTATION.md         # API 문서
├── 📄 PROJECT_STRUCTURE.md         # 이 파일
├── 📄 package.json                 # 프로젝트 의존성 및 스크립트
├── 📄 env.example                  # 환경 변수 예시
├── 📄 tsconfig.json                # TypeScript 설정
├── 📄 nest-cli.json                # NestJS CLI 설정
├── 📄 eslint.config.mjs            # ESLint 설정
├── 📄 prisma/
│   └── 📄 schema.prisma            # 데이터베이스 스키마
├── 📁 src/
│   ├── 📄 main.ts                  # 애플리케이션 진입점
│   ├── 📄 app.module.ts            # 루트 모듈
│   ├── 📄 app.controller.ts        # 루트 컨트롤러
│   ├── 📄 app.service.ts           # 루트 서비스
│   ├── 📁 common/                  # 공통 모듈
│   │   ├── 📁 dto/                 # Data Transfer Objects
│   │   │   ├── 📄 emotion-analyze.dto.ts
│   │   │   ├── 📄 chat.dto.ts
│   │   │   └── 📄 user.dto.ts
│   │   ├── 📁 guards/              # 인증 가드
│   │   │   └── 📄 jwt-auth.guard.ts
│   │   ├── 📁 strategies/          # JWT 전략
│   │   │   └── 📄 jwt.strategy.ts
│   │   ├── 📁 services/            # 공통 서비스
│   │   │   └── 📄 prisma.service.ts
│   │   ├── 📁 interfaces/          # 인터페이스 정의
│   │   │   ├── 📄 repositories.interface.ts
│   │   │   ├── 📄 services.interface.ts
│   │   │   └── 📄 vad-result.interface.ts
│   │   └── 📁 constants/           # 상수 정의
│   │       └── 📄 provider-tokens.ts
│   ├── 📁 domain/                  # 도메인 레이어
│   │   └── 📁 services/            # 도메인 서비스
│   │       ├── 📄 user-domain.service.ts
│   │       ├── 📄 emotion-analysis-domain.service.ts
│   │       ├── 📄 chat-domain.service.ts
│   │       └── 📄 history-domain.service.ts
│   ├── 📁 infrastructure/          # 인프라 레이어
│   │   └── 📁 repositories/        # Repository 구현체
│   │       ├── 📄 prisma-user.repository.ts
│   │       ├── 📄 prisma-emotion-analysis.repository.ts
│   │       └── 📄 prisma-chat.repository.ts
│   ├── 📁 user/                    # 사용자 모듈
│   │   ├── 📄 user.module.ts
│   │   ├── 📄 user.controller.ts
│   │   └── 📄 user.service.ts      # (레거시 - 도메인 서비스로 대체)
│   ├── 📁 emotion/                 # 감정 분석 모듈
│   │   ├── 📄 emotion.module.ts
│   │   ├── 📄 emotion.controller.ts
│   │   └── 📄 emotion.service.ts   # (레거시 - 도메인 서비스로 대체)
│   ├── 📁 chat/                    # AI 채팅 모듈
│   │   ├── 📄 chat.module.ts
│   │   ├── 📄 chat.controller.ts
│   │   └── 📄 chat.service.ts      # (레거시 - 도메인 서비스로 대체)
│   └── 📁 history/                 # 히스토리 모듈
│       ├── 📄 history.module.ts
│       ├── 📄 history.controller.ts
│       └── 📄 history.service.ts   # (레거시 - 도메인 서비스로 대체)
├── 📁 test/                        # 테스트 파일
│   ├── 📄 app.e2e-spec.ts
│   └── 📄 jest-e2e.json
├── 📁 uploads/                     # 파일 업로드 디렉토리 (자동 생성)
└── 📁 reports/                     # PDF 리포트 디렉토리 (자동 생성)
```

---

## 🏗️ **아키텍처 레이어**

### **1. Presentation Layer (표현 레이어)**
- **위치**: `src/user/`, `src/emotion/`, `src/chat/`, `src/history/`
- **역할**: HTTP 요청/응답 처리, 라우팅, 인증
- **주요 파일**: `*.controller.ts`

### **2. Application Layer (애플리케이션 레이어)**
- **위치**: `src/user/`, `src/emotion/`, `src/chat/`, `src/history/`
- **역할**: 비즈니스 로직 조율, 트랜잭션 관리
- **주요 파일**: `*.service.ts` (레거시)

### **3. Domain Layer (도메인 레이어)**
- **위치**: `src/domain/services/`
- **역할**: 핵심 비즈니스 로직, 도메인 규칙
- **주요 파일**: `*-domain.service.ts`

### **4. Infrastructure Layer (인프라 레이어)**
- **위치**: `src/infrastructure/repositories/`
- **역할**: 데이터 접근, 외부 서비스 연동
- **주요 파일**: `prisma-*.repository.ts`

---

## 🔧 **핵심 컴포넌트 설명**

### **Common Module**
```
src/common/
├── dto/                    # API 요청/응답 데이터 구조
├── guards/                 # JWT 인증 가드
├── strategies/             # Passport JWT 전략
├── services/               # 공통 서비스 (Prisma)
├── interfaces/             # Repository & Service 인터페이스
└── constants/              # 의존성 주입 토큰
```

### **Domain Services**
```
src/domain/services/
├── user-domain.service.ts           # 사용자 생성, 인증
├── emotion-analysis-domain.service.ts # 감정 분석, CBT 피드백
├── chat-domain.service.ts           # Gemini AI 대화
└── history-domain.service.ts        # 세션 관리, PDF 생성
```

### **Infrastructure Repositories**
```
src/infrastructure/repositories/
├── prisma-user.repository.ts           # 사용자 데이터 접근
├── prisma-emotion-analysis.repository.ts # 감정 분석 데이터 접근
└── prisma-chat.repository.ts           # 채팅 데이터 접근
```

---

## 📊 **데이터베이스 스키마**

### **Prisma Schema** (`prisma/schema.prisma`)
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

## 🔄 **의존성 주입 구조**

### **Provider 토큰** (`src/common/constants/provider-tokens.ts`)
```typescript
export const USER_REPOSITORY = 'IUserRepository';
export const EMOTION_ANALYSIS_REPOSITORY = 'IEmotionAnalysisRepository';
export const CHAT_REPOSITORY = 'IChatRepository';
export const USER_SERVICE = 'IUserService';
export const EMOTION_ANALYSIS_SERVICE = 'IEmotionAnalysisService';
export const CHAT_SERVICE = 'IChatService';
export const HISTORY_SERVICE = 'IHistoryService';
```

### **모듈 구성 예시** (`src/user/user.module.ts`)
```typescript
@Module({
  imports: [JwtModule, ConfigModule],
  controllers: [UserController],
  providers: [
    UserDomainService,
    PrismaUserRepository,
    PrismaService,
    JwtStrategy,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UserDomainService],
})
export class UserModule {}
```

---

## 🧪 **테스트 구조**

### **테스트 디렉토리**
```
test/
├── unit/                     # 단위 테스트
│   ├── domain/              # 도메인 로직 테스트
│   ├── infrastructure/      # Repository 테스트
│   └── common/              # 공통 모듈 테스트
├── integration/              # 통합 테스트
│   ├── database/            # 데이터베이스 통합 테스트
│   └── external/            # 외부 API 통합 테스트
└── e2e/                      # 엔드투엔드 테스트
    ├── auth/                # 인증 테스트
    ├── emotion/             # 감정 분석 테스트
    └── chat/                # AI 채팅 테스트
```

---

## 🚀 **배포 구조**

### **환경별 설정**
```
├── .env.development         # 개발 환경
├── .env.staging            # 스테이징 환경
├── .env.production         # 운영 환경
└── .env.example            # 환경 변수 예시
```

### **Docker 구성** (향후 추가)
```
├── Dockerfile              # 애플리케이션 이미지
├── docker-compose.yml      # 로컬 개발 환경
├── docker-compose.prod.yml # 운영 환경
└── .dockerignore           # Docker 제외 파일
```

---

## 📈 **모니터링 구조**

### **로깅**
```
logs/
├── app.log                 # 애플리케이션 로그
├── error.log               # 에러 로그
├── access.log              # 접근 로그
└── audit.log               # 감사 로그
```

### **메트릭**
```
metrics/
├── performance.json        # 성능 지표
├── errors.json            # 에러 통계
└── usage.json             # 사용량 통계
```

---

## 🔒 **보안 구조**

### **인증/인가**
- **JWT**: Bearer 토큰 기반 인증
- **Guards**: 엔드포인트별 권한 검증
- **Strategies**: Passport JWT 전략

### **데이터 보호**
- **bcrypt**: 비밀번호 해시화
- **Validation**: DTO 기반 입력 검증
- **Encryption**: 민감 데이터 암호화

---

## 📝 **문서화**

### **주요 문서**
- **README.md**: 프로젝트 개요, 설치 가이드
- **ARCHITECTURE.md**: Ultrathink Engineering 아키텍처
- **API_DOCUMENTATION.md**: API 명세서
- **PROJECT_STRUCTURE.md**: 이 파일

### **코드 문서화**
- **JSDoc**: 함수 및 클래스 주석
- **TypeScript**: 타입 정의 및 인터페이스
- **Swagger**: API 문서 자동 생성 (향후 추가)

---

## 🎯 **개발 가이드라인**

### **코딩 컨벤션**
- **Naming**: camelCase (변수, 함수), PascalCase (클래스)
- **File Naming**: kebab-case (파일명)
- **Directory Naming**: kebab-case (디렉토리명)

### **아키텍처 원칙**
- **Dependency Inversion**: 인터페이스 기반 의존성
- **Single Responsibility**: 단일 책임 원칙
- **Open/Closed**: 확장에는 열려있고 수정에는 닫혀있음

### **테스트 원칙**
- **Test Pyramid**: 70% Unit, 20% Integration, 10% E2E
- **TDD**: 테스트 주도 개발
- **Coverage**: 80% 이상 코드 커버리지 목표 