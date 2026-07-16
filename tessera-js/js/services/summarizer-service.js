import { stripHtmlTags } from "../utils/security.js";

const STOPWORDS = new Set(["그리고", "그러나", "하지만", "그래서", "또한", "이것", "저것", "합니다", "했습니다", "있습니다", "입니다", "것은", "때문에"]);

function splitSentences(text) {
  return text
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function tokenize(sentence) {
  return sentence
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STOPWORDS.has(word));
}

function computeWordFrequency(sentences) {
  const freq = new Map();
  for (const sentence of sentences) {
    for (const word of tokenize(sentence)) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return freq;
}

function scoreSentence(sentence, freq) {
  const words = tokenize(sentence);
  if (words.length === 0) return 0;
  const total = words.reduce((sum, word) => sum + (freq.get(word) ?? 0), 0);
  return total / words.length;
}

/**
 * 규칙 기반 요약: HTML 태그 제거 → 문장 분리 → 불용어 제거 → 단어 빈도 계산 →
 * 문장 점수 계산 → 상위 문장 선택 → 원래 문장 순서 복원. API Key 없이 항상 동작한다.
 */
export function summarizeRuleBased(rawText, { sentenceCount = 3 } = {}) {
  const text = stripHtmlTags(rawText);
  const sentences = splitSentences(text);
  if (sentences.length <= sentenceCount) return sentences.join(" ");

  const freq = computeWordFrequency(sentences);
  const scored = sentences.map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence, freq) }));
  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, sentenceCount);
  return top
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.sentence)
    .join(" ");
}

/**
 * AI 요약 Adapter 인터페이스(구현 없음). 실제로 연결하려면 여러분의 백엔드 서버가 API Key를
 * 보관하고, 이 어댑터는 그 서버 엔드포인트만 호출해야 한다. 절대로 브라우저 코드에 AI API Key를
 * 직접 넣지 않는다 — 클라이언트 번들에 있는 어떤 문자열도 최종 사용자가 열람/추출할 수 있다.
 */
export class AiSummarizerAdapter {
  #endpoint;

  constructor({ endpoint } = {}) {
    this.#endpoint = endpoint;
  }

  async summarize(_text) {
    throw new Error("AI 요약은 서버 프록시 없이 클라이언트에서 직접 호출하도록 구현하지 않았습니다. README를 참고해 백엔드를 구성하세요.");
  }
}

export async function summarizeText(text, { mode = "rule-based", sentenceCount = 3, adapter = null } = {}) {
  if (mode === "ai" && adapter) return adapter.summarize(text);
  return summarizeRuleBased(text, { sentenceCount });
}
