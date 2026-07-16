import { FileError } from "../core/errors.js";

export function parseJSON(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (error) {
    if (fallback !== null) return fallback;
    throw new FileError("JSON 파싱에 실패했습니다.", { cause: error });
  }
}

export function stringifyJSON(value, pretty = true) {
  return JSON.stringify(value, null, pretty ? 2 : undefined);
}
