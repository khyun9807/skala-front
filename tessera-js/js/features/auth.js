import { localStore } from "../storage/local-storage.js";
import { sessionStore } from "../storage/session-storage.js";
import { eventBus } from "../core/event-bus.js";
import { logger } from "../core/logger.js";
import { AuthenticationError, NetworkError } from "../core/errors.js";
import { withRetry } from "../network/retry-policy.js";
import { hashPassword, generateSalt, generateId } from "../utils/security.js";
import { mockServer } from "../network/mock-server.js";
import { EVENTS, AUTH_MAX_LOGIN_ATTEMPTS, AUTH_LOCKOUT_MS, SESSION_TTL_MS, SESSION_WARNING_MS } from "../config/constants.js";

/**
 * 학습용 Mock 인증. 실제 서버 인증을 대체하지 않는다(README 참고).
 * 비밀번호는 절대 평문으로 저장하지 않고 Web Crypto(SHA-256) + salt 해시만 저장한다.
 */
const USERS_KEY = "auth-users";
const ATTEMPTS_KEY = "auth-login-attempts";
const SESSION_KEY = "auth-session";

function loadUsers() {
  return localStore.get(USERS_KEY, []);
}

function saveUsers(users) {
  localStore.set(USERS_KEY, users);
}

/**
 * data/mock-users.json 시드 데이터를 최초 1회만 사용자 목록에 병합한다.
 * 시드 파일에는 학습용 평문 데모 비밀번호가 들어있지만, 저장 전에 항상 Web Crypto로 해시해서
 * 실제로 localStorage에 남는 값은 salt+SHA-256 해시뿐이다(평문은 메모리에서만 잠깐 존재).
 */
export async function seedUsersIfEmpty(fetchSeed) {
  const existing = loadUsers();
  if (existing.length > 0) return existing;
  try {
    const seed = await fetchSeed();
    const hashedUsers = await Promise.all(
      seed.map(async ({ password, ...rest }) => {
        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);
        return { id: generateId("user"), salt, passwordHash, ...rest };
      })
    );
    saveUsers(hashedUsers);
    return hashedUsers;
  } catch (error) {
    logger.warn("auth", "failed to seed mock users", { message: error.message });
    return [];
  }
}

/**
 * mock-server.js는 재시도 로직을 시연하기 위해 일정 확률로 일부러 예외를 던진다.
 * 여기서 흡수하지 않으면 실시간 중복확인이나 폼 제출 쪽에서 처리되지 않은 예외로 튀어나간다.
 */
export async function isUsernameAvailable(username) {
  const users = loadUsers();
  try {
    return await withRetry(() => mockServer.checkUsernameAvailable(username, users), { retries: 2, baseDelay: 150 });
  } catch (error) {
    throw new NetworkError("아이디 중복 확인 서버에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.", { cause: error });
  }
}

export async function signUp({ name, username, email, password, birthDate, interests = [], travelPreferences = [], agreedToTerms, avatarDataUrl = null }) {
  if (!agreedToTerms) throw new AuthenticationError("약관에 동의해야 회원가입을 진행할 수 있습니다.");

  const users = loadUsers();
  const available = await isUsernameAvailable(username);
  if (!available) throw new AuthenticationError(`이미 사용 중인 아이디입니다: ${username}`);

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const user = {
    id: generateId("user"),
    name,
    username,
    email,
    salt,
    passwordHash,
    birthDate,
    interests,
    travelPreferences,
    avatarDataUrl,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  eventBus.emit("auth:signup", { username });
  return { id: user.id, username: user.username, name: user.name };
}

function getAttempts(identifier) {
  const all = localStore.get(ATTEMPTS_KEY, {});
  return all[identifier] ?? { count: 0, lockedUntil: 0 };
}

function setAttempts(identifier, attempt) {
  const all = localStore.get(ATTEMPTS_KEY, {});
  localStore.set(ATTEMPTS_KEY, { ...all, [identifier]: attempt });
}

export async function login(identifier, password, { keepLoggedIn = false } = {}) {
  const attempt = getAttempts(identifier);
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    const remainingSec = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
    throw new AuthenticationError(`로그인 시도가 너무 많습니다. ${remainingSec}초 후 다시 시도해주세요.`, { recoverable: true });
  }

  const users = loadUsers();
  const user = users.find((u) => u.username === identifier || u.email === identifier);
  if (!user) {
    setAttempts(identifier, { count: attempt.count + 1, lockedUntil: 0 });
    throw new AuthenticationError("아이디 또는 이메일을 찾을 수 없습니다.");
  }

  const passwordHash = await hashPassword(password, user.salt);
  let result;
  try {
    // mock-server.js는 실제 네트워크 흔들림을 흉내내기 위해 일정 확률로 예외를 던진다 — 재시도로 흡수한다.
    result = await withRetry(() => mockServer.login(identifier, passwordHash, users), { retries: 2, baseDelay: 200 });
  } catch (error) {
    throw new NetworkError("로그인 서버에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.", { cause: error });
  }

  if (!result.ok) {
    const nextCount = attempt.count + 1;
    const lockedUntil = nextCount >= AUTH_MAX_LOGIN_ATTEMPTS ? Date.now() + AUTH_LOCKOUT_MS : 0;
    setAttempts(identifier, { count: nextCount, lockedUntil });
    throw new AuthenticationError(lockedUntil ? "로그인 시도 횟수를 초과해 잠시 잠겼습니다." : "비밀번호가 일치하지 않습니다.");
  }

  setAttempts(identifier, { count: 0, lockedUntil: 0 });
  const session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    loginAt: Date.now(),
    lastActivityAt: Date.now(),
  };
  sessionStore.set(SESSION_KEY, session);
  if (keepLoggedIn) {
    localStore.set(SESSION_KEY, session, { ttl: SESSION_TTL_MS });
  }
  eventBus.emit(EVENTS.AUTH_LOGIN, session);
  return session;
}

export function getSession() {
  return sessionStore.get(SESSION_KEY) ?? localStore.get(SESSION_KEY);
}

export function isLoggedIn() {
  return Boolean(getSession());
}

export function touchActivity() {
  const session = getSession();
  if (!session) return;
  const updated = { ...session, lastActivityAt: Date.now() };
  sessionStore.set(SESSION_KEY, updated);
  if (localStore.get(SESSION_KEY)) localStore.set(SESSION_KEY, updated, { ttl: SESSION_TTL_MS });
}

export function logout() {
  sessionStore.remove(SESSION_KEY);
  localStore.remove(SESSION_KEY);
  eventBus.emit(EVENTS.AUTH_LOGOUT);
}

/**
 * 세션 만료 워처를 시작한다. lifecycle에 등록해 페이지를 벗어나면 자동으로 해제된다.
 * 만료 SESSION_WARNING_MS 전에 AUTH_SESSION_EXPIRING을 emit해 "곧 로그아웃" 경고를 띄울 수 있게 한다.
 */
export function startSessionWatcher(lifecycle) {
  const checkIntervalMs = 5000;
  let warned = false;

  const intervalId = lifecycle.setInterval(() => {
    const session = getSession();
    if (!session) return;
    const elapsed = Date.now() - session.lastActivityAt;
    const remaining = SESSION_TTL_MS - elapsed;
    if (remaining <= 0) {
      logout();
      eventBus.emit(EVENTS.AUTH_SESSION_EXPIRED);
      warned = false;
    } else if (remaining <= SESSION_WARNING_MS && !warned) {
      warned = true;
      eventBus.emit(EVENTS.AUTH_SESSION_EXPIRING, { remainingMs: remaining });
    } else if (remaining > SESSION_WARNING_MS) {
      warned = false;
    }
  }, checkIntervalMs);

  return () => lifecycle.clearInterval(intervalId);
}

/** 보호된 페이지에서 호출: 로그인 안 되어 있으면 redirect 경로를 저장하고 false 반환 */
export function requireAuth() {
  if (isLoggedIn()) return true;
  sessionStore.set("auth-redirect", window.location.pathname + window.location.search);
  return false;
}

export function consumeRedirectPath(fallback = "/index.html") {
  const path = sessionStore.get("auth-redirect");
  sessionStore.remove("auth-redirect");
  return path ?? fallback;
}
