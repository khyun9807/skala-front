---
id: velog-backend-improvements
title: 개선일지 (백엔드 성능·동시성 개선 시리즈)
title_en: Backend Improvement Log
category: 엔지니어링 문서/회고 — 3개 백엔드 프로젝트의 개선 기록
my_role: 저자 본인 (백엔드)
team: 개인 (문서), 대상 프로젝트는 팀
period: "글 게시 2026-07-08 (대상 작업 2025.07~2026.03)"
one_liner: payper·payper-community·bridge-bank 세 프로젝트의 성능·동시성 개선을 문제→구조변경→수치로 정리한 9부작
featured_image: images/01-query-optimization/img-01.jpg
tech: [Spring, MyBatis, JPA, Redis, Kafka, "캐시(Caffeine/Redis)", "비동기/병렬(Outbox·Dispatcher-Worker)", "Circuit Breaker(Resilience4j)", "복식부기 원장", AWS]
source_links:
  - { label: "velog @khyun9807", url: "https://velog.io/@khyun9807" }
status: ready
todo:
  - "각 글 상세 케이스는 이미지 전사(extracted-content.md)에 이미 반영됨 — 추가 추출 불필요"
---

## 이게 뭔가 (중요)

velog `개선일지` 9부작은 **각 글이 Notion 페이지를 이미지(A4)로 export한 형태**라, 실제 내용이 본문이 아니라 **이미지 안**에 있다. 그래서:

- **이미지 속 텍스트 전량 전사** → [`extracted-content.md`](extracted-content.md) ← **가장 중요한 산출물**. 프로젝트별로 묶여 있고 수치까지 포함.
- 저자 회고(본문 텍스트) → [`posts/<NN-slug>.md`](posts/) (짧은 성찰 글, 9개).
- 원본 이미지 → [`images/<NN-slug>/`](images/) (글당 1장, 09만 2~3장).
- 경력기술서 마스터 인덱스 → [`../CAREER-SUMMARY.md`](../CAREER-SUMMARY.md).

## 9개 글 ↔ 프로젝트 매핑

| # | 글 | 프로젝트 | 핵심 수치 |
|---|---|---|---|
| 01 | 쿼리 최적화 | **Payper** | 2,000ms → 60ms |
| 02 | 캐시(Caffeine) | **Payper** | 910ms → 157ms, 히트율 97% |
| 03 | 캐시 스탬피드 | **Payper Community** | 1.3s → 217ms, 628→1,000 TPS |
| 04 | Circuit Breaker | **Payper Community** | Redis 장애 무중단·30초 자동복구 |
| 05 | 비동기/병렬(Outbox) | **Payper Community** | 처리량 2.9배, 폴링 60→2회/분 |
| 06 | 알림 체계(복식부기) | **Bridge Bank** | 11.7만 전표/23.5만 분개 전량 일치 |
| 07 | 쓰기 최적화(MyBatis bulk) | **Bridge Bank** | 120ms→33ms, 3.5만→5.8만건/분 |
| 08 | 데드락/락경합(Union-Find) | **Bridge Bank** | 400→1만건/분, 이중이체 0건 |
| 09 | 마무리(회고+경력기술서) | 전체 | — |

각 프로젝트 프로필: [`../payper/`](../payper/profile.md) · [`../payper-community/`](../payper-community/profile.md) · [`../bridge-bank/`](../bridge-bank/profile.md).

## 핵심 메시지 (About/카피용)

> "성능 개선도, 캐시도, 비동기/병렬 처리도 결국은 기술 자체보다 **문제를 어떻게 보고 구조를 어떻게 바꿨는지**가 더 중요하다."

향후 방향: 최근 프로젝트에 Spring AI·LLM·RAG·Function Calling 적용, AI 역량으로 확장 중.

## 포트폴리오 적용 아이디어

- 이 폴더는 **개별 프로젝트 카드의 "성능 개선 상세"** 소스. 각 수치·다이어그램을 해당 프로젝트 페이지에 꽂는다.
- 9개를 "개선 타임라인"으로 묶어 백엔드 성장 서사로도 활용 가능.

## 출처

[`extracted-content.md`](extracted-content.md) 상단 참고. 이미지는 사람이 직접 전사(정확도 높음).
