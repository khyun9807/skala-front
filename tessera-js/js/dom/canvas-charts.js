import { observeResize } from "./observers.js";
import { CHART_COLORS } from "../config/constants.js";

/**
 * 차트 라이브러리 없이 Canvas 2D만으로 만든 작은 차트 엔진.
 * type: "bar" | "line" | "donut" | "radar" | "sparkline" | "heatmap"
 * 하나의 엔진을 재사용해 방문자/여행/기술스택/일정 완료율 차트를 전부 그린다.
 */
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height || canvas.height || 160);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawEmptyState(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#9aa0b4";
  ctx.font = "13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("표시할 데이터가 없습니다", width / 2, height / 2);
}

function drawBar(ctx, width, height, { labels, values, colors }) {
  const max = Math.max(1, ...values);
  const padding = 24;
  const barGap = 10;
  const barWidth = (width - padding * 2) / values.length - barGap;
  ctx.font = "11px system-ui, sans-serif";
  // 라벨이 막대 폭보다 넓으면 가로로 그릴 때 서로 겹친다 → 45° 기울이고 아래 라벨 공간을 확보한다.
  // (라벨이 충분히 짧으면 기존과 동일하게 가로로 그린다)
  const needsRotate = labels.some((l) => ctx.measureText(String(l ?? "")).width > barWidth);
  const labelSpace = needsRotate ? 52 : 0;
  const baseline = height - padding - labelSpace;
  values.forEach((value, i) => {
    const barHeight = ((baseline - padding) * value) / max;
    const x = padding + i * (barWidth + barGap);
    const y = baseline - barHeight;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#5a5f73";
    ctx.font = "11px system-ui, sans-serif";
    const label = String(labels[i] ?? "");
    if (needsRotate) {
      ctx.save();
      ctx.translate(x + barWidth / 2 + 4, baseline + 8);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "right";
      ctx.fillText(label, 0, 0);
      ctx.restore();
    } else {
      ctx.textAlign = "center";
      ctx.fillText(label, x + barWidth / 2, baseline + 14);
    }
  });
}

function drawLine(ctx, width, height, { values, color }) {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const padding = 20;
  const stepX = (width - padding * 2) / Math.max(1, values.length - 1);
  ctx.beginPath();
  values.forEach((value, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  values.forEach((value, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
}

function drawSparkline(ctx, width, height, { values, color }) {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const stepX = width / Math.max(1, values.length - 1);
  ctx.beginPath();
  values.forEach((value, i) => {
    const x = i * stepX;
    const y = height - ((value - min) / (max - min || 1)) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawDonut(ctx, width, height, { labels, values, colors }) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 8;
  const innerRadius = outerRadius * 0.6;
  let start = -Math.PI / 2;
  values.forEach((value, i) => {
    const angle = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, start, start + angle);
    ctx.arc(cx, cy, innerRadius, start + angle, start, true);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += angle;
  });
  ctx.fillStyle = "#5a5f73";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${labels.length}개`, cx, cy);
}

function drawRadar(ctx, width, height, { labels, values, color }) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 24;
  const max = Math.max(1, ...values);
  const step = (Math.PI * 2) / values.length;

  ctx.strokeStyle = "#dde1f0";
  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    for (let i = 0; i <= values.length; i += 1) {
      const angle = i * step - Math.PI / 2;
      const r = (radius * ring) / 4;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.beginPath();
  values.forEach((value, i) => {
    const angle = i * step - Math.PI / 2;
    const r = (radius * value) / max;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = `${color}55`;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.fillStyle = "#5a5f73";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "center";
  labels.forEach((label, i) => {
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * (radius + 14);
    const y = cy + Math.sin(angle) * (radius + 14);
    ctx.fillText(label, x, y);
  });
}

function drawHeatmap(ctx, width, height, { matrix, colors }) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  if (!rows || !cols) return;
  const max = Math.max(1, ...matrix.flat());
  const cellW = width / cols;
  const cellH = height / rows;
  const [low, high] = colors;
  matrix.forEach((row, r) => {
    row.forEach((value, c) => {
      const ratio = value / max;
      ctx.fillStyle = mixColor(low, high, ratio);
      ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
    });
  });
}

function mixColor(hexA, hexB, ratio) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * ratio);
  const g = Math.round(a.g + (b.g - a.g) * ratio);
  const bl = Math.round(a.b + (b.b - a.b) * ratio);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const int = parseInt(clean, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function createChart(canvas, config) {
  let current = config;
  let resizeObserver = null;

  canvas.setAttribute("role", "img");

  function updateAltText() {
    const { type, labels = [], values = [] } = current;
    canvas.setAttribute("aria-label", `${type} 차트: ${labels.map((l, i) => `${l} ${values[i] ?? ""}`).join(", ")}`);
  }

  function render() {
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    const isEmpty = !current.values?.length && !current.matrix?.length;
    if (isEmpty) {
      drawEmptyState(ctx, width, height);
      return;
    }
    const colors = current.colors ?? CHART_COLORS;
    switch (current.type) {
      case "bar":
        drawBar(ctx, width, height, { ...current, colors });
        break;
      case "line":
        drawLine(ctx, width, height, { values: current.values, color: colors[0] });
        break;
      case "sparkline":
        drawSparkline(ctx, width, height, { values: current.values, color: colors[0] });
        break;
      case "donut":
        drawDonut(ctx, width, height, { ...current, colors });
        break;
      case "radar":
        drawRadar(ctx, width, height, { ...current, color: colors[0] });
        break;
      case "heatmap":
        drawHeatmap(ctx, width, height, { matrix: current.matrix, colors: current.colors ?? ["#eef0f9", "#4f6bed"] });
        break;
      default:
        drawEmptyState(ctx, width, height);
    }
    updateAltText();
  }

  resizeObserver = observeResize(canvas, () => render());
  render();

  return {
    update(nextConfig) {
      current = { ...current, ...nextConfig };
      render();
    },
    destroy() {
      resizeObserver?.disconnect();
    },
    exportPNG(filename = "chart.png") {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = filename;
      link.click();
    },
  };
}

/** 캔버스 옆에 붙일 접근성 있는 범례 목록(DOM으로 렌더 — 캔버스 안에 텍스트로만 넣지 않음) */
export function renderLegend(root, labels, colors = CHART_COLORS) {
  root.textContent = "";
  const list = document.createElement("ul");
  list.className = "row";
  list.setAttribute("aria-hidden", "false");
  labels.forEach((label, i) => {
    const item = document.createElement("li");
    item.className = "row";
    item.style.gap = "4px";
    const swatch = document.createElement("span");
    swatch.style.cssText = `display:inline-block;width:10px;height:10px;border-radius:2px;background:${colors[i % colors.length]}`;
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(label));
    list.appendChild(item);
  });
  root.appendChild(list);
}
