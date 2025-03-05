if (!roomID) {
    console.error("❌ ルームIDが見つかりません");
}
// ✅ エネルギーを管理する変数
let playerEnergy = 0;
const energyMax = 100;
function movePlayer(steps) {
    if (!playerToken || !roomID) {
        console.error("❌ プレイヤートークンまたはルームIDが見つかりません");
        return;
    }

    console.log(`📌 movePlayer() 実行: steps=${steps}, roomID=${roomID}`);

    fetch(`https://tohru-portfolio.secret.jp/bordgame/game/session.php?room=${roomID}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: playerToken })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error("❌ session.php から最新データの取得に失敗:", data.error);
            return;
        }

        let newX = data.currentPlayer.x;
        let newY = data.currentPlayer.y;
        let newMapID = data.currentPlayer.mapID || viewingMapID; // ✅ `viewingMapID` をフォールバック
        let playerID = data.currentPlayer.username || playerToken;

        console.log(`📌 最新の座標取得: x=${newX}, y=${newY}, mapID=${newMapID}, playerID=${playerID}`);

        for (let i = 0; i < Math.abs(steps); i++) {
            if (steps > 0) {
                if (newY % 2 === 0) { // 偶数行
                    if (newX < 14) newX++; // 右に進む (0～14 の範囲)
                    else if (newY < 9) newY++; // 次の行へ移動
                } else { // 奇数行
                    if (newX > 0) newX--; // 左に進む
                    else if (newY < 9) newY++; // 次の行へ移動
                }
            } else { // 逆方向
                if (newY % 2 === 0) { // 偶数行
                    if (newX > 0) newX--; // 左に戻る
                    else if (newY > 0) newY--; // 前の行へ移動
                } else { // 奇数行
                    if (newX < 14) newX++; // 右に戻る
                    else if (newY > 0) newY--; // 前の行へ移動
                }
            }
        }       

        console.log(`📌 新しい座標: x=${newX}, y=${newY}, mapID=${newMapID}`);

        const sendData = new URLSearchParams({
            token: playerToken,
            x: newX,
            y: newY,
            mapID: newMapID,
            room: roomID.replace("room_", "")
        });

        updateEnergy(Math.abs(steps));
        console.log(`🔋 現在のエネルギー: ${playerEnergy}`);

        console.log("📡 update_position.php にデータを送信開始:", sendData.toString());
        fetch(`https://tohru-portfolio.secret.jp/bordgame/game/update_position.php?${sendData.toString()}`, {
            method: "GET"
        })
        .then(response => response.json())
        .then(saveData => {
            console.log("📡 update_position.php のレスポンス:", saveData);
            if (!saveData.success) {
                console.error("❌ データベース更新失敗:", saveData.error);
            } else {
                console.log("✅ データベースにプレイヤー座標を保存:", saveData);
        
                console.log("📡 movePlayer 送信データ:", {
                    id: currentPlayer.id,  
                    token: playerToken,
                    x: newX,
                    y: newY,
                    mapID: newMapID,
                    room: roomID
                });

                socket.emit("movePlayer", {
                    id: currentPlayer.id,
                    token: playerToken,
                    x: newX,
                    y: newY,
                    mapID: newMapID,
                    room: roomID
                });

                updatePlayerData(drawBoard);
                checkTileEvent(newX, newY, newMapID);
            }
        })
        .catch(error => {
            console.error("❌ update_position.php 取得エラー:", error);
        });
    })
    .catch(error => console.error("❌ session.php 取得エラー:", error));
}



// 🎯 WebSocket で `playerMoved` を受け取ったら `session.php` を取得
socket.on("playerMoved", (data) => {
    console.log("🔍 `players` のデータ型:", typeof players);
    console.log("🔍 `players` の内容:", JSON.stringify(players, null, 2));
    console.log("📡 WebSocket 受信: playerMoved", data);
    console.log("👀 `players` の変更前:", JSON.stringify(players, null, 2));
    // IDが正しくあるかチェック
    if (!data.id) {
        console.error("❌ playerMoved のデータに ID がありません:", data);
        return;
    }

    // **ログでデータの変化を詳細に確認**
    console.log(`🔍 players[${data.id}] 変更前:`, JSON.stringify(players[data.id], null, 2));

    const playersArray = Object.values(players);
    const playerData = playersArray.find(p => p.id === data.id);
    if (!playerData) {
        console.error(`❌ players の中に ID ${data.id} のデータが見つかりません！`, players);
    } else {
        playerData.x = data.x;
        playerData.y = data.y;
        playerData.mapID = data.mapID;
    }
    

    console.log("✅ 更新後の players:", JSON.stringify(players, null, 2));
    drawBoard();
});



function checkTileEvent(x, y, mapID) {
    if (!mapConfig[mapID]) {
        console.error(`❌ mapConfig に ${mapID} のデータがありません`);
        return;
    }

    const currentTile = mapConfig[mapID].tiles.find(tile => tile.x === x && tile.y === y);
    if (currentTile) {
        console.log(`🚩 移動後のマス: (${x}, ${y}) => タイプ: ${currentTile.type}`);
        
        // マスのタイプごとにイベントを発生させる
        switch (currentTile.type) {
            case "trap":
                console.log("⚠️ 罠にかかった！");
                triggerTrapEvent();
                break;
            case "card":
                console.log("🃏 カードイベント発生！");
                triggerCardEvent();
                break;
            case "rare-card":
                console.log("🌟 レアカードを入手！");
                triggerRareCardEvent();
                break;
            case "epic-card":
                console.log("🌟 エピックカードを入手！");
                triggerEpicCardEvent();
                break;
            case "legendary-card":
                console.log("🌟 レジェンダリーカードを入手！");
                triggerLegenddaryCardEvent();
                break;
            case "mythic":
                console.log("現象が発生します");
                triggerMythic();
                break;
            case "boss":
                console.log("👹 ボス戦開始！");
                triggerBossEvent();
                break;
            case "goal":
                console.log("👹 ボス戦開始！");
                triggerGoalEvent();
                break;
            default:
                console.log("🔲 通常マス");
                break;
        }
    } else {
        console.log("🔲 通常マス (タイルデータなし)");
    }
}

// イベント処理の関数
function triggerTrapEvent() {
    alert("罠にかかった！エネルギーが減少！");
    playerEnergy = Math.max(playerEnergy - 20, 0);
    updateEnergy(0);
}

function triggerCardEvent() {
    alert("カードを引いた！");
    // ここにカードイベントの処理を追加
}

function triggerRareCardEvent() {
    alert("レアカードを引いた！");
    // ここにレアカードイベントの処理を追加
}

function triggerEpicCardEvent() {
    alert("エピックカードを引いた！");
    // ここにレアカードイベントの処理を追加
}
function triggerLegendaryCardEvent() {
    alert("レジェンダリーカードを引いた！");
    // ここにレアカードイベントの処理を追加
}
function triggerMythic() {
    alert("Mythic");
    // ここにレアカードイベントの処理を追加
}

function triggerBossEvent() {
    alert("ボス戦が始まる！");
    // ここにボス戦の処理を追加
}
function triggerGoalEvent() {
    alert("ボス戦が始まる！");
    // ここにボス戦の処理を追加
}

