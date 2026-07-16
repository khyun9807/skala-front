/*
 * [JavaScript 기초 - 과제] Up-Down 숫자 맞추기 게임
 * 과제 요구사항:
 *  - 컴퓨터가 1~50 사이 무작위 숫자 생성: Math.floor(Math.random() * 50) + 1
 *  - prompt()로 입력받아 맞출 때까지 반복 (while)
 *  - 큰 값 입력 시 alert("Down!"), 작은 값 입력 시 alert("Up!")
 *  - 정답 시 "축하합니다! X번 만에 맞추셨습니다." 출력 후 종료
 *
 * index.v3.html <aside> 안의 "게임 시작" 버튼(#btn-updown)에서 실행된다.
 */

function startUpDownGame() {
  var computerNum = Math.floor(Math.random() * 50) + 1; // 1 ~ 50
  var tryCount = 0;
  var cleared = false;

  while (true) {
    var input = prompt("1부터 50 사이의 숫자를 맞춰보세요! (취소하면 게임 종료)");

    // 사용자가 '취소'를 누르면 prompt는 null을 반환 → 게임 중단
    if (input === null) {
      break;
    }

    var guess = Number(input);

    // 숫자가 아니거나 범위를 벗어난 경우
    if (input.trim() === "" || Number.isNaN(guess) || guess < 1 || guess > 50) {
      alert("1부터 50 사이의 숫자를 입력해 주세요.");
      continue;
    }

    tryCount++;

    if (guess > computerNum) {
      alert("Down! ⬇️ 더 작은 숫자예요.");
    } else if (guess < computerNum) {
      alert("Up! ⬆️ 더 큰 숫자예요.");
    } else {
      alert("정답! 🎉 축하합니다! " + tryCount + "번 만에 맞추셨습니다.");
      cleared = true;
      break;
    }
  }

  if (!cleared) {
    alert("게임을 종료했어요. 정답은 " + computerNum + "이었습니다!");
  }
}

// 버튼과 연결 (defer로 로드되므로 DOM은 이미 준비된 상태)
document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("btn-updown");
  if (btn) {
    btn.addEventListener("click", startUpDownGame);
  }
});
