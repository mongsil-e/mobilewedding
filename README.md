# Y♥J wedding os — 폰 속의 폰, 청첩장

청첩장이 아니라 **두 사람의 스마트폰을 통째로 건네받는 경험**입니다.
부팅 → 잠금화면(밀어서 해제) → 홈화면 → 앱들. 결혼식 정보는 전부 "앱" 안에 들어 있습니다.

> 다른 버전: `fableversion`(인스타그램 스타일) · `claude/mobile-wedding-redesign-uo2of9`(바닐라 시네마틱) · `claude/mobile-wedding-webgl-uo2of9`(Three.js 스크롤 사이트)

## 경험 흐름

```
⏻ 부팅 (Y♥J 로고)
   ↓
🔒 잠금화면 — 라이브 시계 · 꽃잎 · 알림 2개 · 밀어서 잠금해제
   ↓
🏠 홈화면 — D-day 위젯 · 뮤직 위젯 · 앱 그리드 · 독
   ↓
📱 앱 8개
   💌 초대장   — 초대의 글 (노트 앱)
   💬 메시지   — 두 사람의 대화가 실시간 재생되며 청첩 도착 (타이핑 인디케이터, 초대 카드)
   📷 사진     — 웨딩 필름 + 갤러리 → 라이트박스
   📅 캘린더   — 하트 달력 · 오도미터 카운트다운 · .ics 일정 저장
   🗺️ 지도     — 약도 · 네이버/카카오 · 교통 안내
   💝 마음     — 계좌 카드 · 원터치 복사
   💖 축복     — 물리 컨페티 하트 + 카운터 · 공유
   📞 웨딩홀   — 예약실 바로 전화 (tel:)
   🎵 뮤직     — WebAudio 오르골 플레이어 (회전 디스크, 파형)
```

## 디테일

- **상태바가 살아있음** — 실시간 시계, D-day 배지, 배터리는 결혼식이 다가올수록 충전됩니다 🔋
- 잠금화면 알림을 누르면 잠금해제와 동시에 해당 앱으로 이동
- 앱은 아이콘 위치에서 줌 아웃되며 열림(GSAP), 하단 홈바로 닫기
- 앱마다 상태바 라이트/다크 테마 자동 전환
- 메시지 뱃지(2)는 읽으면 사라짐
- `.ics` 파일 생성 — 하객이 자기 캘린더에 예식 일정+전날 알림을 저장
- 배경음악은 오디오 파일 없이 WebAudio로 실시간 합성
- PWA: 홈 화면 설치 시 진짜 앱처럼 동작, 오프라인 캐시
- `prefers-reduced-motion` 대응, 키보드 잠금해제(Enter/↑) 지원

## 스택

Vite 8 + TypeScript(strict) · GSAP(전환·Physics2D 컨페티) · WebAudio · Canvas · @fontsource 셀프호스팅 · vite-plugin-pwa

## 개발

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 타입체크 + 빌드 → dist/
npm run preview
```

`main`에 merge되면 GitHub Actions가 빌드 후 Pages에 배포합니다.

## 내용 수정

| 항목 | 위치 |
|------|------|
| 문구 · 계좌 · 교통편 · 앱 구성 | `index.html` |
| 메시지 앱 대화 스크립트 | `src/modules/messages.ts`의 `SCRIPT` |
| 예식 일시 | `src/modules/countdown.ts` |
| .ics 일정 | `src/modules/ics.ts` |
| 사진 | `public/images/` |

## 개발 팁

- `?demo=wedding-day` — 예식 당일 상태(D-DAY 배지, 카운트다운) 미리보기
