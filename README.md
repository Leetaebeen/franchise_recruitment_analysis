# 선문PC방 가맹점 모집 웹사이트

데이터 기반 PC방 창업을 위한 종합 가맹점 모집 플랫폼

## 🎯 프로젝트 소개

선문PC방 가맹점 모집 웹사이트는 빅데이터 분석을 통해 예비 창업자에게 최적의 입지 정보와 데이터 기반 인사이트를 제공하는 혁신적인 프랜차이즈 플랫폼입니다.

### 주요 기능

- **📊 실시간 데이터 분석**: CSV 파일 업로드를 통한 즉각적인 상권 분석 및 시각화
- **💰 수익 시뮬레이터**:
  - 실제 분석 데이터(평균 객단가, 이용시간)를 기반으로 한 지능형 초기값 설정
  - 슬라이더를 통한 직관적인 예상 수익 조절 및 시뮬레이션
- **🗺️ 카카오맵 연동**: AI가 추천하는 최적 입지를 지도에서 시각화 (지역명 한글화 적용)
- **📈 7가지 핵심 분석 차트**:
  - 월별 매출 추이 (5-8월)
  - 재방문율 코호트 분석
  - 지역별 경쟁력 레이더 차트
  - 지역별 예상 월 매출 TOP 10 (추천 사유 명시)
  - 연령대별 고객 분석
  - 이용시간 vs 결제금액 상관관계
- **💼 1:1 맞춤 상담**: 전담 컨설턴트와의 직접 상담 신청
- **📋 가맹 절차 안내**: 6단계 타임라인 방식의 명확한 절차 가이드

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Radix UI (Slider)
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Map**: Kakao Maps API

### Backend
- **Framework**: NestJS
- **ORM**: Prisma
- **Auth**: Passport (JWT, Google OAuth)
- **Data Processing**: Papaparse (CSV Parsing)

## 📁 프로젝트 구조

이 프로젝트는 Monorepo 구조로 구성되어 있습니다.

```
franchise-recruitment-analysis/
├── backend/                   # NestJS 백엔드 서버
│   ├── src/
│   │   ├── analysis/          # 데이터 분석 로직
│   │   ├── auth/              # 인증 (JWT, Google)
│   │   ├── prisma/            # DB 연결 설정
│   │   └── users/             # 사용자 관리
│   └── prisma/                # Prisma 스키마
│
├── frontend/                  # Next.js 프론트엔드
│   ├── app/
│   │   ├── dashboard/         # 분석 대시보드 (핵심 기능)
│   │   │   └── revenue-simulator.tsx # 수익 시뮬레이터
│   │   ├── analysis/          # 분석 페이지
│   │   └── ...
│   ├── components/
│   │   ├── ui/                # 공용 UI (Slider, Button 등)
│   │   └── analysis-dashboard.tsx # 대시보드 메인
│   └── lib/                   # 유틸리티 (지역명 변환 등)
│
└── package.json               # 루트 설정 (Workspaces)
```

## 🚀 시작하기

### 1. 설치

루트 디렉토리에서 모든 의존성을 설치합니다.

```bash
npm install
```

### 2. 환경 변수 설정

`frontend/.env.local` 파일을 생성하고 Kakao Maps API 키를 추가하세요:

```env
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_api_key
```

`backend/.env` 파일을 생성하고 DB 및 인증 설정을 추가하세요.

### 3. 개발 서버 실행

프론트엔드와 백엔드를 동시에 실행합니다.

```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## 📊 데이터 분석 방법론

### 예상 월 매출 계산 (Updated)
$$ \text{예상 월 매출} = \text{평균 객단가} \times \text{표준 매장 월 방문자 수(1,500명)} $$

- **객단가 산출**: 업로드된 데이터의 실제 결제액 기반 평균 산출
- **표준화 모델**: 일반적인 PC방(약 100석 규모)의 월간 활성 사용자(MAU)를 1,500명으로 가정하여 현실적인 매출 추정
- **오차 보정**: 기존의 단순 표본 합산 방식에서 발생하는 과다 예측 오류 수정

### 지역별 경쟁력 지표
- **매출 점수**: 지역별 예상 월 매출 (백만원 단위)
- **이용시간**: 평균 이용시간 (10분 단위)
- **재방문율**: 90일 기준 재방문율 (%)

## 🎨 디자인 특징

- **Clean White Theme**: 데이터 가독성을 최우선으로 한 화이트 카드 디자인 (대시보드)
- **Interactive UI**: 사용자 경험을 고려한 커스텀 슬라이더 및 반응형 차트
- **Localization**: 영문 지역명을 한글로 자동 변환하여 사용자 친화적 정보 제공
