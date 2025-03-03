console.log("死後の世界.jsがロードされました")
// HPが0になったときの処理
function checkDeath(playerID, roomID) {
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
    saveCardForPlayer(playerID, roomID, 999);
    
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
function saveCardForPlayer(playerID, roomID, cardID) {
    console.log(`🃏 カード ${cardID} をプレイヤー ${playerID} に保存`);
    
    fetch("https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/save_card_for_die.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            playerToken: window.playerToken,
            roomID: roomID,
            cardID: cardID
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(`✅ カード ${cardID} をプレイヤー ${playerID} に付与成功`);
        } else {
            console.error(`❌ カード ${cardID} の保存に失敗:`, data.error);
        }
    })
    .catch(error => console.error("❌ カード保存エラー:", error));
}
