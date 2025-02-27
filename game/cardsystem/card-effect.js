function useCardById(cardId) {
    console.log(`🃏 カード使用: ID=${cardId} (${allCards[cardId]?.name})`);

    switch (cardId) {
        case "1000": // ✅ 時空間転送装置（ワープ）
            selectWarpType();
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

function selectWarpType() {
    if (playerEnergy < 40) {
        alert("⚠️ エネルギーが足りません！（最低40必要）");
        return;
    }

    const choice = prompt("使用するワープの種類を選んでください: 1. ランダムワープ (40) / 2. 指定ワープ (100)");

    if (choice === "1") {
        warpWithEnergy(40, "random");
    } else if (choice === "2") {
        warpWithEnergy(100, "select");
    } else {
        alert("⚠️ 無効な選択です！");
    }
}
