const socket = io("https://bordgame.onrender.com");


// Token取得関数
function getTokenFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
}

// 🎯 URL から `token` を取得し、`sessionStorage` に保存
const token = getTokenFromURL();

if (token) {
    console.log("✅ URL から取得した token:", token);
    sessionStorage.setItem("playerToken", token);
} else {
    console.error("❌ トークンが見つかりません");
}

let players = {};  // 全プレイヤー情報
let currentPlayer = null;  // 自分のプレイヤーデータ
const board = document.getElementById("board");

// 🎯 `sessionStorage` から `token` を取得
const playerToken = sessionStorage.getItem("playerToken");

// `session.php` に `token` を送信し、自分のデータを取得
fetch("session.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ token: playerToken }) // ← `token` を送信
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        players = data.players;  // 全プレイヤーデータ
        currentPlayer = data.currentPlayer;  // 🎯 自分のプレイヤーデータ

        console.log("✅ 自分のプレイヤーデータ:", currentPlayer);
        drawBoard();
    } else {
        console.error("プレイヤーデータ取得失敗:", data.error);
    }
});
function drawBoard() {
    console.log("📌 drawBoard() 実行");
    board.innerHTML = "";

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            let playerInCell = false;
            Object.values(players).forEach(player => {
                if (player.x == x && player.y == y) {
                    playerInCell = true;
                    const playerElement = document.createElement("div");
                    playerElement.classList.add("player");
                    playerElement.textContent = "■";
                    playerElement.style.color = (player.token == currentPlayer.token) ? "blue" : "red";
                    cell.appendChild(playerElement);
                }
            });

            if (!playerInCell) {
                cell.style.backgroundColor = "#ddd"; // 空のセルを明るい色にする
            }

            board.appendChild(cell);
        }
    }
}
function movePlayer(steps) {
    if (!currentPlayer) {
        console.error("❌ 自分のプレイヤーデータが見つかりません");
        return;
    }

    let newX = currentPlayer.x;
    let newY = currentPlayer.y;

    for (let i = 0; i < Math.abs(steps); i++) {
        if (steps > 0) {
            if (newY % 2 === 0) {
                if (newX < 9) {
                    newX++;
                } else if (newY < 9) {
                    newY++;
                }
            } else {
                if (newX > 0) {
                    newX--;
                } else if (newY < 9) {
                    newY++;
                }
            }
        } else {
            if (newY % 2 === 0) {
                if (newX > 0) {
                    newX--;
                } else if (newY > 0) {
                    newY--;
                }
            } else {
                if (newX < 9) {
                    newX++;
                } else if (newY > 0) {
                    newY--;
                }
            }
        }
    }

    console.log(`📌 movePlayer() 実行: id=${currentPlayer.id}, x=${newX}, y=${newY}`);

    // 🎯 WebSocket でサーバーに移動を通知
    socket.emit("movePlayer", { id: currentPlayer.id, x: newX, y: newY });

    // 自分のデータを更新
    currentPlayer.x = newX;
    currentPlayer.y = newY;

    drawBoard();
}


function drawBoard() {
    board.innerHTML = "";

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            let playerInCell = false;
            Object.values(players).forEach(player => {
                if (player.x == x && player.y == y) {
                    playerInCell = true;
                    const playerElement = document.createElement("div");
                    playerElement.classList.add("player");
                    playerElement.textContent = "■";
                    playerElement.style.color = (player.token == currentPlayer.token) ? "blue" : "red";
                    cell.appendChild(playerElement);
                }
            });

            if (!playerInCell) {
                cell.style.backgroundColor = "#ddd"; // 空のセルを明るい色にする
            }

            board.appendChild(cell);
        }
    }
}



socket.on("startGame", () => {
    console.log("🎮 ゲームが開始されました！");
    document.getElementById("gameStatus").textContent = "🎮 ゲームが開始されました！";
    document.getElementById("board").style.display = "grid";
    
    drawBoard(); 
});

socket.on("endGame", () => {
    document.getElementById("gameStatus").textContent = "🛑 ゲームが終了しました";
    document.getElementById("board").style.display = "none";
});

// 🔹 カードやイベント処理
const diceButton = document.getElementById("rollDice");
const moveForwardButton = document.getElementById("moveForward");
const moveBackwardButton = document.getElementById("moveBackward");
const trapButton = document.getElementById("trapButton");
const diceResult = document.getElementById("diceResult");
const statusText = document.getElementById("status");

// 🎲 サイコロを振る処理
diceButton.addEventListener("click", () => {
    const dice = Math.floor(Math.random() * 6) + 1;
    diceResult.textContent = `出目: ${dice}`;
    movePlayer(dice);
});

// 🔹 2マス進む
moveForwardButton.addEventListener("click", () => {
    movePlayer(2);
});

// 🔹 2マス戻る
moveBackwardButton.addEventListener("click", () => {
    movePlayer(-2);
});

// 🔹 罠（1ターン休み）
trapButton.addEventListener("click", () => {
    statusText.textContent = "状態: 1ターン休み中";
    alert("罠にかかった！次のターンは休み");
});
