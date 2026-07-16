/**
 * 외부 API 설정 예시. 이 파일에는 절대 실제 API Key를 적지 않는다.
 *
 * TesseraJS는 API Key가 필요한 서비스(항공/교통 실연동, AI 요약 등)를 붙일 때
 * 두 가지 방법 중 하나를 쓰도록 설계되어 있다.
 *
 *   1) 이 파일을 복사해 api-config.js를 만들고 값만 채운 뒤 절대 커밋하지 않는다(.gitignore 대상).
 *   2) 더 권장하는 방법: playground.html의 "API 설정" 패널에서 브라우저 입력창에 키를 넣으면
 *      js/storage/local-storage.js를 통해 namespace가 분리된 localStorage 슬롯에만 저장되고,
 *      코드/저장소 어디에도 평문으로 기록되지 않는다. js/services/*-service.js는 항상
 *      localStorage → (없으면) 이 파일의 기본값 순서로 키를 조회한다.
 *
 * 키가 없어도 데모가 깨지지 않도록, 키 불필요 Provider(Open-Meteo, Frankfurter)가 기본값이다.
 */
export const apiConfig = {
  weather: {
    provider: "open-meteo", // 키 불필요
    baseUrl: "https://api.open-meteo.com/v1",
    geocodingUrl: "https://geocoding-api.open-meteo.com/v1",
    apiKey: null,
  },
  exchange: {
    provider: "frankfurter", // 키 불필요
    baseUrl: "https://api.frankfurter.app",
    apiKey: null,
  },
  transport: {
    provider: "mock", // 실제 대중교통 API는 국가별 인증/CORS 제약이 커 기본은 mock
    baseUrl: null,
    apiKey: null,
  },
  flight: {
    provider: "mock",
    baseUrl: null,
    apiKey: null,
  },
  ferry: {
    provider: "mock",
    baseUrl: null,
    apiKey: null,
  },
  blogFeed: {
    remoteProvider: "jsonplaceholder",
    remoteBaseUrl: "https://jsonplaceholder.typicode.com",
  },
  summarizer: {
    mode: "rule-based", // "rule-based" | "ai" — ai는 인터페이스만 제공, 기본 비활성
    aiEndpoint: null,
    apiKey: null,
  },
};
