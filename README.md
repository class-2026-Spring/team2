# 🌊 제주 의료 가이드

제주도를 방문하는 외국인 관광객을 위한 모바일 의료 도우미 웹 앱입니다.

## 📱 라이브 데모
[https://jeju-medical.vercel.app](https://jeju-medical.vercel.app)

## 👥 팀원


## 🎯 프로젝트 개요
제주 의료 가이드는 제주도를 방문하는 외국인 관광객이 의료 응급 상황과 의료 서비스를 쉽게 이용할 수 있도록 도와주는 앱입니다. 다국어 지원, 실시간 병원 현황, AI 기반 건강 안내를 제공합니다.

## ✨ 주요 기능
- 🔐 **사용자 인증** — Supabase를 활용한 로그인/회원가입
- 🪪 **의료 QR 프로필** — 건강 정보 저장 및 의사용 한국어 QR 코드 생성
- 🩺 **증상 가이드** — 일반적인 관광객 증상에 대한 단계별 안내
- 🗺️ **진료 찾기 지도** — 제주도 전체 병원, 응급실, 약국 Google 지도
- 🤖 **MediGuide AI** — Groq 기반 다국어 건강 어시스턴트
- 🚨 **응급 SOS** — 원터치 119 응급 전화
- 🌐 **4개 언어 지원** — English, 한국어, 中文, 日本語

## 🛠️ 기술 스택
- **프론트엔드**: React + Vite
- **인증 및 데이터베이스**: Supabase
- **AI 챗봇**: Groq API (LLaMA 3.3)
- **지도**: Google Maps JavaScript API
- **배포**: Vercel

## 🚀 시작하기

### 사전 요구사항
- Node.js 20 이상
- npm

### 설치
```bash
git clone https://github.com/class-2026-Spring/team2.git
cd team2
npm install
```

### 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하세요:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON=your_supabase_anon_key
VITE_GROQ_KEY=your_groq_api_key
VITE_GOOGLE_MAPS_KEY=your_google_maps_key


### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

## 📁 프로젝트 구조
src/
data/          # 상수, 번역, 위치 데이터
lib/           # Supabase 클라이언트
screens/       # 모든 화면 컴포넌트
AuthScreen.jsx
HomeScreen.jsx
SymptomsScreen.jsx
MapScreen.jsx
ChatScreen.jsx
ProfileScreen.jsx
App.jsx        # 라우팅이 포함된 메인 앱

## ⚠️ 면책 조항
이 앱은 대학교 캡스톤 프로젝트이며 **임상 목적으로 사용할 수 없습니다**.
건강 관련 결정은 반드시 자격을 갖춘 의료 전문가와 상담하세요.
응급 상황에서는 **119**로 전화하세요.

## 📄 라이선스
대학교 프로젝트 — 2026년 봄 학기

>>>>>>> 09b51b569e93eb2c94f69c607162b984bc287f71
