---
id: payper-community
title: Payper Community
title_en: Payper Community — 가맹점 기반 혜택 정보 제공 및 공유 커뮤니티
category: 커뮤니티 서비스 · 팀 프로젝트
my_role: 백엔드 · 백엔드 팀장 (BE 3인)
team: 프론트엔드 3인 + 백엔드 3인
period: 2025.07 – 2026.01
one_liner: 가맹점 혜택 정보를 나누는 커뮤니티 — 게시글·좋아요·랭킹·선착순 이벤트를 고동시성에서 버티게 만든 백엔드
featured_image: ../velog-backend-improvements/images/04-circuit-breaker/img-01.jpg
tech:
  - Spring Boot 4
  - Java 21
  - JPA · QueryDSL
  - MySQL
  - Redis
  - Scouter
  - AWS · Nginx
source_links:
  - { label: "개선일지 03 캐시 스탬피드", url: "https://velog.io/@khyun9807/%EA%B0%9C%EC%84%A0%EC%9D%BC%EC%A7%803%EC%BA%90%EC%8B%9C-%EC%8A%A4%ED%85%9C%ED%94%BC%EB%93%9C" }
  - { label: "개선일지 04 Circuit Breaker", url: "https://velog.io/@khyun9807/%EA%B0%9C%EC%84%A0%EC%9D%BC%EC%A7%804Circuit-Breaker" }
  - { label: "개선일지 05 병렬 처리(Outbox)", url: "https://velog.io/@khyun9807/%EA%B0%9C%EC%84%A0%EC%9D%BC%EC%A7%805%EB%B3%91%EB%A0%AC-%EC%B2%98%EB%A6%AC" }
status: ready
todo:
  - "공개 저장소 URL 있으면 추가(현재 미확인 — 비공개 추정)"
  - "서비스 스크린샷/데모 URL 있으면 추가"
---

## 개요

가맹점 기반 혜택 정보를 제공·공유하는 커뮤니티 서비스(게시글·좋아요·Top100 랭킹·선착순 쿠폰 이벤트). 프론트 3 + 백엔드 3의 6인 팀이며 **나는 백엔드 팀장**. Payper(카드 추천) 이후 확장된 커뮤니티 축으로, Redis를 핵심 경로로 쓰는 고동시성 설계가 특징.

## 나의 역할 — 백엔드 팀장

백엔드 3인 팀장으로 기능 단위 역할 분담·공통 API/인터페이스 규칙을 사전 정리해 병렬 개발 충돌·일정 지연을 완화. 캐시/장애대응/비동기 처리 등 핵심 성능·안정성 설계를 주도.

## 핵심 성과 (경력기술서 기준)

1. **캐시 스탬피드 완화 — 1.3초 → 217ms, 628→1,000 TPS**: Jitter(±50%)·Redis 분산 락·물리/논리 TTL 분리(stale 허용). 동일 키 중복 DB 접근 −75%. → [개선일지 03](../velog-backend-improvements/extracted-content.md#03-캐시-스탬피드-완화--평균-13초--217ms)
2. **Top100 조회 N+1 완화**: 컬렉션 fetch join + pagination을 LAZY 로딩·BatchSize로 변경 → 인메모리 페이징·불필요 대량 row 적재 제거.
3. **선착순 이벤트 비동기화 — 처리량 2.9배**: Outbox로 후처리 분리 + Dispatcher-Worker + 동적 폴링(50ms~30s, 분당 60→2회). → [개선일지 05](../velog-backend-improvements/extracted-content.md#05-outboxdispatcher-worker동적-폴링-선착순-이벤트)
4. **좋아요·Top100 장애 대응**: Redis Write-Behind(비트맵+카운터+Sorted Set) + Resilience4j Circuit Breaker fallback, 복구 시 자동 재시딩(무중단). → [개선일지 04](../velog-backend-improvements/extracted-content.md#04-circuit-breaker-기반-장애-대응-좋아요top100)
5. OAuth2 소셜 로그인 + JWT, 외부 노출용 식별자 분리, Refresh Token Rotation.
6. AWS·Nginx·GitHub Actions·Docker CI/CD + **블루그린 무중단 배포**.
7. 백엔드 팀장 협업 리딩.

## 기술 스택

Spring Boot 4 · Java 21 · JPA · QueryDSL · MySQL · **Redis(핵심 경로)** · Scouter · AWS · Nginx.

## 자산 (로컬 — velog 개선일지 이미지 재사용)

| 파일 | 내용 |
|---|---|
| `../velog-backend-improvements/images/03-cache-stampede/img-01.jpg` | 캐시 스탬피드 완화 흐름 + TPS/응답 그래프 |
| `../velog-backend-improvements/images/04-circuit-breaker/img-01.jpg` | Circuit Breaker 상태 다이어그램 + 아키텍처 |
| `../velog-backend-improvements/images/05-parallel-processing/img-01.jpg` | Outbox·Dispatcher-Worker 구조도 |

## 포트폴리오 적용 아이디어

- **가장 강한 백엔드 스토리**: Redis 캐시 스탬피드·Circuit Breaker·Outbox까지 "고동시성에서 안 무너지게 만든" 서사. 손그림 아키텍처 다이어그램이 그대로 시각 자료로 좋음.
- "1.3s→217ms", "2.9배", "무중단" 수치 배지.
- 팀장 리딩 경험을 소프트스킬 포인트로.

## 출처

성과 전사: [`../velog-backend-improvements/extracted-content.md`](../velog-backend-improvements/extracted-content.md). 마스터 인덱스: [`../CAREER-SUMMARY.md`](../CAREER-SUMMARY.md).
