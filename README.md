# 모바일 청첩장

Instagram UI 스타일의 모바일 전용 웨딩 초대장입니다.

## 라이브 사이트

배포 후 아래 주소에서 확인할 수 있습니다.

**https://mongsil-e.github.io/mobilewedding/**

## 사진 넣기

`images/` 폴더에 아래 파일명으로 사진을 넣은 뒤 push 하세요.

| 파일명 | 용도 |
|--------|------|
| `hero.jpg` | 프로필 / 스토리 / 메인 |
| `photo-1.jpg` ~ `photo-4.jpg` | 갤러리 |
| `map.jpg` | 약도 |

## 로컬 실행

```bash
python -m http.server 8080
```

## 배포 (GitHub Pages — 무료)

`main` 브랜치에 push하면 GitHub Actions가 자동 배포합니다.

```bash
git push origin main
```

## 내용 수정

- `index.html` — 이름, 날짜, 예식장, 계좌번호
- `app.js` — `WEDDING_DATE` 날짜 변경
