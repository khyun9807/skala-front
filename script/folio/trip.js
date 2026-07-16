/* ─────────────────────────────────────────────────────────────
   script/folio/trip.js — trip.html 배선
   요구된 사진첩/오디오/비디오는 그대로 두고, 3개 여행지와 일치하는
   tessera-js/data/travel-posts.json 시드로 "여행 계획/예산" 카드를 만든다.
   (참조: script/v4/myTrip.js — Canvas 도넛은 append 이후 그려야 함)
   ───────────────────────────────────────────────────────────── */
import './toast.js';
import { initPage } from './page.js';
import { showToast } from '../../tessera-js/js/features/notifications.js';
import { apiClient } from '../../tessera-js/js/network/api-client.js';
import * as travel from '../../tessera-js/js/features/travel.js';
import { createChart } from '../../tessera-js/js/dom/canvas-charts.js';
import { getCurrentWeatherByCity, getWeatherWarning } from '../../tessera-js/js/services/weather-service.js';
import { convertCurrency } from '../../tessera-js/js/services/exchange-service.js';
import { formatDate } from '../../tessera-js/js/utils/date.js';

initPage();

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

function phaseLabel(p) {
  if (p.phase === 'upcoming') return `여행까지 D-${p.remaining.days}`;
  if (p.phase === 'ongoing') return `여행 ${p.elapsed.days}일째 진행 중`;
  return '여행 완료';
}

function renderCard(trip, container) {
  const clone = document.getElementById('trip-card-template').content.cloneNode(true);
  const article = clone.querySelector('article');
  article.querySelector('.trip-title').textContent = trip.title;
  article.querySelector('.trip-meta').textContent = `${formatDate(trip.startDate)} ~ ${formatDate(trip.endDate)} · ${(trip.cities ?? []).join(', ')}`;
  article.querySelector('.trip-progress').textContent = phaseLabel(travel.computeProgress(trip));

  const summary = travel.computeBudgetSummary(trip, trip.budgetLimit);
  const canvas = article.querySelector('.trip-chart');

  const checklist = article.querySelector('.trip-checklist');
  (trip.checklist ?? []).forEach((item) => {
    const li = document.createElement('li');
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = item.done;
    cb.addEventListener('change', () => travel.toggleChecklistItem(trip.id, item.id));
    const label = document.createElement('label'); label.append(cb, document.createTextNode(` ${item.label}`));
    li.appendChild(label); checklist.appendChild(li);
  });

  const wBtn = article.querySelector('.trip-weather-btn');
  const wOut = article.querySelector('.trip-weather-result');
  wBtn.addEventListener('click', async () => {
    wBtn.disabled = true; wOut.textContent = '불러오는 중…';
    try {
      const city = trip.cities?.[0] ?? 'Seoul';
      const [weather, ex] = await Promise.all([getCurrentWeatherByCity(city), convertCurrency(1, 'USD', trip.baseCurrency ?? 'KRW')]);
      const warn = getWeatherWarning(weather.data);
      wOut.textContent = '';
      const l1 = document.createElement('p'); l1.textContent = `${city}: ${Math.round(weather.data.temperature)}°C · ${weather.data.condition} (${weather.provider})`;
      const l2 = document.createElement('p'); l2.textContent = `1 USD = ${Math.round(ex.rate).toLocaleString()} ${trip.baseCurrency ?? 'KRW'} (${ex.provider})`;
      wOut.append(l1, l2);
      if (warn) { const w = document.createElement('p'); w.className = 'folio-badge folio-badge--warning'; w.textContent = warn; wOut.appendChild(w); }
    } catch { wOut.textContent = '정보를 가져오지 못했습니다.'; }
    finally { wBtn.disabled = false; }
  });

  const sBtn = article.querySelector('.trip-share-btn');
  const sOut = article.querySelector('.trip-share-output');
  sBtn.addEventListener('click', () => { sOut.value = travel.generateShareText(trip); sOut.hidden = false; });

  article.querySelector('.trip-backup-btn').addEventListener('click', () => {
    travel.exportTravelJSON(trip);
    showToast(`"${trip.title}" 여행 데이터를 JSON으로 내보냈습니다.`, { type: 'success' });
  });

  // <template> 클론은 DOM에 붙기 전 레이아웃이 0 → 도넛 반지름 음수 오류. 반드시 append 이후 그린다.
  container.appendChild(clone);
  createChart(canvas, { type: 'donut', labels: Object.keys(summary.categoryTotals), values: Object.values(summary.categoryTotals) });
}

(async function init() {
  await travel.seedTravelsIfEmpty(() => fetchJSON('../tessera-js/data/travel-posts.json'));
  const trips = (await travel.getAllTravels()).slice().sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const container = document.getElementById('trip-cards');
  container.textContent = '';
  trips.forEach((trip) => renderCard(trip, container));
})();
