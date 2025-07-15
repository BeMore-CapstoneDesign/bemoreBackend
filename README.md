# BeMore Backend

AI 기반 감정 분석 및 CBT 피드백 서비스의 백엔드 API 서버입니다.

## 🚀 프로젝트 개요

BeMore는 Google Gemini AI를 활용하여 사용자의 감정을 분석하고, 인지행동치료(CBT) 기법을 제안하는 서비스입니다. 텍스트, 오디오, 이미지 등 다양한 미디어를 통해 감정을 분석하고, AI 상담사와의 대화를 통해 개인화된 피드백을 제공합니다.

## ✨ 주요 기능

- **멀티모달 감정 분석**: 텍스트, 오디오, 이미지 기반 감정 분석
- **AI 상담사**: Gemini 2.5-flash AI를 활용한 CBT 기반 상담
- **세션 관리**: 대화 세션 생성 및 관리
- **히스토리 조회**: 과거 분석 결과 및 대화 기록 조회
- **PDF 리포트**: 세션별 상세 리포트 생성
- **PostgreSQL 연동**: 안정적인 데이터 저장 및 관리
- **Mock 응답 지원**: API 키 없이도 개발 환경에서 테스트 가능

## 🛠 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma
- **AI**: Google Gemini 2.5-flash API
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer
- **Authentication**: JWT (준비 중)

## 📋 API 엔드포인트

### 채팅 API
- `POST /api/chat/gemini` - AI 상담사와 대화

### 감정 분석 API
- `POST /api/emotion/analyze` - 감정 분석

### 히스토리 API
- `GET /api/history/{userId}` - 세션 히스토리 조회
- `POST /api/history/session/{sessionId}/pdf` - PDF 리포트 생성

### 테스트 API
- `GET /api/test/db-connection` - PostgreSQL 연결 테스트
- `GET /api/test/users` - 사용자 목록 조회
- `POST /api/test/users` - 사용자 생성

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
├── chat/           # 채팅 관련 모듈
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   └── chat.module.ts
├── emotion/        # 감정 분석 모듈
│   ├── emotion.controller.ts
│   ├── emotion.service.ts
│   └── emotion.module.ts
├── history/        # 히스토리 관리 모듈
│   ├── history.controller.ts
│   ├── history.service.ts
│   └── history.module.ts
├── test/           # 테스트 API 모듈
│   ├── test.controller.ts
│   └── test.module.ts
├── prisma/         # 데이터베이스 설정
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── services/       # 공통 서비스
│   └── gemini.service.ts
├── dto/           # 데이터 전송 객체
│   ├── chat.dto.ts
│   ├── emotion.dto.ts
│   └── history.dto.ts
├── database/      # PostgreSQL 연결
│   └── db.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
```

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
# PostgreSQL 연결 테스트
curl -X GET http://localhost:3000/api/test/db-connection

# 사용자 목록 조회
curl -X GET http://localhost:3000/api/test/users

# AI 채팅 테스트 (Mock 응답)
curl -X POST http://localhost:3000/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요"}'

# 감정 분석 테스트
curl -X POST http://localhost:3000/api/emotion/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "오늘 기분이 좋아요", "mediaType": "text"}'
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

### v1.1.0 (2025-07-15)
- ✅ **런타임 에러 해결**: Foreign key constraint 및 DB 세션 로직 수정
- ✅ **Gemini 2.5-flash 모델**: 최신 AI 모델로 업그레이드
- ✅ **Mock 응답 지원**: API 키 없이도 개발 환경에서 테스트 가능
- ✅ **PostgreSQL 연동**: 안정적인 데이터베이스 연결 및 스키마 관리
- ✅ **API 엔드포인트**: 채팅, 감정분석, 히스토리 API 정상 작동

### 개발 상태
- 🟢 **백엔드 API**: 완료 및 테스트 완료
- 🟡 **프론트엔드 연동**: 진행 중
- 🟡 **실제 Gemini API**: 테스트 필요
- 🔴 **배포 자동화**: 준비 중

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.