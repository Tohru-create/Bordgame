function useCardById(cardId) {
    console.log(`🃏 カード使用: ID=${cardId} (${allCards[cardId]?.name})`);

    switch (cardId) {
        case "1000": // ✅ 時空間転送装置
            if (playerEnergy >= 100) {
                selectWarp(); // `main-game-system-player-warp.js` の関数を呼び出す
            } else if (playerEnergy >= 40) {
                randomWarp(); // `main-game-system-player-warp.js` の関数を呼び出す
            } else {
                alert("⚠️ エネルギーが足りません！");
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
