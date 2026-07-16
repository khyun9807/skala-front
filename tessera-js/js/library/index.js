/**
 * TesseraJS 공개 API 배럴. 여러 파일에 흩어진 기능을 주제별 네임스페이스로 묶어 다시 내보낸다.
 * 페이지에서는 이 파일 하나만 import하면 라이브러리 전체를 쓸 수 있다.
 *
 *   import { http, storage, blog, travel } from "./js/library/index.js";
 *
 * ES Module을 지원하지 않는 상황(콘솔 실험 등)을 위해 window.Tessera 단일 전역도 함께 노출한다.
 */
import * as httpClientModule from "../network/http-client.js";
import * as apiClientModule from "../network/api-client.js";
import * as xhrClientModule from "../network/xhr-client.js";

export const http = { ...httpClientModule, ...apiClientModule, ...xhrClientModule };

import * as localStorageModule from "../storage/local-storage.js";
import * as sessionStorageModule from "../storage/session-storage.js";
import * as indexedDbModule from "../storage/indexed-db.js";
import * as cookieModule from "../storage/cookie-manager.js";
import * as cacheManagerModule from "../storage/cache-manager.js";

export const storage = { ...localStorageModule, ...sessionStorageModule, ...indexedDbModule, ...cookieModule, ...cacheManagerModule };

import * as eventBusModule from "../core/event-bus.js";
export const events = { ...eventBusModule };

import { createStore } from "../core/state-store.js";
export const state = { createStore };

import * as routerModule from "../core/router.js";
export const router = { ...routerModule };

import * as domSelector from "../dom/selector.js";
import * as domRenderer from "../dom/renderer.js";
import * as domTemplate from "../dom/template.js";
import * as domAnimation from "../dom/animation.js";
import * as domObservers from "../dom/observers.js";
import * as domA11y from "../dom/accessibility.js";
import * as domCharts from "../dom/canvas-charts.js";

export const dom = { ...domSelector, ...domRenderer, ...domTemplate, ...domAnimation, ...domObservers, ...domA11y, ...domCharts };

import * as mouseEvents from "../events/mouse.js";
import * as keyboardEvents from "../events/keyboard.js";
import * as scrollEvents from "../events/scroll.js";
import * as dragDropEvents from "../events/drag-drop.js";
import * as touchEvents from "../events/touch.js";
import * as shortcutEvents from "../events/shortcuts.js";

export const interaction = { ...mouseEvents, ...keyboardEvents, ...scrollEvents, ...dragDropEvents, ...touchEvents, ...shortcutEvents };

import * as dateUtils from "../utils/date.js";
import * as numberUtils from "../utils/number.js";
import * as stringUtils from "../utils/string.js";
import * as arrayUtils from "../utils/array.js";
import * as objectUtils from "../utils/object.js";
import * as validationUtils from "../utils/validation.js";
import { debounce } from "../utils/debounce.js";
import { throttle } from "../utils/throttle.js";
import * as timerUtils from "../utils/timer.js";
import * as formatterUtils from "../utils/formatter.js";
import * as securityUtils from "../utils/security.js";

export const utils = {
  ...dateUtils,
  ...numberUtils,
  ...stringUtils,
  ...arrayUtils,
  ...objectUtils,
  ...validationUtils,
  debounce,
  throttle,
  ...timerUtils,
  ...formatterUtils,
  ...securityUtils,
};

import * as fileReaderModule from "../files/file-reader.js";
import * as fileExporterModule from "../files/file-exporter.js";
import * as csvModule from "../files/csv.js";
import * as jsonModule from "../files/json.js";
import * as imageModule from "../files/image.js";
import * as backupModule from "../files/backup.js";

export const files = { ...fileReaderModule, ...fileExporterModule, ...csvModule, ...jsonModule, ...imageModule, ...backupModule };

import { createWorkerClient } from "../workers/worker-client.js";
export const workers = { createWorkerClient };

import * as profile from "../features/profile.js";
import * as auth from "../features/auth.js";
import * as blog from "../features/blog.js";
import * as schedule from "../features/schedule.js";
import * as travel from "../features/travel.js";
import * as visitor from "../features/visitor.js";
import * as comments from "../features/comments.js";
import * as favorites from "../features/favorites.js";
import * as notifications from "../features/notifications.js";
import * as search from "../features/search.js";

export { profile, auth, blog, schedule, travel, visitor, comments, favorites, notifications, search };

import * as weather from "../services/weather-service.js";
import * as exchange from "../services/exchange-service.js";
import * as transport from "../services/transport-service.js";
import * as flight from "../services/flight-service.js";
import * as ferry from "../services/ferry-service.js";
import * as blogFeed from "../services/blog-feed-service.js";
import * as summarizer from "../services/summarizer-service.js";

export const services = { weather, exchange, transport, flight, ferry, blogFeed, summarizer };

import { logger } from "../core/logger.js";
import * as errorsModule from "../core/errors.js";
import { createLifecycle } from "../core/lifecycle.js";
import { exposeGlobalNamespace } from "../core/namespace.js";

export const core = { logger, ...errorsModule, createLifecycle };

exposeGlobalNamespace("Tessera", {
  http,
  storage,
  events,
  state,
  router,
  dom,
  interaction,
  utils,
  files,
  workers,
  profile,
  auth,
  blog,
  schedule,
  travel,
  visitor,
  comments,
  favorites,
  notifications,
  search,
  services,
  core,
});
