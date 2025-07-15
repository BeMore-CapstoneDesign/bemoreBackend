# BeMore Backend

AI 기반 감정 분석 및 CBT 피드백 서비스의 백엔드 API 서버입니다.

## 🚀 프로젝트 개요

BeMore는 Google Gemini AI를 활용하여 사용자의 감정을 분석하고, 인지행동치료(CBT) 기법을 제안하는 서비스입니다. 텍스트, 오디오, 이미지 등 다양한 미디어를 통해 감정을 분석하고, AI 상담사와의 대화를 통해 개인화된 피드백을 제공합니다.

## ✨ 주요 기능

- **멀티모달 감정 분석**: 텍스트, 오디오, 이미지 기반 감정 분석
- **AI 상담사**: Gemini AI를 활용한 CBT 기반 상담
- **세션 관리**: 대화 세션 생성 및 관리
- **히스토리 조회**: 과거 분석 결과 및 대화 기록 조회
- **PDF 리포트**: 세션별 상세 리포트 생성

## 🛠 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma
- **AI**: Google Gemini API
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer

## 📋 API 엔드포인트

### 채팅 API
- `POST /api/chat/gemini` - AI 상담사와 대화

### 감정 분석 API
- `POST /api/emotion/analyze` - 감정 분석

### 히스토리 API
- `GET /api/history/{userId}` - 세션 히스토리 조회
- `POST /api/history/session/{sessionId}/pdf` - PDF 리포트 생성

자세한 API 문서는 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)를 참조하세요.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- PostgreSQL
- Google Gemini API 키

### 설치

1. **저장소 클론**
```bash
git clone <repository-url>
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
DATABASE_URL="postgresql://username:password@localhost:5432/bemore"
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-jwt-secret"
PORT=3000
```

4. **데이터베이스 설정**
```bash
npx prisma generate
npx prisma db push
```

5. **개발 서버 실행**
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
├── emotion/        # 감정 분석 모듈
├── history/        # 히스토리 관리 모듈
├── prisma/         # 데이터베이스 설정
├── services/       # 공통 서비스
├── dto/           # 데이터 전송 객체
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

### 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name <migration-name>
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# e2e 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 📝 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | - |
| `GEMINI_API_KEY` | Google Gemini API 키 | - |
| `JWT_SECRET` | JWT 시크릿 키 | - |
| `PORT` | 서버 포트 | 3000 |
| `MAX_FILE_SIZE` | 최대 파일 크기 (bytes) | 10485760 |

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해 주세요.

## 🔮 향후 계획

- [ ] JWT 기반 사용자 인증 시스템
- [ ] 오디오/이미지 파일 업로드 처리
- [ ] 실제 PDF 라이브러리를 사용한 리포트 생성
- [ ] Redis를 통한 캐싱 시스템
- [ ] 구조화된 로깅 시스템
- [ ] 단위 테스트 및 통합 테스트 추가
- [ ] Docker 컨테이너화
- [ ] CI/CD 파이프라인 구축