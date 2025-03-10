const storyContainer = document.getElementById("story");
const storyLines = document.querySelectorAll(".story-line");
let currentLine = 0;
let room = window.roomID; // ルームIDを取得
let isProcessing = false; // 二重処理防止

function showStory() {
    storyContainer.style.display = "block";
    storyContainer.style.opacity = "1"; // 透明度をリセット

    // **最初の行だけを確実に表示**
    storyLines.forEach((line, index) => {
        line.style.display = "none";  // 一旦すべて非表示
        line.style.opacity = "0";     // 透明にしておく
    });

    // **最初の行を表示して、すぐにフェードイン**
    storyLines[0].style.display = "block";
    setTimeout(() => {
        storyLines[0].style.opacity = "1";
    }, 100); // 100ms遅延を入れて、フェードインを適用

    currentLine = 0; // 最初の行にリセット
    isProcessing = false;

    console.log(`📖 ストーリー開始: 現在の行 (${currentLine}): ${storyLines[currentLine].textContent}`);
}
function nextStoryLine() {
    if (isProcessing) return; // 二重処理を防ぐ
    isProcessing = true; // 処理中フラグを立てる

    if (currentLine < storyLines.length - 1) {
        console.log(`📖 現在の行 (${currentLine}): ${storyLines[currentLine].textContent}`);

        // **現在の行をフェードアウト**
        storyLines[currentLine].style.transition = "opacity 0.5s ease-out";
        storyLines[currentLine].style.opacity = "0";

        // **0.5秒後に非表示 & 次の行を表示**
        setTimeout(() => {
            storyLines[currentLine].style.display = "none"; // 完全に非表示
            currentLine++;
            storyLines[currentLine].style.display = "block";
            storyLines[currentLine].style.opacity = "0"; // 透明にしておく
            storyLines[currentLine].style.transition = "opacity 0.5s ease-in";

            // **100ms 後にフェードインを開始**
            setTimeout(() => {
                storyLines[currentLine].style.opacity = "1"; // フェードイン
            }, 100);

            console.log(`➡️ 次の行 (${currentLine}): ${storyLines[currentLine].textContent}`);

            // **次の行がある場合のみ `story-progress` を送信**
            if (currentLine > 0) {
                socket.emit("story-progress", { room, index: currentLine });
            }

            isProcessing = false; // 処理完了
        }, 500); // 0.5秒後に次の行へ
    } else {
        console.log("📖 ストーリー終了。すべての行を表示しました。");

        // **ストーリー全体をフェードアウト**
        storyContainer.style.transition = "opacity 0.5s ease-out";
        storyContainer.style.opacity = "0";

        setTimeout(() => {
            storyContainer.style.display = "none";
            socket.emit("story-end", { room });
            isProcessing = false;
        }, 500); // 0.5秒後に非表示
    }
}

// **クリックイベントで次の行へ**
document.addEventListener("click", () => {
    nextStoryLine();
});


socket.on("story-progress", (data) => {
    console.log(`📡 story-progress 受信: ${data.index} (現在の行: ${currentLine})`);

    if (data.index <= currentLine) {
        console.warn(`⚠️ 受信した行 (${data.index}) が既に進んでいるため無視`);
        return;
    }

    // **現在の行をフェードアウト**
    storyLines[currentLine].style.transition = "opacity 0.5s ease-out";
    storyLines[currentLine].style.opacity = "0";

    setTimeout(() => {
        storyLines[currentLine].style.display = "none";
        currentLine = data.index;
        storyLines[currentLine].style.display = "block";
        storyLines[currentLine].style.opacity = "0"; // 透明にしてから表示
        storyLines[currentLine].style.transition = "opacity 0.5s ease-in";
        storyLines[currentLine].style.opacity = "1";

        console.log(`✅ ストーリー更新: 現在の行 (${currentLine}): ${storyLines[currentLine].textContent}`);
        isProcessing = false;
    }, 500);
});

socket.on("story-end", () => {
    storyContainer.style.transition = "opacity 0.5s ease-out";
    storyContainer.style.opacity = "0";

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
