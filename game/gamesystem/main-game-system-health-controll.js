function damage(amount) {
    if (typeof window.userID === "undefined" || typeof window.roomID === "undefined") {
        console.error("userID or roomID is not set");
        return;
    }

    console.log("Sending damage request:", {
        id: window.userID,
        roomID: window.roomID,
        change: -amount
    });

    fetch("https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/heart_controll.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: window.userID,
            roomID: window.roomID,
            change: -amount
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data);
        if (data.status === "success") {
            loadHP(); // 変更後の HP を再取得
        } else {
            console.error("HP 更新に失敗:", data.message);
        }
    })
    .catch(error => console.error("HP 更新エラー:", error));
}

function heal(amount) {
    if (typeof window.userID === "undefined" || typeof window.roomID === "undefined") {
        console.error("userID or roomID is not set");
        return;
    }

    console.log("Sending heal request:", {
        id: window.userID,
        roomID: window.roomID,
        change: amount
    });

    fetch("https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/heart_controll.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: window.userID,
            roomID: window.roomID,
            change: amount
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data);
        if (data.status === "success") {
            loadHP(); // 変更後の HP を再取得
        } else {
            console.error("HP 更新に失敗:", data.message);
        }
    })
    .catch(error => console.error("HP 更新エラー:", error));
}

// ボタンにイベントを追加
document.getElementById("increasehp").addEventListener("click", () => heal(1));
document.getElementById("decreasehp").addEventListener("click", () => damage(1));


function loadHP() {
    if (typeof window.userID === "undefined" || typeof window.roomID === "undefined") {
        console.error("userID or roomID is not set");
        return;
    }

    fetch(`https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/heart_controll.php?id=${window.userID}&roomID=${window.roomID}`)
        .then(response => response.json())
        .then(data => {
            // console.log("Server Response:", data); // 🔍 デバッグ用
            if (data.status === "success") {
                updateHearts(data.hp);
            } else {
                console.error("Failed to load HP:", data.message);
            }
        })
        .catch(error => console.error("Error fetching HP:", error));
}

// ハートアイコンを表示する関数
function updateHearts(hp) {
    let hpContainer = document.getElementById("hp-container");
    hpContainer.innerHTML = ""; // 一旦クリア

    for (let i = 0; i < hp; i++) {
        let heart = document.createElement("span");
        heart.innerHTML = "❤️"; // ハートアイコン
        heart.style.fontSize = "24px"; // 大きさ調整
        heart.style.marginRight = "5px";
        hpContainer.appendChild(heart);
    }
}

// ページ読み込み時にHPを取得
document.addEventListener("DOMContentLoaded", loadHP);
