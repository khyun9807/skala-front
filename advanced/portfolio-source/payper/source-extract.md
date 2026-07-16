# payper — 원문 추출 (source extract)

- 소스: https://github.com/payper-devs (org) + 개별 저장소 메타데이터/README(GitHub API)
- 추출일: 2026-07-16
- 이 파일은 가공 전 보존용. 정규화된 요약은 [`profile.md`](profile.md).

## org 정보

- 이름: **payper** (`payper-devs`)
- 아바타: https://avatars.githubusercontent.com/u/220037890 → 로컬 `images/org-avatar.png`
- 소개(bio): "더 이상 내 혜택을 놓치지 않는 방법 💳" — 보유 카드 기반으로 주변 가맹점 할인을 찾아주는 서비스
- 멤버 목록: org 페이지에서 공개되지 않음(비공개 멤버십)

## 무엇을 만드나

보유 카드로 근처 가맹점에서 받을 수 있는 할인을 확인하는 카드-혜택 발견 플랫폼. 기능(소개 기반): 혜택 브라우징, 카드 관리, 가맹점 검색, 소비 분석, 실시간 알림.

## 저장소 목록 (org 페이지 기준)

| 저장소 | 설명 | 언어 | ★ | fork |
|---|---|---|---|---|
| payper-server | 백엔드 서비스 | Java | 2 | 0 |
| payper-client | 프론트 앱 서비스 (FE) | TypeScript | 0 | 0 |
| payper-server-legacy | 웹 서비스용 레거시 백엔드 | Java | 3 | 1 |
| .github | org 설정 | — | 0 | 0 |
| payper-client-legacy | 레거시 프론트 앱 | Vue | 2 | 1 |
| fcm-test-client | Firebase Cloud Messaging 예제 | JavaScript | 0 | 0 |
| spring-legacy-study | Spring Legacy + MyBatis 스터디 | Java | 0 | 0 |
| geolocation-map-test | Geolocation & Tmap API 예제 | TypeScript | 0 | 0 |
| vue-tdd-guide | Vue.js TDD 개발 가이드 | TypeScript | 0 | 0 |
| payper-project | 프로젝트 관리 저장소 | — | 5 | 0 |
| vue-tanstack-query-guide | TanStack Query 통합 가이드 | TypeScript | 0 | 0 |

## payper-client (현행 FE) 메타데이터

- 설명: "💳 내가 가진 혜택을 확인하는 앱 서비스 (FE)"
- 언어 비율: TypeScript 69.4% · MDX 12.2% · JavaScript 11.0% · CSS 7.0% · HTML 0.4%
- 스택: React + TypeScript · **Vite** · **React Compiler 활성** · Storybook · Husky · ESLint/Prettier
- 아키텍처: `steiger.config.ts` = **FSD(Feature-Sliced Design)** 검증 · `components.json`
- 협업: `.claude/rules`(팀 Claude Code 규칙) · `.github/`(워크플로) · `.husky/`(git hook) · `.storybook/`
- 상태: dev 브랜치 18 커밋, 릴리스 없음, 이슈 1건
- README: **Vite 공식 기본 템플릿 그대로**("React + TypeScript + Vite …") — 제품 문서/스크린샷 없음

## payper-project README

전문: `# kb-19-2` (팀/과정 식별자만. KB 계열 부트캠프 팀 프로젝트로 추정.)

## 담당/성과 (확인 완료 · velog 개선일지 + 경력기술서 기준)

- **본인 담당 = 백엔드** (BE 4인 중 1인, 프론트 아님 — 사용자 확인). 팀: 프론트 3 + 백엔드 4, 기간 2025.07–09.
- 스택(경력기술서): **Spring Framework 5.3 · Java 17 · MyBatis · MySQL · AWS**.
- 주요 성과(수치 포함)는 [`profile.md`](profile.md) 및 [`../CAREER-SUMMARY.md`](../CAREER-SUMMARY.md), 개선 상세는 [`../velog-backend-improvements/extracted-content.md`](../velog-backend-improvements/extracted-content.md).

## 아직 확보 못 한 것

- 제품 스크린샷/UI 이미지, 아키텍처 다이어그램 → 실기기 캡처 필요
- 데모/배포 URL, Figma/Notion 링크
