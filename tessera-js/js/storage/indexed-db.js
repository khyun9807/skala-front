import { DB_NAME, DB_VERSION, OBJECT_STORES } from "../config/constants.js";
import { StorageError } from "../core/errors.js";
import { logger } from "../core/logger.js";

let dbPromise = null;

function openDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new StorageError("이 브라우저는 IndexedDB를 지원하지 않습니다.", { recoverable: false }));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        const blogStore = db.createObjectStore(OBJECT_STORES.BLOG_POSTS, { keyPath: "id" });
        blogStore.createIndex("by_tag", "tags", { multiEntry: true });
        blogStore.createIndex("by_updatedAt", "updatedAt");

        const commentStore = db.createObjectStore(OBJECT_STORES.COMMENTS, { keyPath: "id" });
        commentStore.createIndex("by_postId", "postId");
        commentStore.createIndex("by_createdAt", "createdAt");

        const travelStore = db.createObjectStore(OBJECT_STORES.TRAVELS, { keyPath: "id" });
        travelStore.createIndex("by_startDate", "startDate");

        const scheduleStore = db.createObjectStore(OBJECT_STORES.SCHEDULES, { keyPath: "id" });
        scheduleStore.createIndex("by_startDate", "startDate");
        scheduleStore.createIndex("by_kind", "kind");

        const visitorStore = db.createObjectStore(OBJECT_STORES.VISITOR_EVENTS, { keyPath: "id", autoIncrement: true });
        visitorStore.createIndex("by_timestamp", "timestamp");

        db.createObjectStore(OBJECT_STORES.IMAGE_META, { keyPath: "id" });
        db.createObjectStore(OBJECT_STORES.FILE_BACKUPS, { keyPath: "id" });
      }
      // 스키마가 바뀌면 여기에 `if (oldVersion < 2) { ... }` 블록을 추가해 마이그레이션한다.
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new StorageError("IndexedDB를 열지 못했습니다.", { cause: request.error }));
    request.onblocked = () => logger.warn("indexed-db", "database open blocked by another tab/connection");
  });
  return dbPromise;
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(storeName, mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;

    Promise.resolve()
      .then(() => callback(store))
      .then((value) => {
        result = value;
      })
      .catch((error) => {
        try {
          tx.abort();
        } catch {
          /* 이미 종료된 트랜잭션이면 abort가 예외를 던질 수 있으므로 무시 */
        }
        reject(new StorageError(`transaction on "${storeName}" failed`, { cause: error }));
      });

    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(new StorageError(`transaction on "${storeName}" failed`, { cause: tx.error }));
    tx.onabort = () => reject(new StorageError(`transaction on "${storeName}" was rolled back`, { cause: tx.error }));
  });
}

export const indexedDb = {
  async put(storeName, value) {
    return withStore(storeName, "readwrite", (store) => promisifyRequest(store.put(value)));
  },

  async bulkPut(storeName, values) {
    return withStore(storeName, "readwrite", async (store) => {
      for (const value of values) store.put(value);
      return values.length;
    });
  },

  async get(storeName, key) {
    return withStore(storeName, "readonly", (store) => promisifyRequest(store.get(key)));
  },

  async getAll(storeName) {
    return withStore(storeName, "readonly", (store) => promisifyRequest(store.getAll()));
  },

  async getAllByIndex(storeName, indexName, query) {
    return withStore(storeName, "readonly", (store) => promisifyRequest(store.index(indexName).getAll(query)));
  },

  async delete(storeName, key) {
    return withStore(storeName, "readwrite", (store) => promisifyRequest(store.delete(key)));
  },

  async clear(storeName) {
    return withStore(storeName, "readwrite", (store) => promisifyRequest(store.clear()));
  },

  async count(storeName) {
    return withStore(storeName, "readonly", (store) => promisifyRequest(store.count()));
  },

  /** cursor로 순회하며 predicate에 맞는 값만 모아서 반환한다(대량 데이터 필터링용) */
  async iterate(storeName, predicate = () => true) {
    return withStore(
      storeName,
      "readonly",
      (store) =>
        new Promise((resolve, reject) => {
          const request = store.openCursor();
          const results = [];
          request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
              if (predicate(cursor.value)) results.push(cursor.value);
              cursor.continue();
            } else {
              resolve(results);
            }
          };
          request.onerror = () => reject(request.error);
        })
    );
  },
};

export function isIndexedDbSupported() {
  return "indexedDB" in window;
}
