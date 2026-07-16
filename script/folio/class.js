/* ─────────────────────────────────────────────────────────────
   script/folio/class.js — class.html 배선
   공식 rowspan/colspan 시간표(요구 보존)는 건드리지 않고, 그 아래
   "개인 일정" 섹션을 TesseraJS features/schedule.js(IndexedDB)로 구동한다.
   (참조: script/v4/myClass.js)
   ───────────────────────────────────────────────────────────── */
import './toast.js';
import { initPage } from './page.js';
import { apiClient } from '../../tessera-js/js/network/api-client.js';
import { Countdown } from '../../tessera-js/js/utils/timer.js';
import { formatDurationClock } from '../../tessera-js/js/utils/formatter.js';
import { formatTime, formatDate, addDays } from '../../tessera-js/js/utils/date.js';
import * as schedule from '../../tessera-js/js/features/schedule.js';
import { OBJECT_STORES } from '../../tessera-js/js/config/constants.js';
import { reseedIfStale } from './reseed.js';

initPage();

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

function renderList(id, items, empty, fmt) {
  const el = document.getElementById(id);
  el.textContent = '';
  if (!items.length) { const li = document.createElement('li'); li.style.opacity = '.5'; li.textContent = empty; el.appendChild(li); return; }
  items.forEach((item) => { const li = document.createElement('li'); li.textContent = fmt(item); el.appendChild(li); });
}

let countdown = null;
function initCountdown(next) {
  countdown?.stop();
  const el = document.getElementById('sched-countdown');
  if (!next) { el.textContent = '예정된 일정이 없습니다.'; return; }
  countdown = new Countdown(next.startAt, {
    onTick: (ms) => { el.textContent = `${next.title}까지 ${formatDurationClock(ms)} 남음`; },
    onComplete: () => { el.textContent = `${next.title} 시작!`; },
  });
  countdown.start();
}

async function refresh() {
  const all = await schedule.getAllSchedules();
  renderList('sched-today', schedule.getTodaySchedules(all), '오늘 일정이 없습니다.',
    (i) => `${formatTime(i.startAt)}  ${i.title}${i.completed ? ' ✅' : ''}`);
  const occ = schedule.expandAllOccurrences(all, new Date(), addDays(new Date(), 30));
  const upcoming = schedule.getUpcoming(occ, 5);
  renderList('sched-upcoming', upcoming, '다가오는 일정이 없습니다.',
    (i) => `${formatDate(i.startAt)} ${formatTime(i.startAt)} — ${i.title}`);
  renderList('sched-past', schedule.getPastSchedules(all).slice(-5), '지난 일정이 없습니다.',
    (i) => `${formatDate(i.startAt)} — ${i.title}`);
  initCountdown(upcoming[0]);
}

document.getElementById('sched-csv').addEventListener('click', async () => schedule.exportSchedulesCSV(await schedule.getAllSchedules()));
document.getElementById('sched-json').addEventListener('click', async () => schedule.exportSchedulesJSON(await schedule.getAllSchedules()));
document.getElementById('sched-ics').addEventListener('click', async () => schedule.exportSchedulesICS(await schedule.getAllSchedules()));

(async function init() {
  await reseedIfStale(OBJECT_STORES.SCHEDULES); // 시드 버전이 바뀌었으면 옛 데모 일정을 비움
  await schedule.seedSchedulesIfEmpty(() => fetchJSON('../tessera-js/data/schedules.json'));
  await refresh();
})();
