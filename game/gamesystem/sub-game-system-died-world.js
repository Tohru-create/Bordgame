// HPが0になったときの処理
function checkDeath(playerID, roomID) {
    fetch(`https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/heart_controll.php?id=${playerID}&roomID=${roomID}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success" && data.hp <= 0) {
                handlePlayerDeath(playerID, roomID);
            }
        })
        .catch(error => console.error("Error fetching HP:", error));
}

// 死亡処理
function handlePlayerDeath(playerID, roomID) {
    console.log(`💀 プレイヤー ${playerID} が死亡しました`);
    
    // サーバーに死亡通知を送る
    socket.emit("playerDied", { playerID, roomID });
    
    // 墓地マップに移動
    socket.emit("playerWarped", { playerID, roomID, newMapID: "map-00" });
    
    // Card ID 999 を取得（後で実装）
    socket.emit("receiveCard", { playerID, roomID, card: 999 });
}

// WebSocket で死亡通知を受信
socket.on("playerDied", (data) => {
    if (data.playerID === window.userID) {
        alert("あなたは死亡し、墓地に転送されました。");
    } else {
        console.log(`💀 ${data.playerID} が死亡しました。`);
    }
});

// サーバーからの墓地転送を受信
socket.on("playerWarped", (data) => {
    if (data.playerID === window.userID) {
        console.log(`📌 ${data.playerID} が墓地に移動しました。`);
        document.getElementById("currentMapDisplay").textContent = "map-00";
    }
});
