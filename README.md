# 모바일 청첩장

Instagram UI 스타일의 모바일 전용 웨딩 초대장입니다.

## 라이브 사이트
## 주요 기능

- **스토리 뷰어** — 자동 재생, 좌우 탭·스와이프, 아래로 스와이프 닫기
- **갤러리** — 6장 그리드, 탭 시 전체화면 뷰어 (좌우 스와이프)
- **프로필 사진** — 탭 시 전체화면 확대
- **D-Day** — 프로필 D-Day + 달력 섹션 실시간 카운트다운 (당일은 예식 시각까지)
- **오시는 길** — 약도 확대, 네이버 지도·카카오맵 링크, 교통 안내 패널
- **마음 전하기** — 계좌번호 원터치 복사
- **공유** — Web Share API (미지원 시 URL 복사)

## 프로젝트 구조

```
mobile/
├── index.html          # 페이지 구조·문구·이미지 경로
├── styles.css          # Instagram UI 스타일
├── app.js              # D-Day, 스토리·갤러리·뷰어, 교통 패널
├── deploy.ps1          # GitHub Pages 배포 스크립트
├── images/             # 사진·아이콘 (👉 images/README.md)
│   ├── profile/
│   ├── stories/
│   ├── gallery/
│   ├── location/
│   ├── background/
│   └── icons/
└── scripts/
    └── fetch_map_icons.py   # 지도 앱 아이콘 재다운로드
```

## 사진 넣기

👉 **자세한 설명은 [`images/README.md`](images/README.md) 참고**

사진을 교체한 뒤 `index.html`의 `src` 경로가 실제 파일명과 일치하는지 확인하세요.

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
| `app.js` | `WEDDING_DAY`, `CEREMONY_AT`, `STORY_IMAGES` |

CSS·JS 수정 후 모바일 캐시를 피하려면 `index.html`의 `?v=` 버전 번호를 올리세요.

## 개발 팁

- **D-Day 당일 미리보기**: `?demo=wedding-day` 쿼리로 예식 당일 카운트다운 확인
- **iPhone 캐시**: Safari 탭을 완전히 닫았다가 다시 열기 (강력 새로고침 없음)
