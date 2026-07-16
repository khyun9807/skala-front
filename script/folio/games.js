/* ─────────────────────────────────────────────────────────────
   script/folio/games.js — JS 기초 실습 3종 (upDown / grade / bag)
   사용자 결정: "둘 다" — 기본은 몰입형 인-월드 UI, 토글로 원문 prompt/alert 폴백.
   요구된 알고리즘(랜덤 1~50 맞추기 / for 총점·평균 / 배열 순회)은 두 모드 모두 동일.
   원문 prompt/alert 로직은 script/{upDown,grade,bag}.js 와 동작이 일치한다.

   기대 마크업: [data-games] 컨테이너 안에
     [data-game="updown|grade|bag"] 버튼들, [data-game-toggle], [data-games-stage]
   ───────────────────────────────────────────────────────────── */

/* ── 공통: 인-월드 스테이지 렌더 ── */
function panel(title, inner) {
  return `<div class="folio-mini"><p class="folio-mini__title">${title}</p>${inner}</div>`;
}

/* ── Up-Down (인-월드) ── */
function upDownWorld(stage) {
  const answer = Math.floor(Math.random() * 50) + 1; // 요구: Math.floor(Math.random()*50)+1
  let tries = 0;
  stage.innerHTML = panel('UP · DOWN — 1~50',
    `<form class="folio-mini__row" data-f><input type="number" min="1" max="50" placeholder="숫자 입력" data-in><button class="folio-mini__go" type="submit">guess</button></form>
     <p class="folio-mini__feed" data-feed>1부터 50 사이의 숫자를 맞춰보세요.</p>`);
  const form = stage.querySelector('[data-f]');
  const input = stage.querySelector('[data-in]');
  const feed = stage.querySelector('[data-feed]');
  input.focus();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    const guess = Number(raw);
    if (raw === '' || Number.isNaN(guess) || guess < 1 || guess > 50) {
      feed.textContent = '1부터 50 사이의 숫자를 입력해 주세요.';
      return;
    }
    tries++;
    if (guess > answer) feed.textContent = `Down! ⬇️ 더 작은 숫자예요. (시도 ${tries}회)`;
    else if (guess < answer) feed.textContent = `Up! ⬆️ 더 큰 숫자예요. (시도 ${tries}회)`;
    else {
      feed.textContent = `정답! 🎉 ${tries}번 만에 맞추셨습니다.`;
      input.disabled = true;
      return;
    }
    input.value = '';
    input.focus();
  });
}

/* ── 성적 계산기 (인-월드) ── */
function gradeWorld(stage) {
  const subjects = ['HTML', 'CSS', 'JavaScript']; // 요구 배열
  stage.innerHTML = panel('GRADE',
    subjects.map((s) => `<label class="folio-mini__row"><span>${s}</span><input type="number" min="0" max="100" placeholder="0~100" data-subj></label>`).join('') +
    `<button class="folio-mini__go" type="button" data-go>calculate</button><p class="folio-mini__feed" data-feed></p>`);
  const inputs = [...stage.querySelectorAll('[data-subj]')];
  const feed = stage.querySelector('[data-feed]');
  stage.querySelector('[data-go]').addEventListener('click', () => {
    let total = 0; // 요구: var total = 0; for문 합산
    for (let i = 0; i < subjects.length; i++) {
      const v = Number(inputs[i].value);
      if (inputs[i].value.trim() === '' || Number.isNaN(v) || v < 0 || v > 100) {
        feed.textContent = `${subjects[i]} 점수를 0~100 사이로 입력하세요.`;
        return;
      }
      total += v;
    }
    const average = total / subjects.length;
    const averageText = Number.isInteger(average) ? average : average.toFixed(1);
    const result = average >= 60 ? '합격입니다! 🎉' : '불합격입니다. 😢';
    feed.textContent = `총점 ${total}점 · 평균 ${averageText}점 · ${result}`;
  });
}

/* ── 내 가방 보기 (인-월드) ── */
function bagWorld(stage) {
  const myBag = [
    { name: '노트북', count: 1 }, { name: '충전기', count: 2 }, { name: '텀블러', count: 1 },
    { name: '볼펜', count: 3 }, { name: '이어폰', count: 1 },
  ];
  let items = '';
  for (let i = 0; i < myBag.length; i++) items += `<li>${i + 1}. ${myBag[i].name} — ${myBag[i].count}개</li>`;
  stage.innerHTML = panel('🎒 MY BAG', `<ul class="folio-mini__list">${items}</ul>`);
}

/* ── 원문 prompt/alert 폴백 (script/{upDown,grade,bag}.js 와 동작 일치) ── */
function upDownClassic() {
  const computerNum = Math.floor(Math.random() * 50) + 1;
  let tryCount = 0, cleared = false;
  while (true) {
    const input = prompt('1부터 50 사이의 숫자를 맞춰보세요! (취소하면 게임 종료)');
    if (input === null) break;
    const guess = Number(input);
    if (input.trim() === '' || Number.isNaN(guess) || guess < 1 || guess > 50) { alert('1부터 50 사이의 숫자를 입력해 주세요.'); continue; }
    tryCount++;
    if (guess > computerNum) alert('Down! ⬇️ 더 작은 숫자예요.');
    else if (guess < computerNum) alert('Up! ⬆️ 더 큰 숫자예요.');
    else { alert('정답! 🎉 축하합니다! ' + tryCount + '번 만에 맞추셨습니다.'); cleared = true; break; }
  }
  if (!cleared) alert('게임을 종료했어요. 정답은 ' + computerNum + '이었습니다!');
}
function gradeClassic() {
  const subjects = ['HTML', 'CSS', 'JavaScript'];
  let total = 0;
  for (let i = 0; i < subjects.length; i++) {
    let input = prompt(subjects[i] + ' 점수를 입력하세요. (0~100)');
    if (input === null) { alert('성적 계산을 취소했습니다.'); return; }
    let score = Number(input);
    while (input.trim() === '' || Number.isNaN(score) || score < 0 || score > 100) {
      input = prompt('0부터 100 사이의 숫자로 ' + subjects[i] + ' 점수를 다시 입력하세요.');
      if (input === null) { alert('성적 계산을 취소했습니다.'); return; }
      score = Number(input);
    }
    total += score;
  }
  const average = total / subjects.length;
  const averageText = Number.isInteger(average) ? average : average.toFixed(1);
  const result = average >= 60 ? '합격입니다! 🎉' : '불합격입니다. 😢';
  alert('총점: ' + total + '점\n평균: ' + averageText + '점\n결과: ' + result);
}
function bagClassic() {
  const myBag = [
    { name: '노트북', count: 1 }, { name: '충전기', count: 2 }, { name: '텀블러', count: 1 },
    { name: '볼펜', count: 3 }, { name: '이어폰', count: 1 },
  ];
  let message = '🎒 내 가방 속 소지품 목록\n\n';
  for (let i = 0; i < myBag.length; i++) message += (i + 1) + '. ' + myBag[i].name + ' - ' + myBag[i].count + '개\n';
  alert(message);
}

const WORLD = { updown: upDownWorld, grade: gradeWorld, bag: bagWorld };
const CLASSIC = { updown: upDownClassic, grade: gradeClassic, bag: bagClassic };

export function initGames({ root } = {}) {
  if (!root) return;
  const stage = root.querySelector('[data-games-stage]');
  const toggle = root.querySelector('[data-game-toggle]');
  let mode = 'world'; // 'world' | 'classic'

  function syncToggle() {
    if (!toggle) return;
    toggle.textContent = mode === 'world' ? 'classic mode (prompt/alert)' : 'in-world mode';
    toggle.setAttribute('aria-pressed', String(mode === 'classic'));
  }
  syncToggle();

  toggle?.addEventListener('click', () => {
    mode = mode === 'world' ? 'classic' : 'world';
    syncToggle();
    if (stage) stage.innerHTML = mode === 'classic'
      ? '<p class="folio-mini__feed">classic 모드: 버튼을 누르면 prompt/alert 창으로 진행됩니다.</p>'
      : '';
  });

  root.querySelectorAll('[data-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.game;
      if (mode === 'classic') CLASSIC[key]?.();
      else WORLD[key]?.(stage);
    });
  });
}
