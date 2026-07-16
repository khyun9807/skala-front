---
id: team-polaris-remind-lamia
title: 리마인드 라미아
title_en: Remind Lamia
category: 게임 · 3인 팀 프로젝트
my_role: 클라이언트 개발 (Unity)
team: Team Polaris — 김예린 · 김예빈 · 권경현(나)
period: 2025 (© 2025 Team Polaris)
one_liner: "게임 속 주인공과 함께, 현실과 가상을 구하는 모험이 시작된다" — 내러티브 퍼즐 어드벤처
featured_image: images/main.png
tech:
  - Unity (클라이언트)
  - Unreal Engine (컷씬 연출)
  - C#
source_links:
  - { label: "포트폴리오 사이트", url: "https://lunaticyb.github.io/team-polaris.github.io/" }
status: draft
todo:
  - 나의 Unity 클라이언트 기여 상세(구현한 시스템/씬)를 1~3줄로 확정
---

## 개요

"라미아 어드벤처 3D"(고전 게임의 현대 리메이크) 플레이어들이 잇따라 실종된다. 주인공 **유(Yu)** 는 원작 게임의 주인공 **릴릿(Lilit)** 과 함께 실종 사건을 추적하며, 오염된 게임 세계의 퍼즐을 풀고 몬스터와 싸운다. 최종 보스는 게임을 관리하는 오염된 AI **LIA**. 현실과 가상이 뒤섞인 세계관을 스토리 시퀀스·컷씬으로 연출한 스토리 중심 어드벤처다.

- 스테이지: **Stage 0~7** (유의 방 → 도시/가상 환경 → LIA와의 최종 대결)
- 장르 믹스: 탄막(bullethell) · 그리기 퍼즐(drawpuzzle) · 점프맵(jumpmap) · 패널 퍼즐(pannelpuzzle) · 런앤건(runandgun)

## 나의 역할

- **Unity 클라이언트 개발** 담당. (팀: 김예린 = 리드·3D/2D 디자인·언리얼 컷씬·캐릭터 애니메이션·부스, 김예빈 = 시나리오·기획·시스템·오디오/영상 에셋.)
- ↳ TODO: 내가 구현한 구체 시스템(플레이어 컨트롤/퍼즐 로직/씬 전환 등)을 한두 줄로 확정해 넣기.

## 핵심 하이라이트 (folio에서 강조할 포인트)

- 하나의 게임 안에 **5종 이상 장르 미니게임**을 녹인 기획 → 짧은 영상 갤러리로 보여주면 임팩트 큼(영상 확보 완료).
- **캐릭터 아트가 강함**(유·릴릿·LIA·BusMan·Monster 등) → 캐릭터 캐러셀/호버 리빌에 적합.
- **7단계 스테이지 아트** → 스크롤 갤러리 또는 스테이지별 스토리 진행 연출에 적합.
- 세계관 서사("현실↔가상") → cipher/michael-gatt 톤의 시네마틱 인트로와 잘 맞음.

## 기술 스택

Unity(클라이언트) · Unreal Engine(컷씬) · C#.

## 자산 (로컬)

**대표/키비주얼**
| 파일 | 용도 |
|---|---|
| `images/main.png` (4.7MB) | 메인 타이틀 키비주얼 — 히어로 후보 |

**캐릭터**
| 파일 | 캐릭터 |
|---|---|
| `images/U_1.png` | 유 (Yu) — 주인공 |
| `images/lilit.png` | 릴릿 (Lilit) — 원작 주인공 |
| `images/LIA.png` | LIA — 오염된 관리 AI(최종 보스) |
| `images/BusMan.png` (5.9MB) | 버스정류장 남자 — 정리해고 서사 NPC |
| `images/Pikmin.png` | 미니 라미안 (피해자 변이체) |
| `images/Monster.png` | 도서관 몬스터 |

**스테이지**
| 파일 | |
|---|---|
| `images/stage_0.png` ~ `images/stage_6.png` | 스테이지 0~6 아트 (7장) |

**게임플레이 영상 (로컬 `videos/`, 6종 · 합계 ≈303MB)**
| 파일 | 장르 |
|---|---|
| `videos/OP_1.mp4` (31MB) | 오프닝 |
| `videos/bullethell_3.mp4` (53MB) | 탄막 |
| `videos/drawpuzzle_1.mp4` (30MB) | 그리기 퍼즐 |
| `videos/jumpmap_1.mp4` (55MB) | 점프맵 |
| `videos/pannelpuzzle_1.mp4` (54MB) | 패널 퍼즐 |
| `videos/runandgun_1.mp4` (80MB) | 런앤건 |

## 포트폴리오 적용 아이디어

- 히어로: `main.png` 풀블리드 + 세계관 한 줄 카피(`one_liner`).
- 캐릭터 캐러셀: 6종 캐릭터를 3D 오빗/호버 리빌로 (aurora-ui `aur-orbit-carousel` 또는 folio 커스텀).
- 스테이지 스크롤 시퀀스: `stage_0~6` 을 스크롤 진행에 따라 전환.
- 장르 믹스 하이라이트 릴: `videos/`의 6개 클립 그리드(용량 크니 포스터 이미지 + `preload="none"`/lazy 권장).

## 출처

원문 추출 내용은 [`source-extract.md`](source-extract.md) 참고. 사이트: https://lunaticyb.github.io/team-polaris.github.io/
