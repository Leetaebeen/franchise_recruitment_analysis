# 선문PC방 가맹점 모집 웹사이트

데이터 기반 PC방 창업을 위한 종합 가맹점 모집 플랫폼

## 🎯 프로젝트 소개

선문PC방 가맹점 모집 웹사이트는 빅데이터 분석을 통해 예비 창업자에게 최적의 입지 정보와 데이터 기반 인사이트를 제공하는 혁신적인 프랜차이즈 플랫폼입니다.
최신 웹 기술을 활용하여 몰입감 있는 3D 대시보드 미리보기와 직관적인 데이터 시각화를 제공합니다.

### ✨ 주요 기능

#### 1. 🖥️ 몰입형 랜딩 페이지 (New)
- **3D 대시보드 프리뷰**: 마우스 움직임에 반응하는 인터랙티브 3D 틸트(Tilt) 효과 적용
- **다크 모드 디자인**: 세련되고 전문적인 느낌의 다크 테마 UI
- **반응형 히어로 섹션**: 사용자 시선을 사로잡는 역동적인 소개 화면

#### 2. 📊 지능형 분석 대시보드
- **AI 인사이트 보드**: 복잡한 데이터를 분석하여 핵심 전략을 텍스트로 요약 제공 (`AiInsightBoard`)
- **실시간 차트 시각화**: Recharts를 활용한 7가지 핵심 분석 차트 (매출 추이, 코호트 분석, 레이더 차트 등)
- **수익 시뮬레이터**: 슬라이더를 조절하여 예상 수익을 실시간으로 계산 및 시뮬레이션

#### 3. 🗺️ 고성능 지도 서비스
- **카카오맵 연동**: AI 추천 입지를 지도상에 시각화
- **최적화된 성능**: `localStorage` 캐싱을 통한 지도 로딩 속도 개선 및 API 호출 최소화
- **사이드바 탐색**: 추천 입지 목록을 사이드바에서 쉽게 확인하고 지도와 상호작용

#### 4. 💼 창업 지원 시스템
- **1:1 맞춤 상담**: 전담 컨설턴트 상담 신청 기능
- **가맹 절차 가이드**: 6단계 타임라인으로 제공되는 명확한 창업 프로세스

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Animation**: Framer Motion, CSS 3D Transforms
- **Visualization**: Recharts
- **Map**: Kakao Maps SDK

### Backend
- **Framework**: NestJS
- **Database**: Prisma (MySQL)
- **Auth**: Passport (JWT, Google OAuth)
- **Data Processing**: Papaparse (CSV Parsing)

## 🚀 시작하기 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하기 위한 가이드입니다.

### 1. 사전 요구사항 (Prerequisites)
- **Node.js** (v18 이상 권장)
- **npm** 또는 **pnpm**
- **MySQL** 데이터베이스

### 2. 설치 (Installation)

프로젝트 루트 디렉토리에서 의존성을 설치합니다. (Monorepo 구조이므로 루트에서 한 번만 실행하면 됩니다.)

```bash
npm install
```

### 3. 환경 변수 설정 (Environment Setup)

#### Backend 설정 (`backend/.env`)
`backend` 폴더 안에 `.env` 파일을 생성하고 다음 내용을 입력하세요.

```env
# Database (MySQL)
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"

# Google OAuth (선택 사항: 소셜 로그인 기능 사용 시)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/auth/google/callback"
```

#### Frontend 설정 (`frontend/.env.local`)
`frontend` 폴더 안에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요.

```env
# Kakao Maps API Key (필수)
NEXT_PUBLIC_KAKAO_MAP_KEY="your-kakao-javascript-api-key"
```

### 4. 데이터베이스 설정 (Database Setup)

백엔드 디렉토리로 이동하여 Prisma 스키마를 데이터베이스에 반영합니다.

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. 실행 (Run)

프로젝트 루트로 돌아와 개발 서버를 실행합니다. Frontend와 Backend가 동시에 실행됩니다.

```bash
# 루트 디렉토리에서
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:4000](http://localhost:4000)

---

## 📁 프로젝트 구조

```
franchise-recruitment-analysis/
├── backend/                   # NestJS 백엔드 서버
│   ├── prisma/                # DB 스키마 (schema.prisma)
│   ├── src/
│   │   ├── analysis/          # 데이터 분석 로직
│   │   ├── auth/              # 인증 (Google OAuth, JWT)
│   │   └── users/             # 사용자 관리
├── frontend/                  # Next.js 프론트엔드
│   ├── app/                   # 페이지 (App Router)
│   ├── components/            # UI 컴포넌트 (Dashboard, Map 등)
│   ├── lib/                   # 유틸리티 및 API 설정
│   └── public/                # 정적 파일
```