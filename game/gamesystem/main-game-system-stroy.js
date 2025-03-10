const storyContainer = document.getElementById("story");
const storyLines = document.querySelectorAll(".story-line");
const storyNextButton = document.getElementById("storyNextButton"); // 矢印ボタン
let currentLine = 0;
let room = window.roomID;
let isProcessing = false;

function nextStoryLine() {
    if (isProcessing) return;
    isProcessing = true;

    if (currentLine < storyLines.length - 1) {

        // 現在の行をフェードアウト
        storyLines[currentLine].style.transition = "opacity 0.5s ease-out";
        storyLines[currentLine].style.opacity = "0";
        storyNextButton.style.opacity = "0"; // ボタンも一旦消す

        setTimeout(() => {
            storyLines[currentLine].style.display = "none";
            currentLine++;
            storyLines[currentLine].style.display = "block";
            storyLines[currentLine].style.opacity = "0";
            storyLines[currentLine].style.transition = "opacity 0.5s ease-in";

            setTimeout(() => {
                storyLines[currentLine].style.opacity = "1";
                storyNextButton.style.opacity = "1"; // ボタンを再表示
            }, 100);

            // console.log(`➡️ 次の行 (${currentLine}): ${storyLines[currentLine].textContent}`);

            if (currentLine > 0) {
                socket.emit("story-progress", { room, index: currentLine });
            }

            isProcessing = false;
        }, 500);
    } else {
        console.log("📖 ストーリー終了。すべての行を表示しました。");

        storyContainer.style.transition = "opacity 0.5s ease-out";
        storyContainer.style.opacity = "0";
        storyNextButton.style.opacity = "0"; // ボタンも消す

        setTimeout(() => {
            storyContainer.style.display = "none";
            socket.emit("story-end", { room });
            isProcessing = false;
        }, 500);
    }
}

// **ボタンをクリックしたときにストーリーを進める**
storyContainer.addEventListener("click", nextStoryLine);

socket.on("story-progress", (data) => {
    // console.log(`📡 story-progress 受信: ${data.index} (現在の行: ${currentLine})`);

    if (data.index <= currentLine) {
        console.warn(`⚠️ 受信した行 (${data.index}) が既に進んでいるため無視`);
        return;
    }

    storyLines[currentLine].style.transition = "opacity 0.5s ease-out";
    storyLines[currentLine].style.opacity = "0";
    storyNextButton.style.opacity = "0"; // ボタンもフェードアウト

    setTimeout(() => {
        storyLines[currentLine].style.display = "none";
        currentLine = data.index;
        storyLines[currentLine].style.display = "block";
        storyLines[currentLine].style.opacity = "0";
        storyLines[currentLine].style.transition = "opacity 0.5s ease-in";

        setTimeout(() => {
            storyLines[currentLine].style.opacity = "1";
            storyNextButton.style.opacity = "1"; // ボタンを再表示
        }, 100);

        // console.log(`✅ ストーリー更新: 現在の行 (${currentLine}): ${storyLines[currentLine].textContent}`);
        isProcessing = false;
    }, 500);
});

socket.on("story-end", () => {
    storyContainer.style.transition = "opacity 0.5s ease-out";
    storyContainer.style.opacity = "0";
    storyNextButton.style.opacity = "0"; // ボタンを消す

    setTimeout(() => {
        storyContainer.style.display = "none";
    }, 500);
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
    const storyNextButton = document.getElementById("storyNextButton"); // 矢印ボタン
    
    if (storyContainer && storyLines.length > 0 && storyNextButton) {
        storyContainer.style.display = "block";
        storyContainer.style.opacity = "1"; // 透明度リセット

        // **最初の行だけを確実に表示**
        storyLines.forEach((line, index) => {
            line.style.display = "none";
            line.style.opacity = "0";
        });

        storyLines[0].style.display = "block";
        setTimeout(() => {
            storyLines[0].style.opacity = "1";
            storyNextButton.style.opacity = "1"; // 矢印ボタンをフェードイン
        }, 100);

        storyNextButton.style.display = "block"; // ボタンを表示

        currentLine = 0;
        isProcessing = false;
        console.log("✅ ストーリー画面を表示 & 1行目をセットしました");
    } else {
        console.error("❌ ストーリー画面またはストーリーの行が見つかりません");
    }
});
