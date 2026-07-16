/**
 * 시간 기반 기능 3종(스톱워치/카운트다운/뽀모도로).
 *
 * 공통 원칙: `setInterval`/`requestAnimationFrame`의 "호출 횟수"를 절대 신뢰하지 않는다.
 * 매 tick마다 `performance.now()`(스톱워치/뽀모도로) 또는 `Date.now()`(카운트다운, 절대 목표
 * 시각 기준)로 실제 경과 시간을 다시 계산한다. 이렇게 하면 탭이 백그라운드로 가서 브라우저가
 * 타이머 해상도를 늦추거나 몇 번의 tick을 건너뛰어도, 다음 tick에서 실제 경과 시간만큼
 * 정확히 보정된다(누적 오차가 생기지 않는다).
 */

export class Stopwatch {
  #startTime = 0;
  #elapsed = 0;
  #running = false;
  #rafId = null;
  #onTick;

  constructor({ onTick = () => {} } = {}) {
    this.#onTick = onTick;
  }

  #loop = () => {
    if (!this.#running) return;
    this.#elapsed = performance.now() - this.#startTime;
    this.#onTick(this.#elapsed);
    this.#rafId = requestAnimationFrame(this.#loop);
  };

  start() {
    if (this.#running) return;
    this.#running = true;
    this.#startTime = performance.now() - this.#elapsed;
    this.#loop();
  }

  pause() {
    this.#running = false;
    if (this.#rafId) cancelAnimationFrame(this.#rafId);
  }

  reset() {
    this.pause();
    this.#elapsed = 0;
  }

  get elapsedMs() {
    return this.#elapsed;
  }

  get isRunning() {
    return this.#running;
  }
}

export class Countdown {
  #targetTime;
  #intervalId = null;
  #onTick;
  #onComplete;
  #intervalMs;

  constructor(targetDate, { onTick = () => {}, onComplete = () => {}, intervalMs = 1000 } = {}) {
    this.#targetTime = new Date(targetDate).getTime();
    this.#onTick = onTick;
    this.#onComplete = onComplete;
    this.#intervalMs = intervalMs;
  }

  #tick = () => {
    const remainingMs = Math.max(0, this.#targetTime - Date.now());
    this.#onTick(remainingMs);
    if (remainingMs <= 0) {
      this.stop();
      this.#onComplete();
    }
  };

  start() {
    this.#tick();
    this.#intervalId = setInterval(this.#tick, this.#intervalMs);
  }

  stop() {
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }
}

export class PomodoroTimer {
  #phase = "work";
  #remainingMs;
  #running = false;
  #lastTick = null;
  #intervalId = null;
  #onTick;
  #onPhaseChange;

  constructor({ workMs = 25 * 60_000, breakMs = 5 * 60_000, onTick = () => {}, onPhaseChange = () => {} } = {}) {
    this.workMs = workMs;
    this.breakMs = breakMs;
    this.#remainingMs = workMs;
    this.#onTick = onTick;
    this.#onPhaseChange = onPhaseChange;
  }

  #tick = () => {
    const now = performance.now();
    const delta = now - this.#lastTick;
    this.#lastTick = now;
    this.#remainingMs = Math.max(0, this.#remainingMs - delta);
    this.#onTick(this.#remainingMs, this.#phase);
    if (this.#remainingMs <= 0) {
      this.#phase = this.#phase === "work" ? "break" : "work";
      this.#remainingMs = this.#phase === "work" ? this.workMs : this.breakMs;
      this.#onPhaseChange(this.#phase);
    }
  };

  start() {
    if (this.#running) return;
    this.#running = true;
    this.#lastTick = performance.now();
    this.#intervalId = setInterval(this.#tick, 250);
  }

  pause() {
    this.#running = false;
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  resume() {
    this.start();
  }

  reset() {
    this.pause();
    this.#phase = "work";
    this.#remainingMs = this.workMs;
  }

  get remainingMs() {
    return this.#remainingMs;
  }

  get phase() {
    return this.#phase;
  }

  get isRunning() {
    return this.#running;
  }
}
