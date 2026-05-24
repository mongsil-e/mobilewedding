# 사진 넣는 방법

아래 폴더에 **jpg** 또는 **png** 파일을 넣고 git push 하면 사이트에 반영됩니다.  
파일명을 바꿨다면 `index.html`·`app.js`의 경로도 함께 수정하세요.

---

## `profile/`

| 파일 | 용도 |
|------|------|
| `mochung-full.jpg` | 프로필 큰 원형 사진, 탭 시 전체화면 확대 |
| `mochung.jpg` | 게시물·하단 탭 등 작은 아바타 |

> 권장: 1:1 정사각형. 큰 사진은 1448px 이하로 압축해 두면 로딩이 빠릅니다.

---

## `stories/`

스토리 뷰어에 쓰이는 원본 사진입니다.

| 파일 | 스토리 이름 |
|------|-------------|
| `ourday.jpg` | Our Day |
| `moment.jpg` | Moment |
| `together.jpg` | Together |
| `memory.jpg` | Memory |
| `foever.jpg` | Forever |

### `stories/thumbs/`

상단 스토리 동그라미 썸네일. 원본과 같은 이름으로 `thumbs/`에 넣습니다.

| 파일 | 스토리 |
|------|--------|
| `ourday.jpg` | Our Day |
| `moment.jpg` | Moment |
| `together.jpg` | Together |
| `memory.jpg` | Memory |
| `foever.jpg` | Forever |

> 썸네일은 작은 정사각형(약 200px)이면 충분합니다.

---

## `gallery/`

갤러리 그리드 6칸. `index.html`의 `profile-grid`에 연결된 파일명과 일치해야 합니다.

현재 사용 중:

- `DSCF0614 복사.jpg`
- `DSCF0668 복사.jpg`
- `DSCF2591 복사.jpg`
- `DSCF3804.jpg`
- `DSCF3860 복사.jpg`
- `7725.jpg`

> 권장: 1:1 정사각형, 장변 1200px 이하

---

## `location/`

| 파일 | 용도 |
|------|------|
| `map_20230602_131012.jpg` | 오시는 길 약도 (탭 시 전체화면 확대) |

> 권장: 가로형 (16:9 또는 4:3)

---

## `background/`

| 파일 | 용도 |
|------|------|
| `invitation.jpg` | 초대 게시물 배경 (CSS에서 사용) |

---

## `icons/`

| 파일 | 용도 |
|------|------|
| `navermap.png` | 네이버 지도 버튼 아이콘 |
| `kakaomap.png` | 카카오맵 버튼 아이콘 |

Google Play 앱 아이콘을 다시 받으려면:

```bash
python scripts/fetch_map_icons.py
```

---

## 폴더 구조 요약

```
images/
├── profile/
│   ├── mochung-full.jpg
│   └── mochung.jpg
├── stories/
│   ├── ourday.jpg
│   ├── moment.jpg
│   ├── together.jpg
│   ├── memory.jpg
│   ├── foever.jpg
│   └── thumbs/
│       └── (위와 동일한 5개 썸네일)
├── gallery/
│   └── (6장)
├── location/
│   └── map_20230602_131012.jpg
├── background/
│   └── invitation.jpg
└── icons/
    ├── navermap.png
    └── kakaomap.png
```
