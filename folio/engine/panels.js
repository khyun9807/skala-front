/* ─────────────────────────────────────────────────────────────
   folio/engine/panels.js — 떠다니는 패널 3D 오빗 (Michael Gatt 공간 + Cipher 회전 링)
   페이지 패널을 수평 3D 궤도에 배치하고 스크롤 가속 + 상시 자동 회전으로 돌린다.
   → 모든 패널이 차례로 앞(front)으로 와서 크게·밝게·클릭 가능해진다(가려짐/화면이탈 해결).
   앞쪽 아크의 패널만 pointer-events를 켜 뒤에 겹친 패널의 죽은 클릭을 막는다.
   패널이 실제 <a>라 키보드 탭/포커스는 항상 가능(접근성). 호버 중엔 자동 회전을 멈춰 클릭 편의 확보.
   ───────────────────────────────────────────────────────────── */
import { onFrame, REDUCED, clamp, pointer, damp } from './core.js';

export function createPanelField({ scene, getScroll = () => 0, autoSpeed = 0.16 } = {}) {
  if (!scene) return { destroy() {} };
  const panels = [...scene.querySelectorAll('.folio-panel:not(.folio-panel--ghost)')];
  const ghosts = [...scene.querySelectorAll('.folio-panel--ghost')];
  const N = Math.max(panels.length, 1);

  // 장식 고스트: 궤도 뒤쪽 먼 배경으로 흩뿌려 밀도만 담당(클릭/간섭 없음).
  // 실제 작업 이미지가 깔리므로 예전 추상 배경(0.16)보다 조금 더 보이게 한다.
  ghosts.forEach((g) => {
    const gx = (Math.random() - 0.5) * window.innerWidth * 0.95;
    const gy = (Math.random() - 0.5) * window.innerHeight * 0.7;
    const gz = -650 - Math.random() * 560;
    g.style.transform = `translate(-50%,-50%) translate3d(${gx.toFixed(0)}px, ${gy.toFixed(0)}px, ${gz.toFixed(0)}px)`;
    g.style.opacity = '0.32';
    g.style.zIndex = '0';
    g.style.pointerEvents = 'none';
  });

  // 호버 시 자동 회전 정지(클릭 편의). 실제 <a> 위에 있을 때만.
  let hovering = false;
  scene.addEventListener('pointerover', (e) => { if (e.target.closest('.folio-panel:not(.folio-panel--ghost)')) hovering = true; });
  scene.addEventListener('pointerout', (e) => { if (e.target.closest('.folio-panel:not(.folio-panel--ghost)')) hovering = false; });

  const radius = () => Math.min(window.innerWidth * 0.36, window.innerHeight * 0.5, 300);
  let spin = 0, camX = 0, camY = 0;
  let boost = 1; // 부스트 버튼을 누르고 있는 동안 올라가는 회전 속도 배율

  function place(base, now) {
    const R = radius();
    for (let i = 0; i < N; i++) {
      const a = base + i * (Math.PI * 2 / N);
      const x = Math.sin(a) * R;
      const z = Math.cos(a) * R;               // 앞(+R)일수록 카메라에 가까워 원근으로 커짐
      const depth = (Math.cos(a) + 1) / 2;      // front=1, back=0
      // 수직 오프셋: 앞 패널은 아래로, 뒤 패널은 위로 → 궤도를 기울인 링으로 만든다.
      // 이게 없으면 정면(a=0)과 정반대(a=π) 패널이 화면상 같은 x에 겹치는데,
      // 앞 패널이 원근으로 1.7배 커서 뒤 패널을 완전히 덮어 클릭 자체가 불가능했다.
      const lift = Math.cos(a) * R * 0.34;
      const drift = REDUCED ? 0 : Math.sin(now * 0.001 + i * 1.7) * 6;
      const el = panels[i];
      el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px, ${(lift + drift).toFixed(1)}px, ${z.toFixed(1)}px)`;
      el.style.opacity = (0.32 + depth * 0.68).toFixed(3);
      el.style.zIndex = String(Math.round(depth * 100));
      // 뒤쪽 패널도 클릭 가능(사용자 요청). 겹칠 땐 z-index(depth 기반)가 높은 앞 패널이 히트테스트를 이기므로
      // 죽은 클릭이 생기지 않는다 — 예전의 depth>0.4 게이팅은 뒤쪽을 못 누르게 만들어 불편했다.
      el.style.pointerEvents = 'auto';
    }
  }

  // 모션 최소화: 정적 궤도(회전 없음, 전부 클릭 가능)
  if (REDUCED) {
    scene.style.transform = 'rotateX(8deg)';
    place(0, 0);
    return { setBoost() {}, destroy() {} };
  }

  function frame(now, dt) {
    // 상시 자동 회전(호버 중 정지). 단 부스트 중엔 호버해도 계속 — 버튼을 누른 채로 돌려보게.
    if (!hovering || boost > 1) spin += dt * autoSpeed * boost;
    const base = spin + getScroll() * 0.0011;       // 스크롤 가속
    // 마우스 틸트(살짝 위에서 내려다보는 각) — 뒤쪽 패널이 위로 보이게
    camX = damp(camX, (pointer.x - 0.5) * 10, 3, dt);
    camY = damp(camY, (pointer.y - 0.5) * 6, 3, dt);
    scene.style.transform = `rotateX(${(8 - camY).toFixed(2)}deg) rotateY(${camX.toFixed(2)}deg)`;
    place(base, now);
  }
  const stop = onFrame(frame);
  return {
    /** 회전 속도 배율. 버튼을 누르고 있는 동안 올렸다가 떼면 1로 되돌린다. */
    setBoost(v = 1) { boost = Math.max(0, Number(v) || 1); },
    destroy() { stop(); },
  };
}
