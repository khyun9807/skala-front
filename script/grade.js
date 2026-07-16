/*
 * [JavaScript 기초 - 과제] 성적 계산기
 * 과제 요구사항:
 *  - 과목 배열: var subjects = ["HTML", "CSS", "JavaScript"];
 *  - 총점 변수: var total = 0;
 *  - for문으로 배열 길이만큼 반복, prompt(subjects[i] + " 점수를 입력하세요.")로 입력받아 합산
 *  - 반복 종료 후 평균 계산 (60점 이상 합격 / 미만 불합격)
 *  - 결과를 alert()로 출력 (예: "총점: 240점, 평균: 80, 결과: 합격입니다!")
 *
 * index.v3.html <aside> 안의 "성적 계산기" 버튼(#btn-grade)에서 실행된다.
 */

function startGradeCalculator() {
  var subjects = ["HTML", "CSS", "JavaScript"];
  var total = 0;

  for (var i = 0; i < subjects.length; i++) {
    var input = prompt(subjects[i] + " 점수를 입력하세요. (0~100)");

    // 취소 시 계산 중단
    if (input === null) {
      alert("성적 계산을 취소했습니다.");
      return;
    }

    var score = Number(input);

    // 잘못된 입력은 0~100 사이가 될 때까지 다시 받는다
    while (input.trim() === "" || Number.isNaN(score) || score < 0 || score > 100) {
      input = prompt("0부터 100 사이의 숫자로 " + subjects[i] + " 점수를 다시 입력하세요.");
      if (input === null) {
        alert("성적 계산을 취소했습니다.");
        return;
      }
      score = Number(input);
    }

    total += score;
  }

  var average = total / subjects.length;
  // 소수점이 있으면 첫째 자리까지만 표시 (예: 66.7), 딱 떨어지면 정수로
  var averageText = Number.isInteger(average) ? average : average.toFixed(1);
  var result = average >= 60 ? "합격입니다! 🎉" : "불합격입니다. 😢";

  alert(
    "총점: " + total + "점\n" +
    "평균: " + averageText + "점\n" +
    "결과: " + result
  );
}

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("btn-grade");
  if (btn) {
    btn.addEventListener("click", startGradeCalculator);
  }
});
