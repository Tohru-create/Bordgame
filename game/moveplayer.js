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


function checkTileEvent(x, y, mapID, playerID, playerToken) {
    if (!mapConfig[mapID]) {
        console.error(`❌ mapConfig に ${mapID} のデータがありません`);
        return;
    }

    const currentTile = mapConfig[mapID].tiles.find(tile => tile.x === x && tile.y === y);
    if (currentTile) {
        console.log(`🚩 移動後のマス: (${x}, ${y}) => タイプ: ${currentTile.type}`);

        switch (currentTile.type) {
            case "trap":
                console.log("⚠️ 罠にかかった！");
                triggerTrapEvent(playerID);
                break;
                case "card":
                    console.log("🃏 カードイベント発生！");
                    triggerCardEvent(playerID, playerToken, roomID, "normal"); // 🔧 修正
                    break;                
            case "rare-card":
                console.log("🌟 レアカードを入手！");
                triggerCardEvent(playerID, playerToken,roomID,  "rare");
                break;
            case "epic-card":
                console.log("🌟 エピックカードを入手！");
                triggerCardEvent(playerID, playerToken,roomID,  "epic");
                break;
            case "legendary-card":
                console.log("🌟 レジェンダリーカードを入手！");
                triggerCardEvent(playerID, playerToken, roomID, "legendary");
                break;
            case "mythic":
                console.log("現象が発生します");
                triggerMythic(playerID);
                break;
            case "monster":
                console.log(" 野生の敵とエンカウントした！");
                triggerMonsterEvent(playerID);
                break;
            case "boss":
                console.log("👹 ボス戦開始！");
                triggerBossEvent(playerID);
                break;
            case "goal":
                console.log("🏁 ゴール！");
                triggerGoalEvent(playerID);
                break;
            default:
                console.log("🔲 通常マス");
                break;
            // モンスターます追加しとけ
        }
    } else {
        console.log("🔲 通常マス (タイルデータなし)");
    }
}

// 罠イベント
function triggerTrapEvent(playerID) {
    alert("罠にかかった！");
    playerEnergy = Math.max(playerEnergy - 20, 0);
    updateEnergy(playerID, -20);
}

// カードイベント (レアリティに応じてランダム取得)
function triggerCardEvent(playerID, playerToken, roomID, rarity) {
    if (!window.allCards) {
        console.error("❌ allCards がロードされていません");
        return;
    }

    const filteredCards = Object.entries(window.allCards).filter(([id, card]) => card.rarity === rarity);
    
    if (filteredCards.length === 0) {
        alert("カードが見つかりません");
        return;
    }

    const [cardID, randomCard] = filteredCards[Math.floor(Math.random() * filteredCards.length)];

    alert(`${randomCard.name} を獲得！`);

    const requestData = {
        playerID: userID,
        token: token,
        roomID: roomID,
        cardID: cardID
    };

    console.log("📤 送信データ:", JSON.stringify(requestData, null, 2)); // JSONの整形表示

    fetch("https://tohru-portfolio.secret.jp/bordgame/game/cardsystem/update_cards.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
    })
    .then(response => response.text()) // JSONでなくテキストで取得
    .then(text => {
        console.log("📥 サーバーレスポンス:", text); // レスポンスの中身を確認
        return JSON.parse(text);
    })
    .then(data => {
        if (data.success) {
            console.log(`✅ ${randomCard.name} (ID: ${cardID}) がプレイヤー ${userID} に追加されました！`);
        } else {
            console.error("❌ カード更新に失敗:", data.error);
        }
    })
    .catch(error => console.error("❌ サーバーエラー:", error));
}

// 雑魚敵戦
function triggerMonsterEvent(playerID) {
    alert("戦闘が始まる！");
}

// ボス戦
function triggerBossEvent(playerID) {
    alert("ボス戦が始まる！");
}

// ゴール
function triggerGoalEvent(playerID) {
    alert("ゴールに到達！");
}

// Mythicイベント
function triggerMythic(playerID) {
    alert("Mythicイベント発生！");
}
