import { downloadJSON } from "./file-exporter.js";
import { readAsJSON } from "./file-reader.js";
import { FileError } from "../core/errors.js";

/**
 * 일정/블로그/여행/방문자 데이터 백업·복원에 쓰는 공용 헬퍼.
 * 백업 파일에는 항상 { schemaName, version, exportedAt, items } 봉투를 씌운다.
 */
export function exportBackup(schemaName, items, version = 1) {
  const payload = { schemaName, version, exportedAt: new Date().toISOString(), items };
  downloadJSON(payload, schemaName);
  return payload;
}

export async function importBackupFile(file, expectedSchemaName) {
  const payload = await readAsJSON(file);
  if (!payload || !Array.isArray(payload.items)) {
    throw new FileError("백업 파일 형식이 올바르지 않습니다(items 배열이 없습니다).");
  }
  if (expectedSchemaName && payload.schemaName !== expectedSchemaName) {
    throw new FileError(`"${expectedSchemaName}" 백업 파일이 아닙니다(받은 schemaName: ${payload.schemaName}).`);
  }
  return payload;
}
