/**
 * 커스텀 오류 계층. 모든 오류는 AppError를 상속해 사용자용/개발자용 메시지,
 * 오류 코드, 원본 오류(cause), 발생 시각, 복구 가능 여부를 공통으로 가진다.
 */
export class AppError extends Error {
  constructor(message, { code = "APP_ERROR", cause = null, userMessage = null, recoverable = true } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
    this.userMessage = userMessage ?? "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    this.recoverable = recoverable;
    this.occurredAt = new Date().toISOString();
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      recoverable: this.recoverable,
      occurredAt: this.occurredAt,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, { field = null, errors = [], ...rest } = {}) {
    super(message, { code: "VALIDATION_ERROR", userMessage: "입력값을 다시 확인해주세요.", ...rest });
    this.field = field;
    this.errors = errors;
  }
}

export class NetworkError extends AppError {
  constructor(message, { status = null, url = null, ...rest } = {}) {
    super(message, { code: "NETWORK_ERROR", userMessage: "네트워크 연결을 확인해주세요.", ...rest });
    this.status = status;
    this.url = url;
  }
}

export class TimeoutError extends AppError {
  constructor(message = "요청 시간이 초과되었습니다.", rest = {}) {
    super(message, { code: "TIMEOUT_ERROR", userMessage: "요청 시간이 초과되었습니다.", ...rest });
  }
}

export class StorageError extends AppError {
  constructor(message, rest = {}) {
    super(message, { code: "STORAGE_ERROR", userMessage: "데이터를 저장하지 못했습니다.", ...rest });
  }
}

export class AuthenticationError extends AppError {
  constructor(message, rest = {}) {
    super(message, { code: "AUTH_ERROR", userMessage: "인증에 실패했습니다.", recoverable: true, ...rest });
  }
}

export class FileError extends AppError {
  constructor(message, rest = {}) {
    super(message, { code: "FILE_ERROR", userMessage: "파일을 처리하지 못했습니다.", ...rest });
  }
}

export class ApiError extends AppError {
  constructor(message, { provider = null, ...rest } = {}) {
    super(message, { code: "API_ERROR", userMessage: "외부 서비스 응답을 받지 못했습니다.", ...rest });
    this.provider = provider;
  }
}

/**
 * 전역 오류 핸들러를 등록한다. window.onerror와 unhandledrejection을 모두 잡아
 * logger로 넘긴다. 반환값은 등록 해제 함수(cleanup에서 활용).
 */
export function registerGlobalErrorHandlers(logger) {
  const onError = (event) => {
    logger.error("global", "Uncaught error", { message: event.message, filename: event.filename, lineno: event.lineno });
  };
  const onRejection = (event) => {
    const reason = event.reason;
    logger.error("global", "Unhandled promise rejection", {
      message: reason instanceof Error ? reason.message : String(reason),
    });
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
