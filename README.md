# 모바일 청첩장

시네마틱 에디토리얼 스타일의 모바일 전용 웨딩 초대장입니다.
빌드 도구 없이 바닐라 HTML/CSS/JS만으로 최신 웹 기술을 사용합니다.

## 주요 기능

- **인트로 게이트** — 커튼이 열리듯 등장하는 오프닝, 모노그램 링 드로잉 애니메이션
- **시네마틱 히어로** — Ken Burns 배경, 글자 단위 스태거 타이틀, 자이로(기울임) + 스크롤 패럴랙스
- **꽃잎 파티클** — 캔버스 기반, 탭 진입 시 시작 (모션 감소 설정 시 자동 비활성)
- **필름 스트립** — scroll-snap 가로 스와이프 폴라로이드 카드
- **모자이크 갤러리** — 스크롤 연동(view-timeline) 등장 애니메이션
- **라이트박스** — 스와이프 넘기기, 아래로 내려 닫기, 더블탭 확대
- **오도미터 카운트다운** — 롤링 숫자 릴, 실시간 초 단위
- **달력** — 예식일 하트 펄스 하이라이트
- **오시는 길** — 약도 확대, 네이버/카카오 지도 링크, 교통 안내 아코디언, 주소 복사
- **마음 전하기** — 신랑측/신부측 아코디언, 계좌번호 원터치 복사
- **축복 보내기** — 하트 버스트 + 햅틱, 로컬 카운터
- **공유** — Web Share API (미지원 시 URL 복사)
- **하단 글래스 독** — 섹션 자동 하이라이트 내비게이션
- **디테일** — 필름 그레인 오버레이, 스크롤 진행 바, 키네틱 마퀴, oklch 팔레트, 글래스모피즘

## 프로젝트 구조

```
mobile/
├── index.html          # 페이지 구조·문구·이미지 경로
├── styles.css          # 디자인 시스템 (oklch, scroll-timeline, @property)
├── app.js              # 파티클·오도미터·라이트박스·아코디언 등 인터랙션
├── deploy.ps1          # GitHub Pages 배포 스크립트
├── images/             # 사진·아이콘 (👉 images/README.md)
│   ├── profile/
│   ├── stories/        # 필름 스트립 사진
│   ├── gallery/        # 모자이크 갤러리 사진
│   ├── location/
│   ├── background/     # 히어로 배경 (invitation.jpg)
│   └── icons/
└── scripts/
    └── fetch_map_icons.py   # 지도 앱 아이콘 재다운로드
```

## 사진 넣기

👉 **자세한 설명은 [`images/README.md`](images/README.md) 참고**

사진을 교체한 뒤 `index.html`의 `src` 경로가 실제 파일명과 일치하는지 확인하세요.
히어로 배경은 `images/background/invitation.jpg`를 사용합니다.

## 로컬 실행

```bash
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 Pages에 배포합니다.

```bash
git push origin main
```

또는 PowerShell:

```powershell
.\deploy.ps1
```

배포 상태: https://github.com/mongsil-e/mobilewedding/actions

## 내용 수정

| 파일 | 수정 항목 |
|------|-----------|
| `index.html` | 이름, 날짜, 예식장, 초대 문구, 계좌번호, 이미지 경로 |
| `app.js` | `WEDDING_DAY`, `CEREMONY_AT` |

CSS·JS 수정 후 모바일 캐시를 피하려면 `index.html`의 `?v=` 버전 번호를 올리세요.

## 개발 팁

- **D-Day 당일 미리보기**: `?demo=wedding-day` 쿼리로 예식 당일 카운트다운 확인
- **모션 감소**: OS의 "동작 줄이기" 설정 시 파티클·애니메이션이 자동으로 꺼집니다
- **iPhone 캐시**: Safari 탭을 완전히 닫았다가 다시 열기 (강력 새로고침 없음)
