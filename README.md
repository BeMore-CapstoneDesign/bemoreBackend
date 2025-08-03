# BeMore Backend

AI 기반 멀티모달 감정 분석 및 CBT 피드백 서비스의 백엔드 API 서버입니다.

## 🚀 프로젝트 개요

BeMore는 **VAD (Valence-Arousal-Dominance) 모델**을 기반으로 텍스트, 음성, 얼굴 표정을 통합 분석하여 사용자의 감정 상태를 정확하게 파악하고, 인지행동치료(CBT) 기법을 제안하는 서비스입니다.

## ✨ 주요 기능

- **멀티모달 감정 분석**: 텍스트, 음성, 얼굴 표정 통합 분석
- **VAD 모델 기반**: 과학적 감정 분석 (Valence-Arousal-Dominance)
- **실시간 감정 분류**: 7가지 주요 감정 (happy, sad, angry, excited, surprised, calm, neutral)
- **위험 신호 감지**: 자동 위험 수준 평가 및 권장사항 제공
- **CBT 피드백**: 개인화된 인지행동치료 기법 제안
- **세션 관리**: 대화 세션 생성 및 감정 변화 추적
- **히스토리 조회**: 과거 분석 결과 및 감정 패턴 분석

## 🛠 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma
- **AI**: Google Gemini 2.5-flash API
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer
- **Authentication**: JWT (준비 중)

## 📋 API 엔드포인트

### 감정 분석 API
- `POST /emotion/analyze/text` - 텍스트 감정 분석
- `POST /emotion/analyze/facial` - 얼굴 표정 분석
- `POST /emotion/analyze/voice` - 음성 톤 분석
- `POST /emotion/analyze/multimodal` - 멀티모달 통합 분석

### CBT 피드백 API
- `POST /emotion/cbt/feedback` - CBT 피드백 생성
- `POST /emotion/risk-assessment` - 위험 신호 감지
- `GET /emotion/patterns/{sessionId}` - 감정 패턴 분석

### 히스토리 API
- `GET /emotion/history/{sessionId}` - 감정 분석 히스토리 조회

### 테스트 API
- `POST /emotion/test/face-detection` - 얼굴 감지 테스트
- `POST /emotion/test/audio-quality` - 음성 품질 평가

자세한 API 문서는 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)를 참조하세요.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- PostgreSQL 12+
- Google Gemini API 키 (선택사항 - Mock 응답 지원)

### 설치

1. **저장소 클론**
```bash
git clone https://github.com/BeMore-CapstoneDesign/bemoreBackend.git
cd bemore-backend
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp env.example .env
```

`.env` 파일을 편집하여 다음 정보를 입력하세요:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/bemore"

# Gemini API (선택사항 - 없으면 Mock 응답 사용)
GEMINI_API_KEY="your-gemini-api-key"

# JWT
JWT_SECRET="your-jwt-secret-key-for-development"

# Server
PORT=3000

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DEST="./uploads"
```

4. **PostgreSQL 데이터베이스 설정**
```bash
# PostgreSQL에 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE bemore;
\q
```

5. **데이터베이스 마이그레이션**
```bash
npx prisma generate
npx prisma db push
```

6. **개발 서버 실행**
```bash
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
npm run start:prod
```

## 📁 프로젝트 구조

```
src/
├── modules/
│   ├── emotion/           # 감정 분석 모듈
│   │   ├── controllers/
│   │   │   └── emotion.controller.ts
│   │   ├── services/
│   │   │   ├── text-analysis.service.ts
│   │   │   ├── facial-analysis.service.ts
│   │   │   ├── voice-analysis.service.ts
│   │   │   └── multimodal-analysis.service.ts
│   │   └── emotion.module.ts
│   └── cbt/              # CBT 피드백 모듈
│       ├── services/
│       │   └── psychological-analysis.service.ts
│       └── cbt.module.ts
├── chat/                 # 채팅 관련 모듈
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   └── chat.module.ts
├── history/              # 히스토리 관리 모듈
│   ├── history.controller.ts
│   ├── history.service.ts
│   └── history.module.ts
├── health/               # 헬스체크 모듈
│   ├── health.controller.ts
│   └── health.module.ts
├── prisma/               # 데이터베이스 설정
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── services/             # 공통 서비스
│   ├── gemini.service.ts
│   ├── context.service.ts
│   ├── prompt-engineering.service.ts
│   └── token-manager.service.ts
├── dto/                  # 데이터 전송 객체
│   ├── chat.dto.ts
│   ├── emotion.dto.ts
│   ├── history.dto.ts
│   └── multimodal.dto.ts
├── types/                # 타입 정의
│   └── vad.types.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
```

## 🧠 감정 분석 시스템

### VAD 모델 (Valence-Arousal-Dominance)
```typescript
interface VADScore {
  valence: number;    // 감정의 긍정성 (0-1)
  arousal: number;    // 감정의 활성화 정도 (0-1)
  dominance: number;  // 감정의 지배성 (0-1)
}
```

### 감정 분류
- **happy** (기쁨): valence > 0.7, arousal ≤ 0.6
- **excited** (흥분): valence > 0.7, arousal > 0.6
- **angry** (분노): valence ≤ 0.3, arousal > 0.6
- **sad** (슬픔): valence ≤ 0.3, arousal ≤ 0.6
- **surprised** (놀람): valence 0.4-0.7, arousal > 0.6
- **calm** (평온): valence 0.4-0.7, arousal ≤ 0.6
- **neutral** (중립): 기타

### 멀티모달 통합 분석
- **얼굴 표정**: 40% 가중치 (높은 신뢰도)
- **음성 톤**: 35% 가중치 (중간 신뢰도)
- **텍스트**: 25% 가중치 (낮은 신뢰도)

## 🔧 개발

### 스크립트

- `npm run start:dev` - 개발 서버 실행 (핫 리로드)
- `npm run build` - 프로덕션 빌드
- `npm run start:prod` - 프로덕션 서버 실행
- `npm run test` - 테스트 실행
- `npm run lint` - 코드 린팅
- `npx prisma studio` - 데이터베이스 GUI
- `npx prisma db push` - 데이터베이스 스키마 동기화

### 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name <migration-name>
```

## 🧪 테스트

### API 테스트

`test-api.http` 파일을 사용하여 API를 테스트할 수 있습니다:

```bash
# 텍스트 감정 분석
curl -X POST http://localhost:3000/emotion/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text": "오늘 정말 기분이 좋아요!"}'

# 얼굴 표정 분석
curl -X POST http://localhost:3000/emotion/analyze/facial \
  -F "image=@test_image.jpg"

# 음성 톤 분석
curl -X POST http://localhost:3000/emotion/analyze/voice \
  -F "audio=@test_audio.wav"

# 멀티모달 통합 분석
curl -X POST http://localhost:3000/emotion/analyze/multimodal \
  -H "Content-Type: application/json" \
  -d '{
    "text": {"content": "오늘 정말 기분이 좋아요!"},
    "context": "일상 대화",
    "sessionId": "session_123"
  }'
```

### 단위 테스트

```bash
# 단위 테스트
npm run test

# e2e 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 📝 환경 변수

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | - | ✅ |
| `GEMINI_API_KEY` | Google Gemini API 키 | - | ❌ (Mock 응답 지원) |
| `JWT_SECRET` | JWT 시크릿 키 | - | ✅ |
| `PORT` | 서버 포트 | 3000 | ❌ |
| `MAX_FILE_SIZE` | 최대 파일 크기 (bytes) | 10485760 | ❌ |
| `UPLOAD_DEST` | 파일 업로드 경로 | ./uploads | ❌ |

## 🔒 보안

- **환경 변수**: 민감한 정보는 `.env` 파일에 저장 (git에 커밋하지 않음)
- **입력 검증**: class-validator를 통한 요청 데이터 검증
- **파일 업로드**: 파일 크기 및 형식 제한
- **CORS**: 프론트엔드 도메인 허용 설정
- **에러 처리**: 상세한 에러 메시지 및 로깅

## 🚀 배포

### Docker 배포 (준비 중)

```bash
# Docker 이미지 빌드
docker build -t bemore-backend .

# 컨테이너 실행
docker run -p 3000:3000 bemore-backend
```

### 환경별 설정

- **개발**: `.env`
- **테스트**: `.env.test`
- **프로덕션**: `.env.production`

## 🆕 최근 업데이트

### v1.2.0 (2025-01-XX)
- ✅ **멀티모달 감정 분석**: 텍스트, 음성, 얼굴 표정 통합 분석 구현
- ✅ **VAD 모델**: 과학적 감정 분석 모델 적용
- ✅ **감정 분류 시스템**: 7가지 주요 감정 자동 분류
- ✅ **위험 신호 감지**: 자동 위험 수준 평가 및 권장사항
- ✅ **CBT 피드백**: 개인화된 인지행동치료 기법 제안
- ✅ **파일 업로드**: 이미지/오디오 파일 처리 및 검증
- ✅ **API 엔드포인트**: 완전한 감정 분석 API 구현

### 개발 상태
- 🟢 **감정 분석 시스템**: 완료 및 테스트 완료
- 🟢 **멀티모달 통합**: 완료 및 테스트 완료
- 🟢 **CBT 피드백**: 완료 및 테스트 완료
- 🟡 **프론트엔드 연동**: 진행 중
- 🟡 **실제 Gemini API**: 테스트 필요
- 🔴 **배포 자동화**: 준비 중

## 📚 관련 문서

- [API 문서](./API_DOCUMENTATION.md) - 상세한 API 명세
- [프론트엔드 통합 가이드](./FRONTEND_INTEGRATION_GUIDE.md) - 프론트엔드 개발자를 위한 가이드
- [아키텍처 문서](./ARCHITECTURE.md) - 시스템 아키텍처 설명
- [프로젝트 구조](./PROJECT_STRUCTURE.md) - 상세한 프로젝트 구조

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.