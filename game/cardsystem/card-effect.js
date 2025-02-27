function useCardById(cardId) {
    console.log(`🃏 カード使用: ID=${cardId} (${allCards[cardId]?.name})`);

    switch (cardId) {
        case "999":  // ペナルティーカード
            disadvantage();
            break;

        case "1000": // ✅ 時空間転送装置（ワープ）
                if (playerEnergy >= 100 || playerEnergy >= 40) {
                    showWarpSelection();
                } else {
                    alert("⚠️ エネルギーが足りません！（最低40必要）");
                }
                break;

        case "009": // 例: 勇者の剣 (HP回復)
            alert("⚔️ 勇者の剣を装備しました！");
            break;

        case "010": // 例: 魔法の盾 (ダメージ軽減)
            alert("🛡 魔法の盾で防御力アップ！");
            break;

        default:
            alert(`🃏 ${allCards[cardId]?.name || "不明なカード"} を使用しました`);
            break;
    }
}

function showWarpSelection() {
    // 既存のワープ選択 UI があれば削除
    const existingUI = document.getElementById("warp-selection-container");
    if (existingUI) {
        existingUI.remove();
    }

    // ✅ UIの作成
    const warpUI = document.createElement("div");
    warpUI.id = "warp-selection-container";
    warpUI.innerHTML = `
        <div id="warp-selection">
            <h3>ワープ方法を選択</h3>
            <button id="random-warp-btn">🎲 ランダムワープ (40)</button>
            <button id="select-warp-btn">📍 指定ワープ (100)</button>
            <button id="cancel-warp-btn">❌ キャンセル</button>
        </div>
    `;

    // ✅ スタイリング (簡易的に)
    warpUI.style.position = "fixed";
    warpUI.style.top = "50%";
    warpUI.style.left = "50%";
    warpUI.style.transform = "translate(-50%, -50%)";
    warpUI.style.background = "rgba(255, 255, 255, 0.9)";
    warpUI.style.padding = "20px";
    warpUI.style.borderRadius = "10px";
    warpUI.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    warpUI.style.textAlign = "center";

    document.body.appendChild(warpUI);

    // ✅ ボタンのクリックイベントを設定
    document.getElementById("random-warp-btn").addEventListener("click", () => {
        warpWithEnergy(40, "random");
        warpUI.remove();
    });

    document.getElementById("select-warp-btn").addEventListener("click", () => {
        if (playerEnergy >= 100) {
            warpWithEnergy(100, "select");
            warpUI.remove();
        } else {
            alert("⚠️ エネルギーが足りません！（100必要）");
        }
    });

    document.getElementById("cancel-warp-btn").addEventListener("click", () => {
        warpUI.remove();
    });
}
