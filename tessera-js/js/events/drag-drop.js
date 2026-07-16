/**
 * HTML5 네이티브 Drag & Drop 래퍼. 일정 카드 이동, 파일 드롭존 두 용도로 사용한다.
 */
export function makeDraggable(el, getData) {
  el.draggable = true;
  function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", JSON.stringify(getData()));
    event.dataTransfer.effectAllowed = "move";
    el.classList.add("is-dragging");
  }
  function handleDragEnd() {
    el.classList.remove("is-dragging");
  }
  el.addEventListener("dragstart", handleDragStart);
  el.addEventListener("dragend", handleDragEnd);
  return () => {
    el.removeEventListener("dragstart", handleDragStart);
    el.removeEventListener("dragend", handleDragEnd);
  };
}

export function makeDropzone(el, onDrop, { onEnter, onLeave } = {}) {
  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
  function handleDragEnter(event) {
    event.preventDefault();
    el.classList.add("dropzone--active");
    onEnter?.(event);
  }
  function handleDragLeave(event) {
    el.classList.remove("dropzone--active");
    onLeave?.(event);
  }
  function handleDrop(event) {
    event.preventDefault();
    el.classList.remove("dropzone--active");
    const raw = event.dataTransfer.getData("text/plain");
    let data = raw;
    try {
      data = JSON.parse(raw);
    } catch {
      /* JSON이 아니면 원본 문자열 그대로 전달 */
    }
    onDrop(data, event);
  }
  el.addEventListener("dragover", handleDragOver);
  el.addEventListener("dragenter", handleDragEnter);
  el.addEventListener("dragleave", handleDragLeave);
  el.addEventListener("drop", handleDrop);
  return () => {
    el.removeEventListener("dragover", handleDragOver);
    el.removeEventListener("dragenter", handleDragEnter);
    el.removeEventListener("dragleave", handleDragLeave);
    el.removeEventListener("drop", handleDrop);
  };
}

/** 파일 드래그앤드롭 전용(파일 읽기 페이지/회원가입 프로필 이미지 등) */
export function makeFileDropzone(el, onFiles) {
  function handleDragOver(event) {
    event.preventDefault();
    el.classList.add("dropzone--active");
  }
  function handleDragLeave() {
    el.classList.remove("dropzone--active");
  }
  function handleDrop(event) {
    event.preventDefault();
    el.classList.remove("dropzone--active");
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length) onFiles(files);
  }
  el.addEventListener("dragover", handleDragOver);
  el.addEventListener("dragleave", handleDragLeave);
  el.addEventListener("drop", handleDrop);
  return () => {
    el.removeEventListener("dragover", handleDragOver);
    el.removeEventListener("dragleave", handleDragLeave);
    el.removeEventListener("drop", handleDrop);
  };
}
