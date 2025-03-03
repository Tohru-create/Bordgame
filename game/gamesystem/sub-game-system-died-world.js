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
    warpToGraveyard(playerID, roomID);
    socket.emit("receiveCard", { playerID, roomID, card: 999 });
}
// プレイヤーを墓地 (map-00) にワープさせる
function warpToGraveyard(playerID, roomID) {
    console.log(`🚀 墓地へワープ: playerID=${playerID}, roomID=${roomID}`);
    
    socket.emit("playerWarped", {
        room: roomID,
        playerID: playerID,
        newMapID: "map-00",
        token: window.playerToken
    });
    
    updatePlayerMap("map-00");
    changeMap("map-00");
}