---
id: payper
title: Payper
title_en: Payper — 위치 기반 카드 추천 및 혜택 공유 서비스
category: 카드 혜택 서비스 · 팀 프로젝트(KB 부트캠프 "kb-19-2")
my_role: 백엔드 (BE 4인 중 1인)   # 사용자 확인: 프론트 아님
team: 프론트엔드 3인 + 백엔드 4인
period: 2025.07 – 2025.09
one_liner: "더 이상 내 혜택을 놓치지 않는 방법 💳" — 보유 카드로 주변 가맹점 혜택을 찾아주는 위치 기반 서비스
featured_image: images/slides/01-title.png
tech:
  - "내 담당(BE): Spring Framework 5.3 · Java 17 · MyBatis · MySQL · AWS"
  - "BE 상세: Spring Security · OAuth2 · JWT · Nginx · Certbot"
  - "외부 API: Kakao 로그인 · KakaoMap(위치검색) · Codef(카드·이용내역) · OpenAI(소비리포트) · FCM(알림)"
  - "인프라/운영: AWS EC2 · Docker · Docker-compose · GitHub Actions(CI/CD) · S3 · RDS"
  - "모니터링/부하: Prometheus · Grafana · k6"
  - "FE(팀): Vue.js · Pinia · Tailwind · PWA (배포 Vercel)"
source_links:
  - { label: "GitHub org (payper-devs)", url: "https://github.com/payper-devs" }
  - { label: "발표자료 README(이미지 35장 출처)", url: "" }
  - { label: "개선일지 01 쿼리최적화", url: "https://velog.io/@khyun9807/%EA%B0%9C%EC%84%A0%EC%9D%BC%EC%A7%801%EC%BF%BC%EB%A6%AC-%EC%B5%9C%EC%A0%81%ED%99%94" }
  - { label: "개선일지 02 캐시", url: "https://velog.io/@khyun9807/%EA%B0%9C%EC%84%A0%EC%9D%BC%EC%A7%802%EC%BA%90%EC%8B%9C" }
status: ready
todo:
  - "배포/데모 URL 있으면 추가"
---

## 개요

보유 신용카드 기준으로 주변 가맹점에서 받을 수 있는 혜택/할인을 위치 기반으로 찾아주는 웹앱 서비스. "실적마다·달마다·요일마다 달라지는 복잡한 카드별 혜택"을 **가맹점·카테고리로 연결**해 직관적으로 보여주는 것이 핵심 도메인. KB 부트캠프 팀 프로젝트("kb-19-2"), 프론트 3 + 백엔드 4의 7인 팀이며 **나는 백엔드 담당**.

## 나의 역할 — 백엔드

백엔드 4인 중 1인. 회원·카드·혜택 도메인 API, 검색 쿼리/캐시 성능 개선, 인증(OAuth2·JWT), 모니터링 기반 성능 검증 담당. (프론트엔드 아님 — 사용자 확인 완료.)

## 핵심 성과 (경력기술서 기준)

1. **카드 검색 쿼리 최적화 — 단건 2,000ms → 60ms**: 불필요 조인 제거, 필터링 구조 개선, LONGTEXT Full-Text Index, MyBatis 동적 SQL. → [개선일지 01](../velog-backend-improvements/extracted-content.md#01-쿼리-최적화--단건-응답시간-약-2000ms--약-60ms)
2. **Caffeine 인메모리 캐시 — 피크 910ms → 157ms, 히트율 97%**: Look-Aside, 정형 조건만 캐시·키워드 바이패스, 커넥션풀 포화 −75%. → [개선일지 02](../velog-backend-improvements/extracted-content.md#02-caffeine-인메모리-캐시--피크-910ms--157ms)
3. DB 커넥션 풀 크기를 서버 코어 수에 맞춰 조정(락 경합·컨텍스트 스위칭 완화)
4. Prometheus·Grafana 모니터링 + k6 부하 테스트 + Docker 자원 제한 테스트 환경으로 성능 한계 검증
5. Spring Security OAuth2(Kakao) 소셜 로그인 + JWT
6. 회원·카드·혜택 도메인 API + 공통 예외 처리
7. 연동 API 문서화 + 협업 규칙 정리

## 기술 스택 & 아키텍처 (발표자료 16번 슬라이드 전사)

- **웹앱**: Vue.js(FE) + Spring Framework(BE)
- **인프라**: 서버 AWS EC2 + Docker / 클라이언트 Vercel / Nginx + Certbot(HTTPS)
- **외부 API**: Kakao 로그인, **KakaoMap**(위치 기반 검색), **Codef**(사용자 카드·이용내역 조회), **OpenAI**(소비내역 리포트 생성), **FCM + PWA**(혜택 알림)
- **DB**: MySQL(RDS) + S3
- **모니터링/부하**: Prometheus + Grafana + **k6**
- **CI/CD**: GitHub Actions + Docker-compose
- **FE 상세**: Vue.js · Pinia · Tailwind · PWA

## 핵심 도메인 (17번 슬라이드 전사 — ERD)

"복잡한 카드별 혜택 구조를 가맹점과 카테고리로 표현." 엔티티 7종:
`카드(card)` ─ `카드사(card_company)` / `카드 ─ 혜택(benefit)` / `혜택 ─ 혜택_카테고리(benefit_category) ─ 카테고리(category)` / `혜택 ─ 혜택_가맹점(benefit_partner) ─ 가맹점(partner)`.

## 결과 (29번 슬라이드 전사)

배포된 MVP로 **사용자 인터뷰 5명** 진행:
- 👍 좋았어요: "내 카드에 있는 줄 몰랐던 혜택을 처음 알았어요", "주변 가게 혜택 확인 유용", "분석까지 해줘서 좋다", "검색 필터로 빨리 찾기 쉬움", "디자인 예쁨"
- 👎 아쉬워요: 설명 부족, 화면 이동 불편, 지도 사용성, 검색어 정확 일치 필요, 버튼 많음
- 💡 더 있으면: 카드 혜택 비교, 즐겨찾기, 소비 패턴 기반 추천, 위키형 오픈 커뮤니티, 상호작용 기능
  (→ "위키형 오픈 커뮤니티" 니즈가 다음 프로젝트 **Payper Community**로 이어짐)

## 자산 (로컬)

- **발표 슬라이드 35장** `images/slides/01~35-*.png` (1920×1080, 총 18MB) — 원본 목록·순서는 [`source-presentation-README.md`](source-presentation-README.md)
  - 도입(01~07): Title·Overview·Background·Survey·Insight·Competitors·Service Goal
  - **UI 스크린샷(08~15)**: 내주변 혜택조회·검색·내카드 모아보기·카드연결·카드추천·카드정보·혜택알림·소비분석
  - 기술(16~17): Tech Stack & Architecture · Key Domain(ERD)
  - **트러블슈팅(18~28)**: Troubleshooting 1~5 → **전사 완료** [`troubleshooting-extracted.md`](troubleshooting-extracted.md). **내 직접 담당 = TS4(시중 카드 검색 OOM → P99 7s→87ms, GC 50→12ms) · TS3(Docker 부하 테스트 환경).** TS1(크롤링)·TS2(CODEF)·TS5(내 카드 조회)는 **팀원 담당**이니 내 성과로 쓰지 말 것.
  - 마무리(29~35): Key Results & Limitations · Roadmap · Collaboration · Retrospect ×2 · Team · Thank You
- `images/org-avatar.png` — payper-devs org 로고
- 성능 개선 다이어그램: `../velog-backend-improvements/images/01-query-optimization/`, `02-cache/`

## 포트폴리오 적용 아이디어

- 히어로: `slides/01-title.png` 또는 대표 UI(`08~15`). 기능 갤러리로 08~15 8장을 캐러셀.
- "쿼리 2,000ms→60ms" "캐시 910ms→157ms" 수치 배지 + `16-tech-stack-architecture.png` 아키텍처.
- 결과 슬라이드(29)의 사용자 인터뷰 인용을 "임팩트" 섹션에.

## 출처

발표자료: [`source-presentation-README.md`](source-presentation-README.md) · **트러블슈팅 전사: [`troubleshooting-extracted.md`](troubleshooting-extracted.md)** · 저장소 메타: [`source-extract.md`](source-extract.md) · velog 성과 전사: [`../velog-backend-improvements/extracted-content.md`](../velog-backend-improvements/extracted-content.md) · 마스터: [`../CAREER-SUMMARY.md`](../CAREER-SUMMARY.md).
