import { REGEX } from "../config/constants.js";

function ruleResult(isValid, message) {
  return isValid ? null : message;
}

/**
 * 재사용 가능한 validator 팩토리 모음. 각 validator는 (value, allValues) => string|null
 * (에러 메시지 또는 유효함을 뜻하는 null)을 반환하는 함수를 만들어준다.
 * asyncValidator로 만든 규칙만 `.isAsync = true` 플래그를 가진다.
 */
export const validators = {
  required(message = "필수 입력 항목입니다.") {
    return (value) =>
      ruleResult(!(value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)), message);
  },
  minLength(n, message) {
    return (value) => ruleResult(typeof value === "string" && value.length >= n, message ?? `최소 ${n}자 이상 입력해주세요.`);
  },
  maxLength(n, message) {
    return (value) => ruleResult(typeof value !== "string" || value.length <= n, message ?? `최대 ${n}자까지 입력할 수 있습니다.`);
  },
  email(message = "이메일 형식이 올바르지 않습니다.") {
    return (value) => ruleResult(!value || REGEX.EMAIL.test(value), message);
  },
  url(message = "URL 형식이 올바르지 않습니다.") {
    return (value) => ruleResult(!value || REGEX.URL.test(value), message);
  },
  phone(message = "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)") {
    return (value) => ruleResult(!value || REGEX.PHONE.test(value), message);
  },
  number(message = "숫자만 입력해주세요.") {
    return (value) => ruleResult(value === "" || value === null || value === undefined || !Number.isNaN(Number(value)), message);
  },
  integer(message = "정수만 입력해주세요.") {
    return (value) => ruleResult(value === "" || value === null || Number.isInteger(Number(value)), message);
  },
  min(n, message) {
    return (value) => ruleResult(value === "" || value === null || Number(value) >= n, message ?? `${n} 이상이어야 합니다.`);
  },
  max(n, message) {
    return (value) => ruleResult(value === "" || value === null || Number(value) <= n, message ?? `${n} 이하여야 합니다.`);
  },
  date(message = "날짜 형식이 올바르지 않습니다.") {
    return (value) => ruleResult(!value || !Number.isNaN(new Date(value).getTime()), message);
  },
  password(message = "비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.") {
    return (value) => ruleResult(!value || (value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value)), message);
  },
  passwordConfirmation(passwordField, message = "비밀번호가 일치하지 않습니다.") {
    return (value, allValues = {}) => ruleResult(value === allValues[passwordField], message);
  },
  custom(fn, message = "유효하지 않은 값입니다.") {
    return (value, allValues) => ruleResult(Boolean(fn(value, allValues)), message);
  },
  /** 아이디 중복확인처럼 네트워크/스토리지 조회가 필요한 규칙에 사용 */
  asyncValidator(fn, message = "확인 중 문제가 발생했습니다.") {
    const rule = async (value, allValues) => ruleResult(await fn(value, allValues), message);
    rule.isAsync = true;
    return rule;
  },
};

/** 비밀번호 강도를 0~5 점수로 계산(길이/대소문자/숫자/특수문자 조합) */
export function passwordStrength(password = "") {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const labels = ["매우 약함", "약함", "보통", "강함", "매우 강함", "최상"];
  return { score, label: labels[score] ?? labels.at(-1) };
}

export async function validateField(value, rules, allValues = {}, { firstErrorOnly = true } = {}) {
  const errors = [];
  for (const rule of rules) {
    const result = rule.isAsync ? await rule(value, allValues) : rule(value, allValues);
    if (result) {
      errors.push(result);
      if (firstErrorOnly) break;
    }
  }
  return errors;
}

/**
 * schema: { field: [validators.required(), validators.email(), ...] }
 * 반환: { valid, errors: { field: [msg, ...] } }
 */
export async function validateForm(formData, schema, options = {}) {
  const errors = {};
  await Promise.all(
    Object.entries(schema).map(async ([field, rules]) => {
      const fieldErrors = await validateField(formData[field], rules, formData, options);
      if (fieldErrors.length) errors[field] = fieldErrors;
    })
  );
  return { valid: Object.keys(errors).length === 0, errors };
}
