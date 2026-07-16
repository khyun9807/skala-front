# myTrip 페이지 콘텐츠 — 나의 여행 앨범

> `html/myTrip.v4.html`을 채울 데이터. 여행지·상태는 사용자 제공, 사진/예산/체크리스트/BGM은 위임("알아서")받아 내가 구성. 저장일 2026-07-16.
> 사진은 로컬 `images/trip/`에 저장됨(Wikimedia Commons, **CC BY-SA 4.0 — 표기 필수**, 맨 아래 '사진 출처' 참고).

## 여행지 3곳

| 슬롯 | 여행지 | 나라 | 상태 | 사진 |
|---|---|---|---|---|
| 1 | 오사카 (Osaka) | 일본 🇯🇵 | ✅ 다녀옴 | `images/trip/osaka.jpg` (도톤보리 야경) |
| 2 | 라스베가스 (Las Vegas) | 미국 🇺🇸 | ✅ 다녀옴 | `images/trip/lasvegas.jpg` (The Strip 야경) |
| 3 | 아르헨티나 (Argentina) | 아르헨티나 🇦🇷 | 🪄 버킷리스트 (고기 파티!) | `images/trip/argentina.jpg` (아사도 장작구이) |

> 연도: 오사카·라스베가스는 "다녀옴"만 확인됨(연/월 주시면 캡션 `<time>`에 반영). 아르헨티나는 미래 계획.

### 1. 오사카 (다녀옴)
- 캡션: **오사카 도톤보리** — 다녀온 여행 🇯🇵
- 후기(초안): “글리코 간판 아래 네온이 강물에 번지는 도톤보리의 밤, 타코야키·오코노미야키로 배를 채우며 걷던 거리가 오래 기억에 남는다.”

### 2. 라스베가스 (다녀옴)
- 캡션: **라스베가스 더 스트립** — 다녀온 여행 🇺🇸
- 후기(초안): “밤이 되면 더 화려해지는 사막 위의 도시. 쉴 새 없이 반짝이는 The Strip을 걷는 것만으로도 비현실적인 여행이었다.”

### 3. 아르헨티나 (버킷리스트 — 고기 파티)
- 캡션: **아르헨티나 아사도** — 가고 싶은 곳 🇦🇷
- 후기(초안): “언젠가 아르헨티나에 가서 장작에 구운 **아사도**를 말벡 와인과 함께 원 없이 먹는 고기 파티가 버킷리스트. 소고기의 나라에서 제대로 된 파릴라를 경험해보고 싶다.”

## 💰 여행 예산 (내가 구성 — TesseraJS 예산 차트용, 카테고리별 KRW)
> 대략치. 차트는 카테고리 비중을 보여주므로 총액보다 구성이 중요.

**오사카 (4박 5일, 약 130만원)**
| 카테고리 | 금액(₩) |
|---|---|
| 항공 | 350,000 |
| 숙박 | 400,000 |
| 식비 | 300,000 |
| 교통 | 80,000 |
| 쇼핑/기타 | 170,000 |

**라스베가스 (5박 7일, 약 300만원)**
| 카테고리 | 금액(₩) |
|---|---|
| 항공 | 1,500,000 |
| 숙박 | 600,000 |
| 식비 | 400,000 |
| 쇼/엔터 | 300,000 |
| 교통/기타 | 200,000 |

**아르헨티나 (버킷리스트, 약 420만원)**
| 카테고리 | 금액(₩) |
|---|---|
| 항공 | 2,500,000 |
| 숙박 | 700,000 |
| 식비(아사도!) | 500,000 |
| 투어/기타 | 500,000 |

## ✅ 준비물 체크리스트 (내가 구성)
- **오사카**: 여권 · eSIM/유심 · 엔화 환전 · 유니버설 스튜디오 티켓 · 이자카야 예약 · 우산
- **라스베가스**: 여권 + ESTA · 달러 환전 · 호텔 예약 · 쇼 티켓(예: Cirque du Soleil) · 우버/렌터카 · 그랜드캐니언 투어
- **아르헨티나**: 여권 · 페소/달러 · 스페인어 기본회화 · 파릴라(아사도 맛집) 리스트 · 말벡 와인 · 이과수 폭포 일정

## 🎵 BGM · 📹 브이로그 (권장안)
- **BGM**: 저작권 문제로 상용 음원은 자동 다운로드하지 않음. **로열티프리/CC 음원**(예: YouTube Audio Library, Pixabay Music, Free Music Archive의 CC0/CC-BY 트랙)에서 잔잔한 여행 무드 곡을 골라 `media/bgm.wav` 대체 권장. (원하면 CC0 트랙 하나 받아서 넣어드릴 수 있음.)
- **브이로그**: 본인 촬영 영상이 없으면 현재 placeholder(`media/vlog.mp4`) 유지하거나, CC 라이선스 여행 클립으로 대체. 마찬가지로 저작권 안전한 것만 사용.

## 🖼️ 사진 출처 (CC BY-SA 4.0 — 페이지에 표기 필수)
아래 저작자 표시 + 라이선스 링크를 **페이지 어딘가(예: figcaption 하단 또는 푸터 credits)에 반드시 노출**해야 함(공유 시에도 동일 라이선스).

| 파일 | 원본 | 저작자 | 라이선스 |
|---|---|---|---|
| `osaka.jpg` | [Dotonbori, Osaka, at night, Nov 2016](https://commons.wikimedia.org/wiki/File:Dotonbori,_Osaka,_at_night,_November_2016.jpg) | Martin Falbisoner | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `lasvegas.jpg` | [Las Vegas, The Strip, 2012](https://commons.wikimedia.org/wiki/File:Las_Vegas_(Nevada,_USA),_The_Strip_--_2012_--_6232.jpg) | Dietmar Rabich | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `argentina.jpg` | [Asado argentino a la estaca](https://commons.wikimedia.org/wiki/File:Asado_argentino_a_la_estaca.jpg) | Horacio Cambeiro | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |

(원본 메타데이터: `images/trip/_credits.json`)

## 페이지 반영 메모
- 오빗 캐러셀 3칸 + 앨범 3장: 리장/세부/홋카이도 → 오사카/라스베가스/아르헨티나로 교체(사진·캡션·후기 위 내용으로).
- `media/lijiang.svg` 등 → `images/trip/*.jpg` 실사진으로 교체. **credits 표기 잊지 말 것.**
- 여행 계획(TesseraJS 예산/체크리스트/날씨/환율) 카드: 위 예산·체크리스트를 seed로. 날씨/환율은 서비스가 목적지명(Osaka/Las Vegas/Buenos Aires)으로 조회.
- 아르헨티나는 "버킷리스트" 뱃지로 다녀온 2곳과 구분.

## 상태
- ✅ 여행지 3곳·상태 확정(사용자), 사진 3장 확보(CC 표기 필요).
- ✍️ 후기·예산·체크리스트는 **제안** → 훑고 수정 가능. 오사카/라스베가스 **여행 연·월** 주시면 캡션에 반영.
