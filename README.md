# 모바일 청첩장

Instagram UI 스타일의 모바일 전용 웨딩 초대장입니다.

## 라이브 사이트

**https://mongsil-e.github.io/mobilewedding/**

## 사진 넣기

👉 **자세한 설명은 [`images/README.md`](images/README.md) 참고**

```
images/
├── profile/avatar.jpg       ← 대표 사진 (프로필·아바타·Our Day)
├── stories/
│   ├── 02-moment.jpg        ← 스토리 Moment
│   ├── 03-together.jpg      ← 스토리 Together
│   ├── 04-memory.jpg        ← 스토리 Memory
│   └── 05-forever.jpg       ← 스토리 Forever
├── gallery/
│   ├── 01.jpg ~ 04.jpg      ← 갤러리 4칸
└── location/map.jpg         ← 약도
```

## 로컬 실행

```bash
python -m http.server 8080
```

## 배포

```bash
git push origin main
```

## 내용 수정

- `index.html` — 이름, 날짜, 예식장, 계좌번호
- `app.js` — `WEDDING_AT` 결혼 일시
