/* ─────────────────────────────────────────────────────────────
   folio/engine/audio.js — 배경음 + 오디오 이퀄라이저 비주얼 (Michael Gatt §7.7)
   Web Audio AnalyserNode로 주파수 대역별 진폭을 읽어 DOM 막대 scaleY를 구동.
   브라우저 자동재생 정책상 반드시 사용자 제스처(로더 게이트) 안에서 unlock().
   ───────────────────────────────────────────────────────────── */
import { onFrame } from './core.js';

export function createAudio({ src, bars = [], muteToggle } = {}) {
  let actx = null, analyser = null, srcNode = null, audioEl = null, bins = null, stop = null;
  let ready = false, playing = false;

  function syncToggle() {
    if (!muteToggle) return;
    muteToggle.setAttribute('aria-pressed', String(playing));
    muteToggle.dataset.state = playing ? 'on' : 'off';
    muteToggle.textContent = playing ? '♪ sound on' : '♪ sound off';
  }

  function drawEQ() {
    if (!analyser) return;
    analyser.getByteFrequencyData(bins);
    for (let i = 0; i < bars.length; i++) {
      const v = (bins[i] ?? 0) / 255;
      bars[i].style.transform = `scaleY(${(0.08 + v * 0.92).toFixed(3)})`;
    }
  }

  /** 유저 제스처 안에서 호출 — AudioContext 생성/resume + 노드 그래프 구성 */
  function unlock(withSound) {
    if (ready) { if (withSound) play(); return; }
    ready = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = new AC();
      audioEl = new Audio(src);
      audioEl.loop = true;
      audioEl.preload = 'auto';
      srcNode = actx.createMediaElementSource(audioEl);
      analyser = actx.createAnalyser();
      analyser.fftSize = 64; // frequencyBinCount = 32
      srcNode.connect(analyser);
      analyser.connect(actx.destination);
      bins = new Uint8Array(analyser.frequencyBinCount);
      actx.resume();
      stop = onFrame(drawEQ);
      if (withSound) play();
      else syncToggle();
    } catch (err) {
      console.warn('[folio audio] unlock 실패', err);
    }
  }

  function play() {
    actx?.resume?.();
    audioEl?.play().then(() => { playing = true; syncToggle(); }).catch(() => { playing = false; syncToggle(); });
  }
  function pause() { audioEl?.pause(); playing = false; syncToggle(); }
  function toggle() {
    if (!ready) { unlock(true); return; }
    if (playing) pause(); else play();
  }

  muteToggle?.addEventListener('click', toggle);

  return {
    unlock, toggle, play, pause,
    get playing() { return playing; },
    destroy() { stop?.(); audioEl?.pause(); actx?.close?.(); },
  };
}
