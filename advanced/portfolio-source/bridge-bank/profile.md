---
id: bridge-bank
title: Bridge Bank
title_en: Bridge Bank — 대규모 이체 트래픽을 가정한 뱅킹 서버
category: 뱅킹 백엔드 · 팀 프로젝트 (Bridge Pay의 뱅킹 시스템)
my_role: 백엔드 · 팀장 (BE 2인)
team: 백엔드 2인
period: 2026.02 – 2026.03
one_liner: 대규모 이체를 가정한 뱅킹 서버 — 복식부기 원장으로 회계 정합성을, bulk·Union-Find로 처리량을 잡은 백엔드
featured_image: ../velog-backend-improvements/images/08-deadlock-contention/img-01.jpg
tech:
  - Spring Boot 4
  - Java 21
  - JPA · QueryDSL
  - MyBatis
  - PostgreSQL
  - Scouter
  - AWS
source_links:
  - { label: "TheBridgePay/bridge-bank-server (README=상세 설계문서)", url: "https://github.com/TheBridgePay/bridge-bank-server" }
  - { label: "내 fork (khyun9807)", url: "https://github.com/khyun9807/bridge-bank-server" }
  - { label: "개선일지 07 쓰기 최적화", url: "https://velog.io/@khyun9807/%EA%B0%9C%EC%84%A0%EC%9D%BC%EC%A7%807%EC%93%B0%EA%B8%B0-%EC%B5%9C%EC%A0%81%ED%99%94" }
  - { label: "개선일지 08 데드락/락경합", url: "https://velog.io/@khyun9807/%EA%B0%9C%EC%84%A0%EC%9D%BC%EC%A7%808%EB%8D%B0%EB%93%9C%EB%9D%BD%EB%9D%BD%EA%B2%BD%ED%95%A9-%EC%A0%9C%EA%B1%B0-%EA%B3%84%ED%9A%8D" }
  - { label: "개선일지 06 알림 체계(복식부기)", url: "https://velog.io/@khyun9807/%EA%B0%9C%EC%84%A0%EC%9D%BC%EC%A7%806%EC%95%8C%EB%A6%BC-%EC%B2%B4%EA%B3%84" }
status: ready
todo:
  - "bridge-bank-server README(30KB) 원문을 source-extract로 복사할지 결정 (현재 링크만)"
  - "Bridge Pay(bridge-pay-server/client)와의 관계 한 줄 정리 — Bridge Bank는 Bridge Pay의 뱅킹 시스템"
---

## 개요

"브릿지 페이 만의 뱅킹 시스템". 대규모 이체 트래픽(분당 수만 건)을 가정해 **간단한 이체·예약·조회를 지원하며 회계 무결성을 보장**하는 것을 목표로 한 뱅킹 서버. 멀티 모듈(common/core-server/worker), 복식부기 원장(전표·분개), Kafka 메시징, 예약이체 워커 스케줄러로 구성. 백엔드 2인, **나는 팀장**.

> README(30KB)가 사실상 설계 문서: 프로젝트 개요 → 기술 스택 → 멀티 모듈 → 패키지 → ERD → 엔티티 상세(Account/TransferTransactionResult/ReserveOnce·RepeatTransferSchedule/LedgerVoucher/LedgerEntry/TransferNotification) → 기능 흐름(계좌생성/즉시이체/예약이체/거래내역/알림/복식부기/회계검증) → API → Kafka 토픽·이벤트 → 스케줄러(Union-Find 데드락 방지) → 핵심 설계 패턴 → 에러 처리.

## 나의 역할 — 백엔드 팀장

이체 처리 파이프라인의 성능·동시성·정합성 설계를 주도. 아래 성과 대부분이 이 프로젝트의 백엔드 개선.

## 핵심 성과 (경력기술서 기준)

1. **MyBatis bulk 쓰기 — 단건 120ms→33ms, 처리량 3.5만→5.8만건/분**: JPA IDENTITY 배치 한계를 MyBatis multi-row insert + 단일 Bulk Update로 우회(INSERT 8→3회, UPDATE 2→1회), 라운드트립 50%↓. 기존 JPA는 유지한 **하이브리드**. → [개선일지 07](../velog-backend-improvements/extracted-content.md#07-mybatis-bulk-쓰기-최적화--처리량-35만--58만건분)
2. **Union-Find 파티셔닝 — 예약이체 400→1만건/분, 이중이체 0건**: 연관 계좌 이체를 Union-Find로 동일 파티션 그룹화, 파티션 간 CompletableFuture 병렬·내부 순차, `allOf().join()`으로 중복 실행 방지. 데드락·락경합·순서문제 동시 해결. → [개선일지 08](../velog-backend-improvements/extracted-content.md#08-union-find-파티셔닝-데드락-방지--예약이체-처리량--1만건분)
3. **복식부기 원장·회계 검증·이상 알림 — 분당 11.7만 전표/23.5만 분개 전량 일치**: 예금=부채/보유금=자산 원칙의 전표·분개 모델, 이체+원장 단일 트랜잭션 원자 저장, 차변·대변·거래금액 자동 교차 검증 + Grafana→Slack 이상 알림. → [개선일지 06](../velog-backend-improvements/extracted-content.md#06-복식부기-원장회계-검증이상-알림-체계)
4. 계좌 식별자 기준 일관된 락 획득 순서로 교차 락 데드락 방지.

## 기술 스택

Spring Boot 4 · Java 21 · JPA · QueryDSL · **MyBatis(쓰기 최적화)** · **PostgreSQL** · **Kafka** · Scouter · AWS. 멀티모듈(common/core-server/worker).

## 자산 (로컬 — velog 개선일지 이미지 재사용)

| 파일 | 내용 |
|---|---|
| `../velog-backend-improvements/images/07-write-optimization/img-01.jpg` | 쓰기 경로 before/after 다이어그램 |
| `../velog-backend-improvements/images/08-deadlock-contention/img-01.jpg` | Union-Find 파티셔닝 vs Hash 비교 구조도 |
| `../velog-backend-improvements/images/06-notification-system/img-01.jpg` | 복식부기 원장 + 회계검증/이상알림 파이프라인 |

## 포트폴리오 적용 아이디어

- **가장 "묵직한" 백엔드 카드**: 뱅킹·복식부기·회계무결성·Kafka·Union-Find. "이중이체 0건", "5.8만건/분", "11.7만 전표 전량 일치" 수치가 강력.
- README가 그대로 상세 페이지 콘텐츠로 전환 가능(ERD·엔티티·API·Kafka 토픽).
- 손그림 구조도 3장이 시각 자료로 좋음.

## 출처

README: 위 source_links. 성과 전사: [`../velog-backend-improvements/extracted-content.md`](../velog-backend-improvements/extracted-content.md). 마스터 인덱스: [`../CAREER-SUMMARY.md`](../CAREER-SUMMARY.md).
