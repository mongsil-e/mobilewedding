# 모바일 청첩장

Apple Human Interface Guidelines 스타일의 모바일 전용 웨딩 초대장입니다.

## 실행 방법

```bash
# Python 내장 서버
python -m http.server 8080

# 또는 Node.js (npx)
npx serve .
```

브라우저에서 `http://localhost:8080` 접속 후, 개발자 도구에서 모바일 뷰(430px)로 확인하세요.

## 사진 넣기

`images/` 폴더에 아래 파일명으로 사진을 넣으세요.

| 파일명 | 용도 | 권장 비율 |
|--------|------|-----------|
| `hero.jpg` | 메인 커버 사진 | 3:4 세로 |
| `photo-1.jpg` | 갤러리 (큰 사진) | 4:3 |
| `photo-2.jpg` | 갤러리 | 1:1 |
| `photo-3.jpg` | 갤러리 | 1:1 |
| `photo-4.jpg` | 갤러리 (와이드) | 16:9 |
| `map.jpg` | 약도/지도 이미지 | 16:10 |

사진이 없으면 placeholder가 표시됩니다.

## 내용 수정

`index.html`에서 아래 항목을 검색해 수정하세요.

- **이름**: `민수`, `지은`, `김민수`, `박지은`
- **날짜/시간**: `2026. 06. 14`, `12:30`
- **부모님**: `김○○ · 이○○의 아들` 등
- **예식장**: `○○ 웨딩홀`, 주소, 교통 안내
- **계좌번호**: `123-456-789012` 등
- **지도 링크**: 네이버/카카오맵 URL

D-Day와 캘린더는 `app.js`의 `WEDDING_DATE` 한 줄만 바꾸면 됩니다.

```js
const WEDDING_DATE = new Date(2026, 5, 14); // 월은 0부터 (5 = 6월)
```

## 구조

```
mobile/
├── index.html      # 페이지 구조
├── styles.css      # Apple 스타일 디자인
├── app.js          # D-Day, 캘린더, 공유, 복사
└── images/         # 사진 폴더
```

## 주요 기능

- iOS 스타일 glass morphism 카드
- 스크롤 reveal 애니메이션
- D-Day 카운터 & 월간 캘endars
- 계좌번호 원터치 복사
- Web Share API 공유 (iOS Safari 지원)
- Safe area 대응 (노치/홈 인디케이터)
