# Nyogi - AI 실시간 통역·기록 서비스

다국어 사용자가 대면 또는 온라인 미팅에서 실시간으로 서로의 언어를 이해하고, 미팅 종료 후에는 이중 언어 요약 미팅록을 공유할 수 있는 AI 통역·기록 서비스입니다.

## 주요 기능

- 🎙️ **실시간 음성 인식** - 화자 분리 기술로 발화자 자동 구분
- 🌍 **다국어 실시간 번역** - 두 언어 동시 기록 및 번역
- 📝 **AI 이중 언어 요약** - 핵심 논의, 결정 사항, 액션 아이템 자동 요약
- 🔗 **미팅록 공유** - 공개/비공개/화이트리스트 권한 관리
- 👥 **워크스페이스** - 팀 단위 협업 및 기록 공유
- 📹 **다양한 미팅 지원** - 대면, Zoom, Google Meet

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **인증**: NextAuth.js

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OpenAI API (AI 요약 기능, 선택사항)
OPENAI_API_KEY=""
```

### 3. 데이터베이스 설정

```bash
npx prisma generate
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── api/             # API 라우트
│   ├── dashboard/       # 대시보드 페이지
│   ├── meetings/        # 미팅 관련 페이지
│   ├── workspaces/      # 워크스페이스 페이지
│   ├── login/           # 로그인 페이지
│   ├── signup/          # 회원가입 페이지
│   ├── pricing/         # 요금제 페이지
│   └── settings/        # 설정 페이지
├── components/          # 재사용 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   ├── providers/       # 컨텍스트 프로바이더
│   └── ui/              # UI 컴포넌트
├── lib/                 # 유틸리티 및 설정
│   ├── auth.ts          # NextAuth 설정
│   └── prisma.ts        # Prisma 클라이언트
└── types/               # TypeScript 타입 정의
```

## API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `GET/POST /api/auth/[...nextauth]` - NextAuth 인증

### 미팅
- `GET /api/meetings` - 미팅 목록 조회
- `POST /api/meetings` - 미팅 생성
- `GET /api/meetings/[id]` - 미팅 상세 조회
- `PATCH /api/meetings/[id]` - 미팅 수정
- `DELETE /api/meetings/[id]` - 미팅 삭제
- `POST /api/meetings/[id]/start` - 미팅 시작
- `POST /api/meetings/[id]/end` - 미팅 종료
- `POST /api/meetings/[id]/transcripts` - 트랜스크립트 추가
- `POST /api/meetings/[id]/summary` - AI 요약 생성
- `GET/PATCH/POST/DELETE /api/meetings/[id]/share` - 공유 설정

### 워크스페이스
- `GET /api/workspaces` - 워크스페이스 목록 조회
- `POST /api/workspaces` - 워크스페이스 생성
- `GET /api/workspaces/[id]` - 워크스페이스 상세 조회
- `PATCH /api/workspaces/[id]` - 워크스페이스 수정
- `DELETE /api/workspaces/[id]` - 워크스페이스 삭제
- `POST /api/workspaces/[id]/members` - 멤버 초대
- `DELETE /api/workspaces/[id]/members` - 멤버 삭제

### 사용자
- `GET /api/user` - 현재 사용자 정보
- `POST /api/user/upgrade` - 프리미엄 업그레이드

## 라이선스

MIT License

