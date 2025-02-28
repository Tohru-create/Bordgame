console.log("死後の世界.jsがロードされました")
// HPが0になったときの処理
function checkDeath(playerID, roomID) {
    console.log(`🛠️ checkDeath 実行: playerID=${playerID}, roomID=${roomID}`);  // ← デバッグ用ログ追加
    fetch(`https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/heart_controll.php?id=${playerID}&roomID=${roomID}`)
        .then(response => response.json())
        .then(data => {
            console.log("🔍 HPデータ取得:", data);  // ← HPの値を確認
            if (data.status === "success" && data.hp <= 0) {
                handlePlayerDeath(playerID, roomID);
            }
        })
        .catch(error => console.error("❌ Error fetching HP:", error));
}


// 死亡処理
function handlePlayerDeath(playerID, roomID) {
    console.log(`💀 handlePlayerDeath 実行: playerID=${playerID}, roomID=${roomID}`);  // ← デバッグ用ログ追加
    socket.emit("playerDied", { playerID, roomID });
    socket.emit("playerWarped", { playerID, roomID, newMapID: "map-00" });
    socket.emit("receiveCard", { playerID, roomID, card: 999 });
}


socket.on("playerDied", (data) => {
    console.log(`🛑 サーバー: playerDied 受信 playerID=${data.playerID}, roomID=${data.roomID}`);  // ← デバッグ用ログ追加

    if (!rooms[data.roomID] || !rooms[data.roomID].players[data.playerID]) {
        console.warn(`⚠️ サーバー: 該当プレイヤーが見つからない roomID=${data.roomID}, playerID=${data.playerID}`);
        return;
    }

    rooms[data.roomID].players[data.playerID].mapID = "map-00";
    io.to(data.roomID).emit("playerDied", { playerID: data.playerID });
    io.to(data.roomID).emit("playerWarped", { playerID: data.playerID, newMapID: "map-00" });
    io.to(data.roomID).emit("receiveCard", { playerID: data.playerID, card: 999 });
});


// サーバーからの墓地転送を受信
socket.on("playerWarped", (data) => {
    if (data.playerID === window.userID) {
        console.log(`📌 ${data.playerID} が墓地に移動しました。`);
        document.getElementById("currentMapDisplay").textContent = "map-00";
    }
});
