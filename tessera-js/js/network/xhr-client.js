/**
 * XMLHttpRequest 기반 비교용 클라이언트. 기본 통신 방식은 http-client.js(Fetch)를 쓰고,
 * 이 모듈은 README에서 설명하는 Fetch vs XHR 차이(진행률 이벤트, 취소 방식, 콜백 vs Promise)를
 * 실제로 보여주기 위한 제한적 용도로만 사용한다.
 */
export function xhrRequest(url, { method = "GET", json, onProgress, timeout = 5000 } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = timeout;
    xhr.responseType = "text";
    if (json !== undefined) xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let data = xhr.responseText;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          /* JSON이 아니면 텍스트 그대로 반환 */
        }
        resolve({ data, status: xhr.status });
      } else {
        reject(new Error(`XHR ${xhr.status}: ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => reject(new Error("XHR network error"));
    xhr.ontimeout = () => reject(new Error("XHR timeout"));
    xhr.onabort = () => reject(new DOMException("aborted", "AbortError"));

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded / event.total);
      };
    }

    xhr.send(json !== undefined ? JSON.stringify(json) : null);

    // 반환 객체에 abort 핸들을 심어 호출측이 취소할 수 있게 한다(fetch의 AbortController와 대응)
    xhrRequest.lastXhr = xhr;
  });
}

export function createAbortableXhr(url, options = {}) {
  const xhr = new XMLHttpRequest();
  const promise = new Promise((resolve, reject) => {
    xhr.open(options.method ?? "GET", url);
    xhr.onload = () => resolve({ data: xhr.responseText, status: xhr.status });
    xhr.onerror = () => reject(new Error("XHR network error"));
    xhr.onabort = () => reject(new DOMException("aborted", "AbortError"));
    xhr.send(options.body ?? null);
  });
  return { promise, abort: () => xhr.abort() };
}
