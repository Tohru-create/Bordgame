// ✅ エネルギーを管理する変数
let playerEnergy = 0;
const energyMax = 100;

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

// ✅ Console コマンドからエネルギーを増やす関数（関数名を `energyCommand` に変更）
window.giveenergy = function (userID, value) {
    if (!userID || isNaN(value)) {
        console.error("❌ 無効なパラメータ: energyCommand(userID, value) を使用してください");
        return;
    }

    console.log(`🔋 ${userID} のエネルギーを ${value} 増加`);
    updateEnergy(Number(value));
};




const selectedMaps = ["map-01", "map-02", "map-03", "map-04", "map-05", "map-06", "map-07", "map-08"];
function warpToMap(targetMap) {
    console.log(`🚀 ワープ実行: ${targetMap}`);

    fetch("https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/update_player_map.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            token: playerToken,
            newMapID: targetMap,
            room: roomID
        }).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error("warp_playerから❌ データベース更新失敗:", data.error);
            return;
        }

        // **WebSocketで他プレイヤーに通知**
        socket.emit("playerWarped", {
            room: roomID,
            playerID: userID,
            newMapID: targetMap,
            token: playerToken
        });

        // **プレイヤーのマップを変更**
        changeMap(targetMap);
    })
    .catch(error => console.error("❌ update_map.php エラー:", error));
}

// ✅ ランダムワープ処理（エネルギー40消費）
function randomWarp() {
    if (playerEnergy < 40) {
        alert("⚠️ エネルギーが足りません！（40必要）");
        return;
    }

    playerEnergy -= 40;
    updateEnergy(0);

    const randomMap = selectedMaps[Math.floor(Math.random() * selectedMaps.length)];
    warpToMap(randomMap);
    console.log(`🚀 ランダム転送: ${randomMap}`);
}

// ✅ 指定ワープ処理（エネルギー100消費）
function selectWarp() {
    if (playerEnergy < 100) {
        alert("⚠️ エネルギーが足りません！（100必要）");
        return;
    }

    const targetMap = prompt("転送先のマップを選んでください: " + selectedMaps.join(", "));
    if (!selectedMaps.includes(targetMap)) {
        alert("⚠️ 無効なマップです！");
        return;
    }

    playerEnergy -= 100;
    updateEnergy(0);
    warpToMap(targetMap);
    console.log(`🚀 指定転送: ${targetMap}`);
}

// ✅ グローバルスコープに登録して `main.js` や `sub-game-system-inventory.js` から呼び出せるようにする
window.warpToMap = warpToMap;
window.randomWarp = randomWarp;
window.selectWarp = selectWarp;
