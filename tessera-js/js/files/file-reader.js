import { FileError } from "../core/errors.js";

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file, { accept = [], maxSize = DEFAULT_MAX_SIZE } = {}) {
  if (file.size > maxSize) {
    throw new FileError(`"${file.name}" 파일이 너무 큽니다(최대 ${(maxSize / 1024 / 1024).toFixed(1)}MB).`);
  }
  if (accept.length > 0) {
    const ext = `.${file.name.split(".").pop().toLowerCase()}`;
    const matchesExt = accept.some((pattern) => pattern.startsWith(".") && pattern.toLowerCase() === ext);
    const matchesMime = accept.some((pattern) => !pattern.startsWith(".") && file.type === pattern);
    if (!matchesExt && !matchesMime) {
      throw new FileError(`"${file.name}"은(는) 지원하지 않는 파일 형식입니다.`);
    }
  }
}

function readWith(file, method, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) onProgress(event.loaded / event.total);
    };
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new FileError(`"${file.name}" 파일을 읽지 못했습니다.`, { cause: reader.error }));
    reader[method](file);
  });
}

export function readAsText(file, options) {
  return readWith(file, "readAsText", options);
}

export function readAsDataURL(file, options) {
  return readWith(file, "readAsDataURL", options);
}

export async function readAsJSON(file, options) {
  validateFile(file, { accept: [".json", "application/json"], ...options });
  const text = await readAsText(file, options);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new FileError(`"${file.name}"은(는) 올바른 JSON 파일이 아닙니다.`, { cause: error });
  }
}

/** 여러 파일을 병렬로 읽는다. 하나가 실패해도 나머지는 계속 읽고 개별 결과에 error를 담아 반환한다 */
export async function readMultiple(files, readFn) {
  return Promise.all(
    Array.from(files).map(async (file) => {
      try {
        const result = await readFn(file);
        return { file, result, error: null };
      } catch (error) {
        return { file, result: null, error };
      }
    })
  );
}

/** createObjectURL로 만든 이미지 미리보기 URL을 쓰고 나면 반드시 이 함수로 해제한다(메모리 누수 방지) */
export function revokeObjectURL(url) {
  if (url) URL.revokeObjectURL(url);
}
