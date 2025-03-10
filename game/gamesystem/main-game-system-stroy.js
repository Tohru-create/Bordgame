// window.roomID = roomID; 
// window.playerToken = token;
// window.userID = userID;
// window.username = username;
// window.hostsettings = hostsettings;

const storyContainer = document.getElementById("story");
const storyLines = document.querySelectorAll(".story-line");
let currentLine = 0;
let room = roomID; // ルームIDを取得
let isHost = window.hostsettings === "true"; // ホスト判定

function showStory() {
    storyContainer.style.display = "block";
    storyLines.forEach((line, index) => {
        line.style.display = index === 0 ? "block" : "none";
    });
}

function nextStoryLine() {
    if (currentLine < storyLines.length - 1) {
        storyLines[currentLine].style.display = "none";
        currentLine++;
        storyLines[currentLine].style.display = "block";

        // 全プレイヤーがストーリーを進められるように変更
        socket.emit("story-progress", { room, index: currentLine });
    } else {
        storyContainer.style.display = "none";
        socket.emit("story-end", { room });
    }
}

// クリックごとに次のストーリーへ進める
document.addEventListener("click", () => {
    nextStoryLine();
});

// WebSocket イベント受信: ストーリー開始
socket.on("showStory", () => {
    console.log("📖 ストーリーが開始されました");

    // タイトル画面を非表示
    const titleScreen = document.getElementById("tittlescreen");
    if (titleScreen) {
        titleScreen.style.display = "none";
        console.log("✅ タイトル画面を非表示にしました");
    } else {
        console.error("❌ タイトル画面の要素が見つかりませんでした");
    }

    // ストーリー画面を表示 & 1行目をセット
    const storyContainer = document.getElementById("story");
    const storyLines = document.querySelectorAll(".story-line");
    
    if (storyContainer && storyLines.length > 0) {
        storyContainer.style.display = "block";
        storyLines.forEach((line, index) => {
            line.style.display = index === 0 ? "block" : "none";
        });
        console.log("✅ ストーリー画面を表示 & 1行目をセットしました");
    } else {
        console.error("❌ ストーリー画面またはストーリーの行が見つかりません");
    }
});


socket.on("story-progress", (data) => {
    if (currentLine !== data.index) {
        storyLines[currentLine].style.display = "none";
        currentLine = data.index;
        storyLines[currentLine].style.display = "block";
    }
});

socket.on("story-end", () => {
    storyContainer.style.display = "none";
});
