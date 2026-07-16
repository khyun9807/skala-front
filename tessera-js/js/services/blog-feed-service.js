import { apiClient } from "../network/api-client.js";
import { resolveWithFallback } from "./provider-chain.js";
import { apiConfig } from "../config/api-config.example.js";

/**
 * 외부 블로그 피드 데모 서비스. 실제 블로그 기능(목록/검색/댓글 등, features/blog.js)의 메인
 * 콘텐츠는 IndexedDB에 저장된 data/blog-posts.json(Local JSON Provider)을 쓴다. 이 서비스는
 * "직접 Fetch 가능한 JSON API" 연동을 보여주는 별도 데모다(JSONPlaceholder, 키 불필요, CORS 허용).
 *
 * 제한 사항: 실제 RSS 피드는 대부분 CORS를 허용하지 않아 브라우저 단독으로 fetch할 수 없다.
 * 서버 프록시가 있어야 하며, 이 프로젝트에는 그런 서버가 없으므로 RSS 연동은 구조만 제공하고
 * 실제로 호출하지 않는다(README "CORS 제한 설명" 참고).
 */
function normalizeJsonPlaceholderPost(raw) {
  return {
    id: `remote-${raw.id}`,
    title: raw.title,
    content: raw.body,
    tags: ["external"],
    category: "external",
    author: `user-${raw.userId}`,
    createdAt: null,
  };
}

export async function fetchRemoteFeedSample(limit = 5) {
  return resolveWithFallback("blog-feed", [
    {
      name: "jsonplaceholder",
      run: async () => {
        const { data } = await apiClient.get(`${apiConfig.blogFeed.remoteBaseUrl}/posts`, {
          query: { _limit: limit },
          cache: { enabled: true, ttl: 5 * 60_000 },
        });
        return data.map(normalizeJsonPlaceholderPost);
      },
    },
    {
      name: "mock",
      run: async () => [
        { id: "remote-mock", title: "외부 피드를 불러오지 못했습니다", content: "네트워크 상태를 확인해주세요.", tags: [], category: "external", author: "mock" },
      ],
    },
  ]);
}

/** 서버 프록시가 있어야 가능한 RSS 연동 지점(구조 예시 — 실제로 호출하지 않는다) */
export async function fetchRssViaProxy(_proxyUrl, _feedUrl) {
  throw new Error("RSS는 브라우저 단독으로 CORS를 우회할 수 없습니다. 서버 프록시 엔드포인트를 구현한 뒤 이 함수를 채우세요.");
}
