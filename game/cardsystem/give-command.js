const giveCardAPI = "https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/give_card.php";
window.allcardsgive = "allcardsgive";

/**
 * Console から `/give <user_id> <card_id>` または `/give <user_id> allcardsgive` を実行可能
 * @param {number} userID - 付与対象のユーザーID
 * @param {string|number} cardID - 付与するカードのID（例: "010"）または `allcardsgive` で全付与
 */
async function give(userID, cardID) {
    const room = new URLSearchParams(window.location.search).get("room");
    if (!room) {
        console.error("❌ ルームIDが見つかりません");
        return;
    }

    // **パスワードを1回だけ入力**
    let password = sessionStorage.getItem("adminPassword");
    if (!password) {
        password = prompt("管理者パスワードを入力してください:");
        if (!password) {
            console.error("❌ パスワードが入力されていません");
            return;
        }
        sessionStorage.setItem("adminPassword", password); // **セッション中は保存**
    }

    // **すべてのカードを付与する処理**
    if (cardID === allcardsgive) {
        console.log(`🛠 [DEBUG] 全カードを user_id ${userID} に付与中...`);

        for (let id of Object.keys(allCards)) {
            await give(userID, id, password); // **1回入力したパスワードを使う**
        }

        console.log(`✅ user_id ${userID} に全カードを付与しました！`);
        return;
    }

    // **cardID を 3桁の文字列に変換**
    cardID = cardID.toString().padStart(3, "0");

    console.log(`🛠 [DEBUG] カード付与中... (User: ${userID}, Card: ${cardID})`);

    const response = await fetch(giveCardAPI, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ 
            room: room, 
            user_id: userID, 
            card_id: cardID, 
            password: password // **1回入力したパスワードを使う**
        }),
    });

    const data = await response.json();
    if (data.success) {
        console.log(`✅ カード ${cardID} を user_id ${userID} に付与しました！`);
    } else {
        console.error(`❌ カード付与失敗: ${data.error}`);
        sessionStorage.removeItem("adminPassword"); // **パスワードが間違っていたら削除**
    }
}

// **Console から `give(1, "015")` や `give(1, allcardsgive)` で実行できるようにする**
window.give = give;
