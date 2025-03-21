const socket = io("https://bordgame.onrender.com", {
    transports: ["websocket"], 
    withCredentials: true 
});

function getParamFromURL(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}
const roomID = getParamFromURL("room");
const token = getParamFromURL("token"); 
const userID = getParamFromURL("user_id");
const username = getParamFromURL("username");
const hostsettings = getParamFromURL("hostsettings");
window.roomID = roomID; 
window.playerToken = token;
window.userID = userID;
window.username = username;
window.hostsettings = hostsettings;


if (token) {
    // console.log("✅ URL から取得した token:", token);
    sessionStorage.setItem("playerToken", token);
} else {
    console.error("❌ トークンが見つかりません");
}
if (roomID) {
    // console.log("✅ ルームID取得:", roomID);
} else {
    console.error("❌ ルームIDが見つかりません");
}
socket.on("connect", () => {
    console.log("✅ WebSocket 接続成功");
    if (roomID) {
        console.log(`🔗 WebSocket 経由でルーム ${roomID} に参加`);
        console.log(userID)
        socket.emit("joinRoom", {
            room: roomID,
            playerID: userID,
            username: username, // 🎯 ここが適切な値か確認！
            mapID: currentMapID
        });             
    }
});

// 🎯 プレイヤー情報
let players = {};
let currentPlayer = null; 

const board = document.getElementById("board");
const playerToken = sessionStorage.getItem("playerToken");


console.log("📌 送信する token:", playerToken);

console.log("📡 ルームの参加状況を確認します");
socket.emit("checkRoomStatus", { room: roomID });
socket.on("roomStatus", (data) => {
    console.log("✅ [DEBUG] ルームの参加状況を受信:", JSON.stringify(data, null, 2));

    if (data.clients.length === 0) {
        console.warn(`⚠️ ルーム ${data.roomID} には現在誰も参加していません`);
    } else {
        console.log(`✅ ルーム ${data.roomID} の現在の参加者:`, data.clients);
    }
});

// 🎯 `session.php` へルームID付きでリクエストを送る
fetch(`https://tohru-portfolio.secret.jp/bordgame/game/session.php?room=${roomID}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: playerToken })
})
.then(response => response.json())
.then(data => {
    console.log("📌 session.php のレスポンス:", data);
    if (data.success) {
        players = {};

        data.players.forEach(player => {
            players[player.id] = player;
        });

        currentPlayer = data.currentPlayer;

        if (!currentPlayer) {
            console.error("❌ currentPlayer が取得できていません");
            return;
        }

        console.log("✅ 自分のプレイヤーデータ:", currentPlayer);
        console.log("✅ 現在の全プレイヤーデータ:", players);


        let hasRegistered = sessionStorage.getItem("hasRegistered") === "true"; // 🎯 ここで sessionStorage を利用

        socket.on("connect", () => {
            console.log("✅ WebSocket に接続成功:", socket.id);
            if (!hasRegistered) {
                hasRegistered = true;
                sessionStorage.setItem("hasRegistered", "true"); // 🎯 ここでフラグを保持
                socket.emit("registerPlayer", {
                    id: currentPlayer.id,
                    username: currentPlayer.username,
                    token: playerToken,
                    x: currentPlayer.x,
                    y: currentPlayer.y,
                    size: currentPlayer.size, 
                    room: roomID 
                });
            }
        });
        drawBoard();
    } else {
        console.error("❌ プレイヤーデータ取得失敗:", data.error);
    }
});

function drawBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    // 現在のマップ設定を取得
    const config = mapConfig[viewingMapID] || mapConfig["default"];
    const { width, height, tiles } = config;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            // タイル情報を取得
            const tile = tiles.find(t => t.x === x && t.y === y);
            if (tile) {
                cell.classList.add(`tile-${tile.type}`);
            }

            Object.values(players).forEach(player => {
                // ✅ 自分が見ているマップと同じマップにいるプレイヤーのみ表示
                if (player.mapID === viewingMapID && player.x === x && player.y === y) {
                    const playerElement = document.createElement("div");
                    playerElement.classList.add("player");
                    playerElement.textContent = player.username;

                    if (player.id === userID) {
                        playerElement.style.backgroundColor = "blue";
                    } else {
                        playerElement.style.backgroundColor = "red";
                    }

                    cell.appendChild(playerElement);
                }
            });

            board.appendChild(cell);
        }
    }
}



function updatePlayerData(callback) {
    fetch(`https://tohru-portfolio.secret.jp/bordgame/game/session.php?room=${roomID}`)
    .then(response => response.json())
    .then(data => {
        console.log("📌 最新のプレイヤーデータ取得:", data);

        if (data.success && data.players) {
            players = data.players; 
            console.log("✅ players 更新完了:", players);
            setTimeout(() => {
                if (callback) callback();
            }, 50);
        } else {
            console.error("❌ session.php からのデータ取得に失敗:", data.error);
        }
    })
    .catch(error => console.error("❌ session.php 取得エラー:", error));
}


let updatePlayersCount = 0;  // 🎯 何回 `updatePlayers` を受け取るか記録

socket.on("updatePlayers", (data) => {
    updatePlayersCount++;
    console.log(`📡 [updatePlayers] 受信 (${updatePlayersCount}回目):`, JSON.stringify(data, null, 2));

    if (!data || !data.roomID || !Array.isArray(data.players)) {
        console.error("❌ updatePlayers のデータ形式が不正:", data);
        return;
    }

    const roomData = data[`room_${roomID}`]; // 現在のルームのプレイヤーデータ
    players = {};

    data.players.forEach(player => {
        players[player.id] = {
            id: player.id,
            username: player.username,
            x: player.x,
            y: player.y,
            mapID: player.mapID || "map-01"
        };
    });

    window.latestPlayerData = players;
    console.log("✅ players 更新完了:", players);
    drawBoard();
});


function changeMap(mapId) {
    const maps = document.querySelectorAll(".map");
    maps.forEach((map) => {
        map.classList.remove("active");
    });
    document.getElementById(mapId).classList.add("active");
}

// 🎯 カードやイベント処理
const moveForwardButton = document.getElementById("moveForward");
const moveBackwardButton = document.getElementById("moveBackward");
const trapButton = document.getElementById("trapButton");
const diceResult = document.getElementById("diceResult");
const statusText = document.getElementById("status");


// 🔹 2マス進む
moveForwardButton.addEventListener("click", () => {
    movePlayer(2);
});

// 🔹 2マス戻る
moveBackwardButton.addEventListener("click", () => {
    movePlayer(-2);
});
let hasRolledDice = false;  // 🎯 1ターンに1回だけ振れるように管理


// サイコロ関連
const diceButton = document.getElementById("rollDice");
diceButton.addEventListener("click", () => {
    if (hasRolledDice) {
        alert("このターンではもうサイコロを振れません！");
        return;
    }
    // 🎯 サーバーに「サイコロを振る」リクエストを送る
    socket.emit("rollDice", { room: roomID, playerID: userID });
    hasRolledDice = true; // 🎯 クライアント側でもフラグを立てる
});

// 🎲 サーバーからのサイコロ結果を受信
socket.on("diceRolled", (data) => {
    console.log(`🎲 ${data.playerID} が ${data.roll} を出しました`);
    
    if (data.playerID === userID) {
        diceResult.textContent = `出目: ${data.roll}`;
        movePlayer(data.roll); // 🎯 出た目に基づいて移動
    }
});
socket.on("rollDenied", (data) => {
    alert(data.reason);
});

// 🎯 ターン終了時にフラグをリセット
socket.on("endTurn", () => {
    hasRolledDice = false;
});
