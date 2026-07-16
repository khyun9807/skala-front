import { FileError } from "../core/errors.js";

/** File/Blob을 <img>로 로드한다. Object URL은 로드 완료 즉시 해제한다(메모리 누수 방지) */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new FileError(`"${file.name}"을(를) 이미지로 열 수 없습니다.`));
    };
    img.src = url;
  });
}

function drawToCanvas(img, targetWidth, targetHeight, rotationDeg = 0) {
  const canvas = document.createElement("canvas");
  const rotated = rotationDeg % 180 !== 0;
  canvas.width = rotated ? targetHeight : targetWidth;
  canvas.height = rotated ? targetWidth : targetHeight;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
  ctx.restore();
  return canvas;
}

/** 비율을 유지하며 maxWidth/maxHeight 안에 들어가도록 리사이즈한 canvas를 반환 */
export function resizeImage(img, { maxWidth = 800, maxHeight = 800, rotationDeg = 0 } = {}) {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);
  return drawToCanvas(img, width, height, rotationDeg);
}

export function createThumbnail(img, size = 96) {
  const ratio = Math.max(size / img.width, size / img.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const w = img.width * ratio;
  const h = img.height * ratio;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}

export function canvasToBlob(canvas, type = "image/jpeg", quality = 0.85) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new FileError("이미지 변환에 실패했습니다."))), type, quality);
  });
}

export function canvasToDataURL(canvas, type = "image/png", quality = 0.92) {
  return canvas.toDataURL(type, quality);
}
