/**
 * TesseraJS 전역 상수. 매직 넘버/문자열을 이 파일 하나로 모아 하드코딩을 최소화한다.
 */

export const STORAGE_NAMESPACE = "tessera";
export const STORAGE_VERSION = 1;

export const DB_NAME = "TesseraDB";
export const DB_VERSION = 1;

export const OBJECT_STORES = Object.freeze({
  BLOG_POSTS: "blogPosts",
  COMMENTS: "comments",
  TRAVELS: "travels",
  SCHEDULES: "schedules",
  VISITOR_EVENTS: "visitorEvents",
  IMAGE_META: "imageMeta",
  FILE_BACKUPS: "fileBackups",
});

export const HTTP_DEFAULTS = Object.freeze({
  TIMEOUT_MS: 5000,
  RETRY_COUNT: 2,
  RETRY_BASE_DELAY_MS: 300,
  RETRY_MAX_DELAY_MS: 4000,
  CACHE_TTL_MS: 60_000,
  MAX_CONCURRENT: 4,
});

export const TIME_MS = Object.freeze({
  SECOND: 1000,
  MINUTE: 60_000,
  HOUR: 3_600_000,
  DAY: 86_400_000,
  WEEK: 604_800_000,
});

export const EVENTS = Object.freeze({
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_SESSION_EXPIRING: "auth:session-expiring",
  AUTH_SESSION_EXPIRED: "auth:session-expired",
  BLOG_LOADED: "blog:loaded",
  BLOG_BOOKMARK_CHANGED: "blog:bookmark-changed",
  BLOG_DRAFT_SAVED: "blog:draft-saved",
  SCHEDULE_CHANGED: "schedule:changed",
  SCHEDULE_CONFLICT: "schedule:conflict",
  TRAVEL_CHANGED: "travel:changed",
  TRAVEL_LOADED: "travel:loaded",
  VISITOR_TICK: "visitor:tick",
  NETWORK_ONLINE: "network:online",
  NETWORK_OFFLINE: "network:offline",
  HTTP_LOADING_START: "http:loading-start",
  HTTP_LOADING_END: "http:loading-end",
  TOAST_SHOW: "ui:toast-show",
});

export const REGEX = Object.freeze({
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i,
  PHONE: /^0\d{1,2}-?\d{3,4}-?\d{4}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
});

export const RECURRENCE_TYPES = Object.freeze({
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  WEEKDAYS: "weekdays",
  MONTHLY: "monthly",
  SPECIFIC_WEEKDAY: "specific-weekday",
});

export const SCHEDULE_KINDS = Object.freeze({
  CLASS: "class",
  TRAVEL: "travel",
  PERSONAL: "personal",
});

export const CHART_COLORS = Object.freeze([
  "#4f6bed", "#ed8f4f", "#4fedb0", "#ed4f7c", "#c14fed", "#edd64f", "#4fc8ed",
]);

export const MAX_LOG_ENTRIES = 500;
export const MAX_SEARCH_HISTORY = 10;
export const AUTH_MAX_LOGIN_ATTEMPTS = 5;
export const AUTH_LOCKOUT_MS = TIME_MS.MINUTE;
export const SESSION_TTL_MS = 30 * TIME_MS.MINUTE;
export const SESSION_WARNING_MS = 60 * TIME_MS.SECOND;
