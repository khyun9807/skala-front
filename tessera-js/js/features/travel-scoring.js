const SEASON_MONTHS = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10, 11],
  winter: [12, 1, 2],
};

function monthToSeason(month) {
  return Object.entries(SEASON_MONTHS).find(([, months]) => months.includes(month))?.[0] ?? "spring";
}

/**
 * 순수 함수: 여행 후보와 사용자 선호를 비교해 0~100 점수를 매긴다.
 * DOM에 의존하지 않아 메인 스레드/Worker 어디서든 동일하게 동작한다(recommend 작업의 핵심 로직).
 */
export function computeRecommendationScore(candidate, preferences) {
  let score = 0;
  const reasons = [];

  if (preferences.budget && candidate.estimatedBudget <= preferences.budget) {
    score += 25;
    reasons.push("예산 범위 안");
  }
  if (preferences.durationDays) {
    const diff = Math.abs((candidate.durationDays ?? 0) - preferences.durationDays);
    const durationScore = Math.max(0, 20 - diff * 4);
    score += durationScore;
    if (durationScore > 10) reasons.push("여행 기간이 비슷함");
  }
  if (preferences.activities?.length) {
    const overlap = (candidate.activities ?? []).filter((activity) => preferences.activities.includes(activity));
    score += overlap.length * 10;
    if (overlap.length) reasons.push(`선호 활동 ${overlap.length}개 일치`);
  }
  if (preferences.month) {
    const season = monthToSeason(preferences.month);
    if ((candidate.bestSeasons ?? []).includes(season)) {
      score += 15;
      reasons.push(`${season} 시즌 추천지`);
    }
  }
  if (preferences.favoriteTags?.length) {
    const overlap = (candidate.tags ?? []).filter((tag) => preferences.favoriteTags.includes(tag));
    score += overlap.length * 8;
    if (overlap.length) reasons.push("즐겨찾기 태그와 일치");
  }
  if (preferences.viewedTags?.length) {
    const overlap = (candidate.tags ?? []).filter((tag) => preferences.viewedTags.includes(tag));
    score += overlap.length * 4;
  }

  return { tripId: candidate.id, score: Math.min(100, Math.round(score)), reasons };
}

export function rankRecommendations(candidates, preferences) {
  return candidates.map((candidate) => computeRecommendationScore(candidate, preferences)).sort((a, b) => b.score - a.score);
}
