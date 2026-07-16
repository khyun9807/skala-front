# Portfolio Source — 내 경험 원자재(raw material)

> 사용자의 **실제 경험/프로젝트**를 awwwards folio(참고: [`../cipher-benchmark-report.md`](../cipher-benchmark-report.md), [`../michael-gatt-folio-조사보고서.md`](../michael-gatt-folio-조사보고서.md))에 **바로 꽂아 넣을 수 있게** 이미지·내용을 추출·정규화한 폴더.
> 추출일: 2026-07-16 · git 미추적(`advanced/` 하위) 작업 영역.

**이 폴더 = "무엇을 담을지"(콘텐츠). `advanced/`의 cipher/michael-gatt 자료 = "어떻게 보여줄지"(연출).**

## 0. 먼저 읽을 것 → [`CAREER-SUMMARY.md`](CAREER-SUMMARY.md)

사용자 본인이 작성한 **경력기술서 1장**을 전사한 마스터 인덱스. 모든 프로젝트의 기간·기술스택·팀 구성·역할·성과가 여기 다 있다. 각 프로젝트 `profile.md`는 여기서 파생. **folio 만들 땐 이 파일부터.**

---

## 1. 담긴 경험

| 폴더 | 제목 | 성격 | 나의 역할 | 기간 |
|---|---|---|---|---|
| [`team-polaris-remind-lamia/`](team-polaris-remind-lamia/profile.md) | 리마인드 라미아 | 게임 · 3인 | 클라이언트(Unity) | 2025 |
| [`payper/`](payper/profile.md) | Payper (위치기반 카드추천) | 서비스 · FE3+BE4 | **백엔드** | 2025.07–09 |
| [`payper-community/`](payper-community/profile.md) | Payper Community (혜택 커뮤니티) | 서비스 · FE3+BE3 | **백엔드 팀장** | 2025.07–2026.01 |
| [`bridge-bank/`](bridge-bank/profile.md) | Bridge Bank (뱅킹 서버) | 백엔드 · BE2 | **백엔드 팀장** | 2026.02–03 |
| [`velog-backend-improvements/`](velog-backend-improvements/profile.md) | 개선일지 9부작 | 위 3개 서비스의 성능·동시성 **개선 기록** | 저자 | 문서 2026.07 |

`velog-backend-improvements/`는 독립 프로젝트가 아니라 **payper·payper-community·bridge-bank의 개선 상세 소스**다. 각 프로젝트 프로필이 여기 이미지/전사를 참조한다.

`profile/`는 프로젝트가 아니라 **과제 페이지를 채울 개인 정보**다 (4개 페이지 모두 준비됨):
- myProfile → [`profile/profile-page-content.md`](profile/profile-page-content.md) (음식·성향·좌우명·아바타 `images/avatar.jpeg`)
- myClass → [`profile/class-page-content.md`](profile/class-page-content.md) (실제 SKALA 5주 커리큘럼)
- myTrip → [`profile/trip-page-content.md`](profile/trip-page-content.md) (오사카·라스베가스·아르헨티나 + 사진 `images/trip/`, **CC BY-SA 4.0 표기 필수**)
- myHoliday → [`profile/holiday-page-content.md`](profile/holiday-page-content.md) (휴일 루틴 — 내 제안, 확인 권장)

각 폴더 구성: `profile.md`(정규화 프로필, 스키마는 3절) · `source-extract.md`(원문 보존) · 자산.

---

## 2. 지금 상태 (뭐가 되어있고 뭐가 TODO인지)

**이미지 — 전부 로컬 확보**
- team-polaris: 이미지 14 + **게임플레이 영상 6개(≈303MB, `videos/`)**.
- velog 개선일지: **글 9편 × 이미지(글당 1장, 09만 2장) = 11장**, 글별 폴더 `images/<NN-slug>/`. + 프로필 1.
- payper: **발표 슬라이드 35장** `payper/images/slides/`(1920×1080, 18MB — UI 스크린샷 8 · 아키텍처 · ERD · 트러블슈팅 11 · 결과 등) + org 아바타 1.

**내용 — 추출 완료**
- ✅ **velog 이미지 속 텍스트 전량 전사** → [`velog-backend-improvements/extracted-content.md`](velog-backend-improvements/extracted-content.md) (Notion→이미지 export라 텍스트가 이미지 안에 있었음. 사람이 직접 전사, 정확도 높음.)
- ✅ velog 각 글 **본문 마크다운(회고)** → `velog-backend-improvements/posts/*.md`
- ✅ **bridge-bank-server README(30KB 설계문서)** 원문 → [`bridge-bank/source-README.md`](bridge-bank/source-README.md)
- ✅ payper 담당 파트 **백엔드로 확정**(사용자 확인).
- ✅ payper **발표자료 README(슬라이드 35장) 보존**([`payper/source-presentation-README.md`](payper/source-presentation-README.md)) + 아키텍처·ERD·결과 슬라이드 텍스트를 `payper/profile.md`에, **트러블슈팅 11장(18~28)을 [`payper/troubleshooting-extracted.md`](payper/troubleshooting-extracted.md)에 전사**. FE=Vue.js, 외부 API=Kakao·Codef·OpenAI·FCM 등 확인.

**TODO (지어내지 말고 사용자에게)**
- ⚠️ payper-community: **앱 실제 스크린샷 없음** → 실기기 캡처 필요. (payper는 발표 슬라이드 35장으로 확보 완료.)
- ⚠️ payper-community 공개 저장소 URL 미확인(비공개 추정).
- ⏳ 게임플레이 영상 **포스터 이미지 미생성**(이 환경에 ffmpeg 없음) → folio 단계에서 `<video preload="none">` 첫 프레임 사용하거나 포스터 별도 생성.
- ℹ️ velog 관련 GitHub 학습 저장소(ed_advanced, opt_practice, ed_rag_* 등)는 CAREER-SUMMARY 부록에 링크만.

---

## 3. `profile.md` 스키마 (새 경험 추가 시 유지)

```yaml
---
id:            # 폴더명과 동일 kebab-case
title:         # 한글 제목
title_en:      # 영문/원제
category:      # 한 줄 분류
my_role:       # 이 프로젝트에서 내가 한 일
team:          # 팀 구성
period:        # 시기
one_liner:     # 카드 부제 한 문장
featured_image:# images/ 기준 대표 이미지 상대경로 (velog 이미지 재사용 시 ../ 경로)
tech: []       # 기술 태그
source_links: []# {label,url}
status:        # draft | ready
todo: []       # 채워야 할 것
---
```
본문 공통 섹션: 개요 → 나의 역할 → 핵심 성과 → 기술 스택 → 자산 → 포트폴리오 적용 아이디어 → 출처.

---

## 4. Claude Code에게 (folio에 적용할 때)

> ⭐ **folio 적용은 전용 계획서가 있다 → [`../folio-content-application-plan.md`](../folio-content-application-plan.md). 실행 전 반드시 이걸 먼저 읽을 것** (콘텐츠 매핑·이미지 전략·지켜야 할 제약·작업 순서·실행 프롬프트 포함).

1. **[`CAREER-SUMMARY.md`](CAREER-SUMMARY.md) → 각 `profile.md` 순서로 읽으면** 전체 콘텐츠 파악 끝. 성능 개선 상세·수치·다이어그램이 필요하면 [`velog-backend-improvements/extracted-content.md`](velog-backend-improvements/extracted-content.md).
2. **이미지는 전부 로컬.** 원격 재다운로드 금지. velog 이미지를 프로젝트 카드에 쓸 땐 `../velog-backend-improvements/images/<NN>/img-01.jpg` 상대경로(각 프로필에 이미 명시).
3. **수치가 이 포트폴리오의 무기다**: "2,000ms→60ms", "910→157ms", "1.3s→217ms", "3.5만→5.8만건/분", "이중이체 0건", "11.7만 전표 전량 일치". 카드 전면 배지로.
4. **추측 금지**: payper/community 스크린샷 유무, community 저장소 URL은 미확정(2절 TODO). 지어내지 말 것.
5. 용량 주의: `team-polaris/images/main.png`(4.7MB)·`BusMan.png`(5.9MB), 영상 6개(각 30~80MB)는 folio에서 lazy/poster 처리.
6. 연출은 `../cipher-*`·`../michael-gatt-*`, 콘텐츠는 이 폴더. 새 경험 추가 시 3절 스키마 + 1절 표 + CAREER-SUMMARY 갱신.
