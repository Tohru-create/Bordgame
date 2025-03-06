const storyContainer = document.getElementById("story");
const storyLines = document.querySelectorAll(".story-line");
let currentLine = 0;

function showStory() {
    storyContainer.style.display = "block"; // ストーリーを表示
    storyLines.forEach((line, index) => {
        line.style.display = index === 0 ? "block" : "none"; // 最初の行だけ表示
    });
}

// ストーリーを次の行へ進める関数
function nextStoryLine() {
    if (currentLine < storyLines.length - 1) {
        storyLines[currentLine].style.display = "none";
        currentLine++;
        storyLines[currentLine].style.display = "block";

        // ホストがクリックしたら、全プレイヤーに現在の行数を送信
        socket.send(JSON.stringify({ type: "story-progress", line: currentLine }));
    } else {
        // ストーリー終了時にゲーム開始
        storyContainer.style.display = "none";
        socket.send(JSON.stringify({ type: "story-end" }));
    }
}

// ホストのみクリックで進める（最初にホスト判定が必要）
document.addEventListener("click", () => {
    if (isHost) {
        nextStoryLine();
    }
});

// WebSocket でデータを受信したときの処理
socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "story-progress") {
        // 他のプレイヤーのストーリーも同期
        storyLines[currentLine].style.display = "none";
        currentLine = data.line;
        storyLines[currentLine].style.display = "block";
    } else if (data.type === "story-end") {
        // ストーリーが終了したらゲーム開始
        storyContainer.style.display = "none";
    }
});

// ゲーム開始時にストーリーを表示
showStory();
