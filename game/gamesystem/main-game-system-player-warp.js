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
    updateEnergy(0);

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

// ✅ ワープ処理
function warpToMap(targetMap) {
    console.log(`🚀 ワープ実行: ${targetMap}`);

    // **WebSocketでサーバーに通知**
    socket.emit("playerWarped", {
        room: roomID,
        playerID: userID,
        newMapID: targetMap,
        token: playerToken
    });

    // **プレイヤーのマップを変更**
    changeMap(targetMap);
}

// ✅ グローバル関数化
window.useWarpItem = useWarpItem;
window.warpToMap = warpToMap;
