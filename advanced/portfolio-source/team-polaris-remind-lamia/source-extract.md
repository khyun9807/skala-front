# team-polaris — 원문 추출 (source extract)

- 소스: https://lunaticyb.github.io/team-polaris.github.io/
- 추출일: 2026-07-16 · 방법: WebFetch(페이지 요약) + curl(원본 HTML의 에셋 경로 파싱)
- 이 파일은 가공 전 보존용. 정규화된 요약은 [`profile.md`](profile.md).

## 팀/프로젝트 정체성

- 팀명: **Team Polaris**
- 프로젝트: **Remind Lamia (리마인드 라미아)**
- 태그라인: "게임 속 주인공과 함께, 현실과 가상을 구하는 모험이 시작된다."
- 저작권: © 2025 Team Polaris. All rights reserved.

## 프로젝트 개요

내러티브 중심 퍼즐 어드벤처. 고전 게임의 현대 리메이크인 "라미아 어드벤처 3D" 플레이어들이 미스터리하게 실종되는 사건이 전제. 플레이어는 **유(Yu)** 를 조작해 원작 주인공 **릴릿(Lilit)** 과 함께 납치된 사람들을 조사하고, 오염된 게임 세계의 음모를 파헤친다.

게임플레이 요소: 오염된 게임 공간의 퍼즐 풀이, 실종자 조사, 오염된 세계 몬스터와의 조우, 스토리 시퀀스/컷씬, 최종 보스 **LIA**(오염된 AI)와의 전투.

## 스테이지 구조 (7단계)

Stage 0~7 진행: 유의 방에서 시작 → 도시/가상 환경 → LIA와의 최종 대결.

## 캐릭터

1. **유(Yu)** — 주인공
2. **릴릿(Lilit)** — 현실로 나온 원작 게임 주인공
3. **LIA** — 게임을 관리하는 적대적 AI
4. **버스정류장 남자(Bus Station Man)** — 정리해고 사연을 가진 동정적 NPC
5. **미니 라미안(Mini Lamian)** — 피해자들이 변이하는 생물
6. **도서관 몬스터(Library Monster)** — 환경 위협

## 팀 구성/역할

| 이름 | 역할 |
|---|---|
| 김예린 | 리드, 3D/2D 디자인, 언리얼 엔진 컷씬 연출, 캐릭터 애니메이션, 부스 디자인 |
| 김예빈 | 시나리오/스크립팅, 게임 컨셉, 퍼즐/시스템 기획, 오디오, 영상 에셋 |
| **권경현** | 클라이언트 개발 (Unity) ← **나** |

## 기술 스택

- 엔진: Unity(클라이언트), Unreal Engine(컷씬)
- 플랫폼: 웹 기반 포트폴리오 사이트

## 문서 링크(원문에 언급)

- 아트 컨셉: Notion 워크스페이스
- 디자인 문서: Google Drive 폴더

## 원본 HTML에서 파싱한 에셋 경로 (base: `/asset/`)

**이미지(png) — 전부 로컬 다운로드 완료 → `images/`**
```
main.png
U_1.png   lilit.png   LIA.png   BusMan.png   Pikmin.png   Monster.png
stage_0.png stage_1.png stage_2.png stage_3.png stage_4.png stage_5.png stage_6.png
```

**영상(mp4) — 로컬 다운로드 완료 → `videos/`**
```
OP_1.mp4            31 MB   (오프닝)
bullethell_3.mp4    53 MB   (탄막)
drawpuzzle_1.mp4    30 MB   (그리기 퍼즐)
jumpmap_1.mp4       55 MB   (점프맵)
pannelpuzzle_1.mp4  54 MB   (패널 퍼즐)
runandgun_1.mp4     80 MB   (런앤건)
```

## 내비게이션/레이아웃 (원문 관찰)

세로 단일 페이지: hero → about → stages 갤러리 → characters 캐러셀 → credits.
