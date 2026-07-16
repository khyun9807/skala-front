# CAREER SUMMARY — 경력기술서 마스터 인덱스

> 출처: velog 개선일지 마무리 글에 포함된 **본인 경력기술서 이미지 1장**을 전사한 것.
> (`velog-backend-improvements/images/09-wrapup/img-01.jpg` = Bridge Bank + Payper Community, `img-02.jpg` = Payper + 대학 시스템 프로젝트)
> 이 파일이 포트폴리오의 **마스터 인덱스**다 — 각 프로젝트 폴더의 `profile.md`는 여기서 파생된다. 기간·팀·역할·기술스택은 **본인이 직접 작성한 이 이미지가 1차 출처**.

## 본인 포지션
백엔드 개발자(신입 취업 준비). Spring 기반 성능·동시성·인프라 개선 경험 다수 + AI(RAG) 확장. velog 필명 권졸렬 / GitHub·velog `khyun9807` / 실명 권경현.

---

## 1. Bridge Bank — 대규모 이체 트래픽을 가정한 뱅킹 서버
- **기간**: 2026.02 – 2026.03
- **팀/역할**: 백엔드 2인 / **백엔드, 팀장**
- **기술**: Spring Boot 4, Java 21, JPA, QueryDSL, MyBatis, PostgreSQL, Scouter, AWS
- **저장소**: [TheBridgePay/bridge-bank-server](https://github.com/TheBridgePay/bridge-bank-server) (fork: [khyun9807/bridge-bank-server](https://github.com/khyun9807/bridge-bank-server)) — README가 30KB 상세 설계 문서
- **성과**
  1. 이체 처리에서 JPA IDENTITY 배치 한계를 MyBatis bulk 연산으로 보완 → DB 라운드트립 50%↓, 이체 처리량 **3.5만건/분 → 5.8만건/분** (개선일지 07)
  2. 예약 이체 처리에 Dispatcher-Worker 패턴 적용해 단일 스레드 순차 병목 해소, 분당 처리량 **4,000건 → 1만건** (개선일지 08)
  3. 예약 이체에 Union-Find 기반 파티셔닝 적용 → 데드락·락 경합·중복 실행 방지, 고동시성 안정성 확보 (개선일지 08)
  4. 이체 거래에 복식부기 원장·회계 검증·이상 알림 체계 구축 → 회계 정합성·운영 대응성 강화 (개선일지 06)
  5. 이체 기능에 계좌 식별자 기준 일관된 락 획득 순서 적용 → 동시 이체 시 교차 락 데드락 방지

## 2. Payper Community — 가맹점 기반 혜택 정보 제공 및 공유 커뮤니티
- **기간**: 2025.07 – 2026.01
- **팀/역할**: 프론트엔드 3인 + 백엔드 3인 / **백엔드, 백엔드 팀장**
- **기술**: Spring Boot 4, Java 21, JPA, QueryDsl, MySQL, Redis, Scouter, AWS, Nginx
- **저장소**: 공개 repo 미확인(비공개 추정) — 내용 출처는 velog 개선일지 03·04·05
- **성과**
  1. 게시글 상세 조회 캐시 스탬피드를 Jitter·Redis 락·논리적 TTL로 완화 → 평균 응답시간 **1.3초 → 217ms** (개선일지 03)
  2. Top100 게시물 조회에서 컬렉션 fetch join + pagination을 LAZY 로딩·BatchSize로 변경 → 인메모리 페이징·불필요 대량 row 적재 제거, **N+1 완화**
  3. 선착순 이벤트 후처리를 Outbox 기반 비동기 구조로 분리 + Dispatcher-Worker·동적 폴링 → 응답 지연·실패 전파·작업 경합 감소 (개선일지 05)
  4. 게시글 좋아요·Top100 조회에 Redis 캐시 + Circuit Breaker 기반 장애 대응 → 성능·서비스 연속성 개선 (개선일지 04)
  5. OAuth2 소셜 로그인 + JWT 인증 체계 구현, 외부 노출용 식별자 분리, Refresh Token Rotation 적용 → 인증 보안성 강화
  6. AWS·Nginx·GitHub Actions·Docker 기반 CI/CD 파이프라인 구축 → 블루그린 무중단 배포 환경 구현
  7. 백엔드 팀장으로서 기능 단위 역할 분담·공통 API/인터페이스 규칙 사전 정리 → 병렬 개발 충돌·일정 지연 완화

## 3. Payper — 위치 기반 카드 추천 및 혜택 공유 서비스
- **기간**: 2025.07 – 2025.09
- **팀/역할**: 프론트엔드 3인 + 백엔드 4인 / **백엔드**
- **기술**: Spring Framework 5.3, Java 17, MyBatis, MySQL, AWS
- **저장소**: [payper-devs](https://github.com/payper-devs) org (payper-server, payper-client 등) — KB 부트캠프 팀("kb-19-2")
- **발표자료**: 슬라이드 35장 → `payper/images/slides/` (원본 `payper/source-presentation-README.md`)
- **아키텍처(발표 16번)**: Vue.js(FE)+Spring(BE), EC2·Docker·Vercel·Nginx·Certbot, 외부 API Kakao·KakaoMap·Codef·OpenAI·FCM, Prometheus·Grafana·k6, GitHub Actions·Docker-compose, MySQL(RDS)·S3
- **핵심 도메인(17번)**: 카드-카드사-혜택-혜택_카테고리-카테고리-혜택_가맹점-가맹점 ERD(7종)
- **성과**
  1. 카드 검색 쿼리에서 불필요 조인 제거·필터링 구조 개선·Full-Text 검색 적용 → 단건 응답시간 **2,000ms → 60ms** (개선일지 01)
  2. 카드 검색에 Caffeine 인메모리 캐시·키 최적화 적용 → DB 커넥션 포화 완화, 피크 응답시간 **910ms → 157ms** (개선일지 02)
  3. 운영 서버 코어 수에 맞춰 DB 커넥션 풀 크기 조정 → 락 경합·과도한 컨텍스트 스위칭 성능 저하 완화
  4. Prometheus·Grafana 모니터링 + Docker 자원 제한 기반 테스트 환경 구성 → 운영 유사 조건에서 성능 한계 검증
  5. Spring Security 기반 OAuth2 소셜 로그인 + JWT 인증 구조 구현 → 외부 플랫폼 연동·인증 흐름 지원
  6. 회원·카드·혜택 도메인 API + 공통 예외 처리 로직 구현 → 응답 일관성·예외 처리 안정성 확보
  7. 연동 API 문서화 + 협업 규칙 정리 → 클라이언트·서버 간 스펙 혼선 감소·개발 생산성 향상

## 4. Remind Lamia — (게임, Team Polaris)
별도 폴더 [`team-polaris-remind-lamia/`](team-polaris-remind-lamia/profile.md) 참고. GitHub 개인 repo: [khyun9807/remind_lamia](https://github.com/khyun9807/remind_lamia) "POLARIS PROJECT-E REMIND LAMIA". Unity 클라이언트 개발.

---

## 부록: 대학 시스템 프로그래밍 팀 프로젝트 (경력기술서에 함께 기재됨)
포트폴리오 folio에 넣을지는 선택. 백엔드/시스템 기본기 근거로 유용.

- **xv6 운영체제 커널 확장** (2024.03–2024.06, 숭실대, 시스템 커널 2인 · C/Linux) — repo [khyun9807/ed_os_gilho](https://github.com/khyun9807/ed_os_gilho)
  - syscall table·커널 함수 호출 경로 확장으로 setnice/getnice/ps 시스템 콜 + PCB 확장 기반 프로세스 우선순위 관리
  - real-time fork 시스템 콜 구현, 기존 스케줄러를 RT 우선순위 기반 라운드로빈 혼합 스케줄러로 확장
  - 16~2048Byte 고정 크기 Slab Allocator 구현 + 비트맵 기반 할당/해제·페이지 회수
  - Copy-on-Write 파일 복사 + 데이터 블록 분리·참조 카운트 기반 해제
- **C/Linux 기반 KVS 서버 및 스냅샷 복구 시스템** (2023.09–2023.12, 숭실대, 2인 · C/Linux, gprof/perf/uftrace/strace) — repo [khyun9807/ed_systemprogramming_lab_eunji](https://github.com/khyun9807/ed_systemprogramming_lab_eunji)
  - in-memory KVS set/get/open/close 핵심 API + 정적/동적 라이브러리 모듈화
  - KVS 스냅샷 기록/복구, 유저 레벨 I/O 대비 시스템 레벨 I/O 성능·메모리 비교
  - TCP 소켓 기반 KVS 서버/클라이언트, set/get 요청 파싱·응답 반환
  - gprof·perf·uftrace·strace 프로파일링으로 함수 병목·캐시 미스·시스템 콜 패턴 분석 및 I/O 버퍼 크기 튜닝

## 관련 개인 학습 저장소 (folio "기타 역량" 근거로 활용 가능)
- [khyun9807/ed_advanced](https://github.com/khyun9807/ed_advanced) — Redis(캐싱·분산락·레이트리밋·실시간집계) + 메시지큐 실습
- [khyun9807/opt_practice](https://github.com/khyun9807/opt_practice) — 페이퍼 프로젝트로 무중단 배포·모니터링·부하테스트·최적화
- [khyun9807/ed_rag_chatbot_with_springai](https://github.com/khyun9807/ed_rag_chatbot_with_springai), [ed_llm](https://github.com/khyun9807/ed_llm) — Spring AI·LLM·RAG 토이
- [khyun9807/jwt_auth_template](https://github.com/khyun9807/jwt_auth_template) — JWT 인증/인가, Refresh Token Rotation, replay 방지
