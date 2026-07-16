/* ─────────────────────────────────────────────────────────────
   folio/engine/panels-webgl.js — raw WebGL2 "우주" 배경 (Michael Gatt 부록 A)
   외부 라이브러리 0 — 4×4 행렬·GLSL 셰이더·인스턴싱을 손으로 작성.
   패널 필드 뒤에 장식으로만 깔린다(pointer-events:none, aria-hidden) — 클릭/내비/
   접근성은 앞의 DOM 오빗(.folio-panel <a>)과 텍스트 인덱스가 담당(하이브리드).
   텍스처를 쓰지 않고 프래그먼트에서 절차적 그라디언트를 생성 → 에셋/텍스처 복잡도 제거.
   WebGL2 미지원이면 조용히 비활성(폴백 = 기존 CSS-3D 고스트/오빗).
   ───────────────────────────────────────────────────────────── */
import { onFrame, REDUCED, DPR, clamp, pointer } from './core.js';

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec2  aPos;      // 유닛 quad 코너 (-0.5..0.5)
layout(location=1) in vec3  aOffset;   // 인스턴스 기준 위치 (z ∈ [0,uDepth))
layout(location=2) in float aScale;
layout(location=3) in float aRot;      // 원통 안쪽 향하는 yaw
layout(location=4) in float aPhase;
layout(location=5) in float aHue;
uniform mat4  uProj;
uniform float uScroll, uDepth, uTime, uIntro;
uniform vec2  uMouse;
out vec2  vUv;
out float vFade;
out float vHue;
void main() {
  // 상시 부유(살아있음)
  vec3 drift = vec3(sin(uTime*0.5 + aPhase), cos(uTime*0.4 + aPhase*1.3), 0.0) * 0.25;
  // 로컬 코너: 크기 → 원통 안쪽으로 yaw 회전
  vec3 local = vec3(aPos * aScale, 0.0);
  float c = cos(aRot), s = sin(aRot);
  local = vec3(c*local.x + s*local.z, local.y, -s*local.x + c*local.z);
  // 무한 z-루프: 스크롤로 카메라(0)를 향해 다가오고 넘으면 되감김
  float z = -uDepth + mod(aOffset.z + uScroll, uDepth);
  vec3 center = vec3(aOffset.xy, z) + drift;
  center.z -= (1.0 - uIntro) * uDepth * 0.4;   // 인트로: 더 멀리서 모여듦
  center.xy += uMouse * -0.55;                 // 카메라 시차(마우스)
  vec4 viewPos = vec4(center + local, 1.0);
  gl_Position = uProj * viewPos;
  vUv = aPos + 0.5;
  vHue = aHue;
  // 거리 기반 near/far 페이드 (대기 원근 + 팝핑 방지)
  float dist = -z;
  float nearFade = smoothstep(0.4, 4.0, dist);
  float farFade  = 1.0 - smoothstep(uDepth*0.5, uDepth*0.95, dist);
  vFade = nearFade * farFade * uIntro;
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; in float vFade; in float vHue;
out vec4 frag;
vec3 hue2rgb(float h){
  h = fract(h);
  return clamp(abs(mod(h*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}
void main() {
  // 절차적 릴 — 채도를 크게 낮춰 사이트의 웜 모노크롬 톤에 가라앉힘
  float g = clamp((vUv.x + vUv.y) * 0.5, 0.0, 1.0);
  vec3 tint = mix(vec3(0.5), hue2rgb(vHue), 0.14);   // 거의 무채색 + 미세 색조만
  float lum = mix(0.24, 0.48, g);                     // 어두운 밝기 그라디언트
  vec3 col = tint * lum * 2.0;                         // ≈ 0.24..0.48 회색조
  col *= vec3(1.05, 1.0, 0.9);                         // 웜 바이어스(오프화이트 쪽)
  // 동심원 결(릴 느낌) — 대비 낮춤
  float r = length(vUv - 0.5);
  col += 0.03 * sin(r * 40.0);
  // 프레임 안쪽 비네트(사진 액자)
  vec2 d = abs(vUv - 0.5);
  float vig = smoothstep(0.5, 0.33, max(d.x, d.y));
  col *= (0.82 + 0.18 * vig);
  // 검정으로 페이드(불투명 렌더 → 정렬 불필요, A.12)
  frag = vec4(col * vFade, 1.0);
}`;

function perspective(out, fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
  out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
  return out;
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[folio webgl] shader compile:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

export function createPanelUniverse({ canvas, host, count = 72, depth = 26 } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, depth: true });
  if (!gl) return { supported: false, destroy() {} };

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return { supported: false, destroy() {} };
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('[folio webgl] link:', gl.getProgramInfoLog(prog));
    return { supported: false, destroy() {} };
  }

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // 유닛 quad (TRIANGLE_STRIP)
  const quad = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]);
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // 인스턴스 데이터: [x,y,z, scale, rot, phase, hue] (중앙 통로 확보 = DOM 오빗이 가려지지 않게)
  const STRIDE = 7;
  const inst = new Float32Array(count * STRIDE);
  const R = 13, Rmin = 5.5;
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = Rmin + Math.random() * (R - Rmin);
    const o = i * STRIDE;
    inst[o] = Math.cos(theta) * r;
    inst[o + 1] = (Math.random() - 0.5) * R * 1.1;
    inst[o + 2] = Math.random() * depth;
    inst[o + 3] = 1.4 + Math.random() * 1.6;         // scale
    inst[o + 4] = theta + Math.PI;                    // 안쪽 향하는 yaw
    inst[o + 5] = Math.random() * Math.PI * 2;        // phase
    inst[o + 6] = Math.random();                      // hue
  }
  const instBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
  const bytes = STRIDE * 4;
  const setup = (loc, size, offset) => {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, bytes, offset);
    gl.vertexAttribDivisor(loc, 1);
  };
  setup(1, 3, 0); setup(2, 1, 12); setup(3, 1, 16); setup(4, 1, 20); setup(5, 1, 24);
  gl.bindVertexArray(null);

  gl.useProgram(prog);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uProj = U('uProj'), uScroll = U('uScroll'), uDepth = U('uDepth'),
        uTime = U('uTime'), uIntro = U('uIntro'), uMouse = U('uMouse');
  gl.uniform1f(uDepth, depth);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 1);

  const proj = new Float32Array(16);
  let W = 1, H = 1;
  function resize() {
    const rect = host.getBoundingClientRect();
    const dpr = DPR();
    W = Math.max(1, Math.floor(rect.width * dpr));
    H = Math.max(1, Math.floor(rect.height * dpr));
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
    perspective(proj, (55 * Math.PI) / 180, W / H, 0.1, depth * 1.15);
  }
  resize();
  addEventListener('resize', resize);

  function render(now, intro, scroll) {
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.uniformMatrix4fv(uProj, false, proj);
    gl.uniform1f(uTime, now * 0.001);
    gl.uniform1f(uIntro, intro);
    gl.uniform1f(uScroll, scroll);
    gl.uniform2f(uMouse, (pointer.x - 0.5) * 2, -(pointer.y - 0.5) * 2);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    gl.bindVertexArray(null);
  }

  // 모션 최소화: 정적 한 프레임(우주는 멈춰 있지만 존재)
  if (REDUCED) {
    render(0, 1, depth * 0.2);
    return { supported: true, destroy() { removeEventListener('resize', resize); } };
  }

  const stop = onFrame((now) => {
    const rect = host.getBoundingClientRect();
    const vh = innerHeight;
    const center = rect.top + rect.height / 2;
    const vis = clamp(1 - Math.abs(center - vh / 2) / (vh * 0.95), 0, 1); // 섹션이 화면 중앙일수록 1
    if (vis < 0.01) { gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); return; } // 멀면 렌더 스킵(성능)
    const prog01 = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const scroll = now * 0.001 * 3.2 + prog01 * depth * 2.4; // idle 전진 + 스크롤 가속
    render(now, vis, scroll);
  });

  return { supported: true, destroy() { stop(); removeEventListener('resize', resize); } };
}
