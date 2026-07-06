# 모바일 청첩장 — WebGL Edition

Vite + TypeScript + GSAP + Three.js로 만든 시네마틱 모바일 웨딩 초대장입니다.
`fableversion`(바닐라) 브랜치의 디자인을 기반으로, 빌드 도구 스택 위에서 전면 업그레이드한 버전입니다.

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 번들러 | Vite 8 + TypeScript (strict) |
| 애니메이션 | GSAP 3.15 — ScrollTrigger · SplitText · Physics2D |
| 3D / 셰이더 | Three.js — 커스텀 GLSL (포토 셰이더 + GPU 꽃잎 파티클) |
| 스크롤 | Lenis 스무스 스크롤 (ScrollTrigger 연동) |
| 폰트 | @fontsource 셀프호스팅 (woff2 서브셋, 외부 요청 0) |
| 오프라인 | vite-plugin-pwa — 설치형 PWA, 사진·폰트 런타임 캐시 |

## 주요 기능

- **프리로더** — 폰트/히어로 이미지/윈도우 로드를 실측한 % 카운터 → 게이트 전환
- **인트로 게이트** — 모노그램 링 SVG 드로잉, 커튼 오프닝 (iOS 자이로 권한도 이 제스처에서 요청)
- **WebGL 히어로** — 커스텀 GLSL: 실크 웨이브 변형 · 탭 리플 · 시네마틱 그레이드 · 비네트 · 필름 그레인, GPU 꽃잎 파티클, 포인터/자이로 패럴랙스, 스크롤 줌. WebGL 실패 시 `<img>` 폴백
- **SplitText 타이포** — 히어로 글자 단위 마스크 리빌, 본문 줄 단위 마스크 리빌
- **핀 고정 수평 갤러리** — 세로 스크롤을 가로 이동으로 변환(scrub), 슬라이드 내부 패럴랙스, 진행 바
- **스크롤 속도 반응 마퀴** — Lenis velocity에 따라 가속
- **파티클 하트** — 620개 입자가 스크롤 진행에 따라 흩어짐 → 하트로 수렴, 축복 버튼 클릭 시 버스트
- **Physics2D 컨페티** — 축복 보내기 버튼에서 하트가 물리 궤적으로 낙하 + 햅틱
- **제너레이티브 뮤직박스** — WebAudio로 합성한 오르골 아르페지오(외부 오디오 파일 없음), 토글 시 이퀄라이저 애니메이션
- **오도미터 카운트다운 · 하트 펄스 달력 · 교통/계좌 아코디언 · 원터치 복사 · Web Share**
- **라이트박스** — 스와이프 · 풀다운 닫기 · 더블탭 확대
- **마그네틱 버튼 / 3D 틸트** — 호버 가능 기기 한정
- **PWA** — 홈 화면 설치, 사진·폰트 오프라인 캐시
- `prefers-reduced-motion` 전면 대응 (파티클·스무스 스크롤·핀 비활성화)

## 개발

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 타입체크 + 프로덕션 빌드 → dist/
npm run preview    # 빌드 결과 미리보기
```

## 배포

`main`에 merge되면 GitHub Actions가 `npm run build` 후 `dist/`를 Pages에 배포합니다
(`.github/workflows/pages.yml`에 빌드 스텝 포함).

## 프로젝트 구조

```
├── index.html               # 마크업 · 문구 · 계좌 · 교통편
├── vite.config.ts           # Vite + PWA 설정
├── public/
│   ├── images/              # 사진 (👉 images/README.md)
│   ├── icon.svg             # PWA 아이콘
│   └── CNAME                # ohmywedding.love
└── src/
    ├── main.ts              # 오케스트레이터 (Three.js는 동적 import로 분리)
    ├── styles/main.css      # 디자인 시스템 (oklch · 글래스모피즘)
    └── modules/
        ├── webgl-hero.ts    # Three.js 씬 + GLSL 셰이더
        ├── animations.ts    # GSAP 리빌 · 핀 갤러리 · 마퀴 · 틸트
        ├── heart.ts         # 파티클 하트 캔버스
        ├── veil.ts          # 프리로더 + 게이트
        ├── scroll.ts        # Lenis + ScrollTrigger + 독 내비
        ├── actions.ts       # 복사 · 공유 · 컨페티 · 뮤직박스
        ├── lightbox.ts / countdown.ts / calendar.ts / accordion.ts
        └── dom.ts           # 유틸 + 토스트
```

## 내용 수정

| 항목 | 위치 |
|------|------|
| 이름 · 문구 · 계좌 · 교통편 | `index.html` |
| 예식 일시 | `src/modules/countdown.ts`의 `WEDDING_DAY`, `CEREMONY_AT` |
| 사진 | `public/images/` (경로는 `index.html`) |

## 개발 팁

- **당일 미리보기**: `?demo=wedding-day` 쿼리로 예식 당일 상태 확인
- 캐시 무효화는 Vite가 해시 파일명으로 자동 처리 (버전 쿼리 불필요)
