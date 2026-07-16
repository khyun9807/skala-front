/*
 * [JavaScript 기초 - 과제] 내 가방 보기
 * 과제 요구사항:
 *  - 함수: showMyBag()
 *  - myBag 배열에 소지품 객체(소지품명, 소지품 수)를 임의로 여러 개 생성
 *  - 반복문으로 소지품 객체 내용을 출력 (alert)
 *
 * index.v3.html <aside> 안의 "내 가방 보기" 버튼(#btn-bag)에서 실행된다.
 */

function showMyBag() {
  var myBag = [
    { name: "노트북", count: 1 },
    { name: "충전기", count: 2 },
    { name: "텀블러", count: 1 },
    { name: "볼펜", count: 3 },
    { name: "이어폰", count: 1 }
  ];

  var message = "🎒 내 가방 속 소지품 목록\n\n";

  for (var i = 0; i < myBag.length; i++) {
    var item = myBag[i];
    message += (i + 1) + ". " + item.name + " - " + item.count + "개\n";
  }

  alert(message);
}

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("btn-bag");
  if (btn) {
    btn.addEventListener("click", showMyBag);
  }
});
