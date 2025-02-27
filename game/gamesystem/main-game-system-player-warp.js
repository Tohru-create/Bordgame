// ✅ WebSocket で `selectedMaps` を受け取る
socket.on("mapControlSelectedMaps", (data) => {
    console.log("🗺️ サーバーから `selectedMaps` を受信:", data);

    if (!data.selectedMaps || !Array.isArray(data.selectedMaps)) {
        console.error("❌ 無効なマップデータを受信しました:", data);
        return;
    }

    // **グローバル変数 `selectedMaps` にセット**
    selectedMaps = data.selectedMaps;
    console.log("✅ マップデータ更新完了:", selectedMaps);
});

// ✅ エネルギーバーを更新する関数
function updateEnergy(value) {
    playerEnergy = Math.min(playerEnergy + value, energyMax);
    
    const energyBar = document.getElementById("energy-bar");
    if (energyBar) {
        energyBar.style.width = `${(playerEnergy / energyMax) * 100}%`;
    } else {
        console.error("❌ energy-bar が見つかりません。index.html に #energy-container を追加しましたか？");
    }

    console.log(`🔋 現在のエネルギー: ${playerEnergy}`);
}
window.giveenergy = function (userID, value) {
    if (!userID || isNaN(value)) {
        console.error("❌ 無効なパラメータ: giveenergy(userID, value) を使用してください");
        return;
    }

    console.log(`🔋 ${userID} のエネルギーを ${value} 増加`);
    updateEnergy(Number(value));
};


// ✅ ワープアイテム使用後にエネルギー消費を決定
function useWarpItem() {
    if (playerEnergy < 40) {
        alert("⚠️ エネルギーが足りません！（最低40必要）");
        return;
    }

    // **選択肢を動的に設定**
    const choice = prompt("使用するワープの種類を選んでください: 1. ランダムワープ (40) / 2. 指定ワープ (100)");

    if (choice === "1") {
        warpWithEnergy(40, "random");
    } else if (choice === "2") {
        warpWithEnergy(100, "select");
    } else {
        alert("⚠️ 無効な選択です！");
    }
}

// ✅ エネルギー消費を考慮してワープを実行
function warpWithEnergy(cost, type) {
    if (playerEnergy < cost) {
        alert(`⚠️ エネルギーが足りません！（${cost}必要）`);
        return;
    }

    playerEnergy -= cost;
    updateEnergy(0); // 🔥 エネルギーバーの更新を追加

    if (type === "random") {
        const randomMap = selectedMaps[Math.floor(Math.random() * selectedMaps.length)];
        warpToMap(randomMap);
        console.log(`🚀 ランダム転送: ${randomMap}`);
    } else if (type === "select") {
        const targetMap = prompt("転送先のマップを選んでください: " + selectedMaps.join(", "));
        if (!selectedMaps.includes(targetMap)) {
            alert("⚠️ 無効なマップです！");
            return;
        }

        warpToMap(targetMap);
        console.log(`🚀 指定転送: ${targetMap}`);
    }
}

function warpToMap(targetMap) {
    console.log(`🚀 ワープ実行: ${targetMap}`);

    // **WebSocketでサーバーに通知**
    socket.emit("playerWarped", {
        room: roomID,
        playerID: userID,
        newMapID: targetMap,
        token: playerToken
    });

    // **データベースに現在のマップを保存**
    updatePlayerMap(targetMap);
    changeMap(targetMap);
}

function updatePlayerMap(targetMap) {
    const sendData = new URLSearchParams({
        token: playerToken,
        newMapID: targetMap, // ✅ ワープ後のマップIDを送信
        room: roomID
    });

    console.log("📡 update_player_map.php にデータを送信開始:", sendData.toString());

    fetch(`https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/update_player_map.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: sendData.toString()
    })
    .then(response => response.json())
    .then(saveData => {
        console.log("📡 update_player_map.php のレスポンス:", saveData);
        if (!saveData.success) {
            console.error("❌ データベース更新失敗:", saveData.error);
        } else {
            console.log("✅ データベースにワープ後のマップ情報を保存:", saveData);
        }
    })
    .catch(error => {
        console.error("❌ update_player_map.php 取得エラー:", error);
    });
}


// ✅ グローバル関数化
window.useWarpItem = useWarpItem;
window.warpToMap = warpToMap;
