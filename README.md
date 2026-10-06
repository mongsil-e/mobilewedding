# 영건 ♥ 지혜 · Just Married

2026년 10월 4일 결혼식 후, 함께해 주신 분들께 감사 인사를 전하는 Instagram 스타일 모바일 페이지입니다.

라이브 사이트: https://ohmywedding.love/

## 주요 기능

- 감사 인사와 결혼 후 함께한 날 표시 (한국 시간 기준 D+)
- 하트·반지 일러스트로 만든 원형 스토리 커버
- 사진 없는 글 스토리 두 장: 감사 인사 / 우리의 시작
- 스토리 자동 재생, 일시정지, 좌우 탭·스와이프, 아래로 스와이프 닫기
- 키보드로 스토리 열기·이동·닫기, 모션 줄이기 설정 시 자동 재생 정지
- 부부가 된 날을 기억하는 달력
- 지난 예식 안내 (장소·교통·전세버스·마음 전하기)는 기본적으로 접힌 상태
- Web Share API 공유, 미지원 시 링크 복사
- 사진 대신 감사 문구를 담은 공유 미리보기 이미지

기존 프로필·스토리·갤러리·배경 사진과 약도 이미지는 현재 저장소에서 제거했습니다.

## 프로젝트 구조

```text
index.html         # 감사 문구, 페이지 구조, 공유 메타데이터
styles.css         # Instagram 스타일과 글 카드 디자인
app.js             # 한국 시간 D+, 글 스토리, 공유, 지난 안내 기능
images/
  just-married-card.png  # 사진 없는 공유 미리보기 (1200 × 630)
  icons/                 # 지난 안내의 지도 앱 아이콘
```

## 로컬 실행

```bash
python -m http.server 8080
```

브라우저에서 http://localhost:8080 접속.

## 배포

`main` 브랜치에 push하면 GitHub Actions가 GitHub Pages에 배포합니다.

배포 상태: https://github.com/mongsil-e/mobilewedding/actions

CSS·JS 변경 시 `index.html`의 `?v=` 번호를 올려 모바일 캐시를 갱신합니다.
