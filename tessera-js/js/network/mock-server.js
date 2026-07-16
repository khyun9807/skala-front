/**
 * 서버가 없는 환경에서 회원가입/로그인/일반 REST 호출을 흉내내는 in-memory mock 서버.
 * 실제 네트워크 지연과 간헐적 실패를 시뮬레이션해 재시도/오류 처리 로직을 검증할 수 있게 한다.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomLatency([min, max]) {
  return min + Math.random() * (max - min);
}

export function createMockServer({ latencyRange = [150, 500], failureRate = 0 } = {}) {
  async function simulate(handler) {
    await delay(randomLatency(latencyRange));
    if (Math.random() < failureRate) {
      const error = new Error("Mock server temporary error");
      error.status = 500;
      throw error;
    }
    return handler();
  }

  return {
    /** 아이디 중복확인 mock */
    async checkUsernameAvailable(username, existingUsers = []) {
      return simulate(() => !existingUsers.some((u) => u.username === username));
    },

    /** 로그인 mock: passwordHash는 호출측에서 WebCrypto로 이미 해시한 값 */
    async login(identifier, passwordHash, users = []) {
      return simulate(() => {
        const user = users.find((u) => u.username === identifier || u.email === identifier);
        if (!user) return { ok: false, reason: "NOT_FOUND" };
        if (user.passwordHash !== passwordHash) return { ok: false, reason: "WRONG_PASSWORD" };
        return { ok: true, user };
      });
    },

    /** playground의 "HTTP 요청 테스트" 패널용 범용 echo 엔드포인트 */
    async echo(path, { method = "GET", body } = {}) {
      return simulate(() => ({
        path,
        method,
        receivedAt: new Date().toISOString(),
        echo: body ?? null,
      }));
    },
  };
}

export const mockServer = createMockServer({ failureRate: 0.05 });
