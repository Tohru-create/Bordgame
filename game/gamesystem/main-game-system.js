let currentTurn = 0;
let activeRoom = null;
let turnTimerInterval = null; // 🎯 インターバル管理用変数

// 🎮 ゲーム開始
socket.on("startGame", (data) => {
    if (!data || !data.roomID || !data.players) {
        console.error("❌ startGame のデータが不正:", data);
        return;
    }

    console.log(`🎯 ゲーム開始 - ルーム: ${data.roomID}`);
    console.log("📡 受信したプレイヤーデータ:", data.players);

    // 🎯 全プレイヤー情報を保存
    let players = {};

    Object.entries(data.players).forEach(([playerID, playerData]) => {
        players[playerID] = {
            id: playerID, 
            username: playerData.username
        };
    });
    console.log("✅ 保存したプレイヤーリスト:", players);

    activeRoom = data.roomID;
    document.getElementById("gameStatus").textContent = "🎮 ゲームが開始されました！";
    board.style.display = "grid";
    drawBoard();
});

// 🎯 ターン開始
socket.on("startTurn", (data) => {
    console.log(`🔄 クライアント側でターン開始を受信: ${data.turn}`);
    document.getElementById("gameStatus").textContent = `🎮 ターン ${data.turn} 開始！`;
    currentTurn = data.turn;
    showTurnTimerBar();
});


// 🎯 タイムバーを表示して 60 秒で減少
function showTurnTimerBar() {
    const timerContainer = document.getElementById("turnTimerContainer");
    const timerBar = document.getElementById("turnTimerBar");
    const timerLabel = document.getElementById("turnTimerLabel");

    if (timerContainer && timerBar && timerLabel) {
        timerContainer.style.display = "block";
        timerBar.style.width = "100%";
        timerLabel.textContent = `残り時間: 60s`;

        setTimeout(() => {
            timerBar.style.transition = "width 60s linear";
            timerBar.style.width = "0%";
        }, 50);

        let remainingTime = 60;

        // 🎯 すでに動作しているタイマーがあればリセット
        if (turnTimerInterval) clearInterval(turnTimerInterval);

        turnTimerInterval = setInterval(() => {
            remainingTime--;
            timerLabel.textContent = `残り時間: ${remainingTime}s`;

            if (remainingTime <= 0) {
                clearInterval(turnTimerInterval);
                timerLabel.textContent = "🛑 ターン終了！";
            }
        }, 1000);
    } else {
        console.error("❌ タイムバー要素が見つかりません");
    }
}

// 🎯 ターン終了処理
socket.on("endTurn", (data) => {
    console.log(`🛑 ターン ${data.turn} 終了`);
    document.getElementById("gameStatus").textContent = "🛑 ターン終了！";

    // 🎯 タイムバーを非表示 & インターバル停止
    const timerContainer = document.getElementById("turnTimerContainer");
    if (timerContainer) timerContainer.style.display = "none";

    if (turnTimerInterval) clearInterval(turnTimerInterval);
});
socket.on("endGame", () => {
    document.getElementById("gameStatus").textContent = "🛑 ゲームが終了しました";
    board.style.display = "none";

    if (!window.roomID) {
        console.error("roomID が取得できませんでした");
        return;
    }

    // `delete.php` に roomID を送信して削除
    fetch("https://tohru-portfolio.secret.jp/bordgame/admin/delete.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ roomId: window.roomID }) // `window.roomID` を利用
    })
    .then(response => response.text()) // まずテキストとして取得
    .then(text => {
        try {
            const data = JSON.parse(text); // JSON に変換
            if (data.success) {
                console.log(`ルーム ${window.roomID} 削除完了`);
            } else {
                console.error("ルーム削除エラー:", data.error);
            }
        } catch (error) {
            console.error("JSONパースエラー:", text); // 何が返ってきているか表示
        }
    })
    .finally(() => {
        setTimeout(() => {
            window.location.href = "https://tohru-portfolio.secret.jp/bordgame/user/login.html";
        }, 2000); // 2秒後にリダイレクト
    });
});
