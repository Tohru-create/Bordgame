const express = require("express");
const path = require("path"); 
const axios = require("axios");  // ✅ `axios` を `server.js` でロード
const allCardModule = require(path.join(__dirname, "../game/cardsystem/all-card.js"))(axios); // ✅ `axios` を渡す
const { getPlayerCardsForRanking, allCards } = allCardModule;
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: ["https://tohru-portfolio.secret.jp"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
};

// ✅ `app` を定義した後に `cors` を適用
app.use(cors(corsOptions));

const io = socketIo(server, {
    cors: {
        origin: "https://tohru-portfolio.secret.jp",
        methods: ["GET", "POST"]
    }
});

const LOLLIPOP_API = "https://tohru-portfolio.secret.jp/bordgame/game/session.php";
let rooms = {}; // ルームごとのプレイヤーデータ { roomID: { playerID: {...} } }

// 🔹 プレイヤーがサーバーに接続
io.on("connection", async (socket) => {
    console.log(`✅ 新しいプレイヤーが接続: ${socket.id}`);

    socket.handshake.headers["Access-Control-Allow-Origin"] = "https://tohru-portfolio.secret.jp";
    socket.handshake.headers["Access-Control-Allow-Credentials"] = "true";

    console.log(`✅ プレイヤーが接続: ${socket.id}`);
    
    // 🎯 クライアントからマップ選択データを受信
    socket.on("mapSelection", (data) => {
        const { roomID, selectedMaps } = data;
    
        if (!roomID || !Array.isArray(selectedMaps)) {
            console.error("❌ 無効なマップ選択データ:", data);
            return;
        }
    
        console.log(`📡 [DEBUG] ルーム ${roomID} に選択されたマップ: ${JSON.stringify(selectedMaps)}`);
    
        // `rooms[roomID]` が存在しない場合、初期化する
        if (!rooms[roomID]) {
            rooms[roomID] = { selectedMaps: [], players: {}, host: null };
        }
    
        // `selectedMaps` を保存
        rooms[roomID].selectedMaps = selectedMaps;
    
        console.log(`✅ [DEBUG] mapSelection の後の rooms 状態:`, JSON.stringify(rooms[roomID], null, 2));
    
        io.to(roomID).emit("updateSelectedMaps", { selectedMaps });
    });     
    socket.onAny((event, ...args) => {
        console.log(`📡 [DEBUG] WebSocket イベント受信: ${event}`);
    });

    
    socket.on("joinRoom", (data) => {
        console.log("📡 joinRoom 受信:", data);
    
        if (!data.room || !data.playerID) {
            console.error("❌ joinRoom に無効なデータ:", data);
            return;
        }
    
        socket.join(data.room);
    
        // 🎯 `rooms[roomID]` が削除されていた場合でも、以前の `selectedMaps` を復元
        if (!rooms[data.room]) {
            console.warn(`⚠️ [WARNING] ルーム ${data.room} が存在しなかったため、新規作成`);
        
            const previousMaps = rooms[data.room]?.selectedMaps || [];  // 以前のマップ情報を取得
            rooms[data.room] = {
                selectedMaps: previousMaps,  // 以前のマップを保持
                players: {},
                host: data.playerID
            };
        }
        
        
        rooms[data.room].players[data.playerID] = {
            id: data.playerID,
            username: data.username || `Player${data.playerID}`,
            x: data.x || 0,
            y: data.y || 0,
            mapID: data.mapID || "map-01",  // ✅ 初期マップIDをセット
            socketId: socket.id,
        };
    
        console.log(`✅ 現在の rooms:`, JSON.stringify(rooms, null, 2));
        io.to(data.room).emit("updatePlayers", {
            roomID: data.room,
            players: Object.values(rooms[data.room].players), // ✅ 修正後の `players` データを送信
            host: rooms[data.room].host,
            selectedMaps: rooms[data.room].selectedMaps
        });
        
    });

const TURN_DURATION = 30000; // 60秒
socket.on("startGame", (data) => {
    const { room } = data;
    if (!room) return console.error("❌ startGame: ルームIDが指定されていません");

    console.log(`🎮 ルーム ${room} でゲーム開始（ストーリー開始）`);

    if (!rooms[room]) {
        rooms[room] = { players: {}, storyIndex: 0 };
    }
    rooms[room].storyIndex = 0;

    io.to(room).emit("showStory");
});

socket.on("story-progress", (data) => {
    console.log(`📡 サーバー: story-progress 受信 - ${data.index}`);
    
    // **すでに進んでいる場合は送信しない**
    if (!rooms[data.room] || rooms[data.room].storyIndex >= data.index) {
        return;
    }

    rooms[data.room].storyIndex = data.index;
    io.to(data.room).emit("story-progress", { index: data.index });
});


socket.on("story-end", (data) => {
    const { room } = data;
    if (!room) return;

    console.log(`📖 ルーム ${room} のストーリー終了`);
    startActualGame(room);
});

socket.on("story-skip", (data) => {
    const { room } = data;
    if (!room) return;

    console.log(`🚀 ストーリーがスキップされました（ルーム: ${room}）`);
    io.to(room).emit("story-skip"); // 全プレイヤーにスキップ通知
    startActualGame(room); // 即ゲーム開始
});

function startActualGame(room) {
    if (!rooms[room]) return console.error(`❌ ルーム ${room} が見つかりません`);

    console.log(`🚀 ルーム ${room} でゲームを開始`);
    
    io.to(room).emit("mapControlSelectedMaps", { selectedMaps: rooms[room].selectedMaps });
    io.to(room).emit("updateSelectedMaps", { selectedMaps: rooms[room].selectedMaps });
    io.to(room).emit("updatePlayers", {
        roomID: room,
        players: Object.values(rooms[room].players),
        host: rooms[room].host,
        selectedMaps: rooms[room].selectedMaps
    });
    io.to(room).emit("startGame", {
        roomID: room,
        players: rooms[room].players,
        selectedMaps: rooms[room].selectedMaps
    });

    console.log("✅ すべての `emit` が完了しました");
}

// 🎯 新しいターンの開始
function startNewTurn(room) {
    // console.log(`🔍 startNewTurn 実行: ルーム = ${room}`);

    // 🎯 ルームの存在チェック
    if (!rooms[room]) {
        console.error(`❌ ルーム ${room} が見つかりません！`);
        return;
    }

    // 🎯 `players` が undefined ならログを出力（復旧処理はしない）
    if (!rooms[room].players) {
        console.error(`❌ ルーム ${room} の players が undefined です`);
    }

    // console.log(`✅ ルーム ${room} の現在の状態:`, JSON.stringify(rooms[room], null, 2));

    rooms[room].turn++;
    Object.keys(rooms[room].players).forEach(playerID => {
        rooms[room].players[playerID].hasRolledDice = false;
    });

    // console.log(`🔄 ルーム ${room} のターン ${rooms[room].turn} 開始 - startTurn を送信`);
    io.to(room).emit("startTurn", { turn: rooms[room].turn });

    rooms[room].timer = setTimeout(() => {
        endTurn(room);
    }, TURN_DURATION);
}



// 🎲 サイコロを振る処理
socket.on("rollDice", (data) => {
    const { room, playerID } = data;
    
    if (!rooms[room] || !rooms[room].players[playerID]) {
        console.error(`❌ ルーム ${room} にプレイヤー ${playerID} が見つかりません`);
        return;
    }

    if (rooms[room].players[playerID].hasRolledDice) {
        socket.emit("rollDenied", { reason: "このターンではもうサイコロを振れません" });
        return;
    }

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    rooms[room].players[playerID].hasRolledDice = true;

    // console.log(`🎲 プレイヤー ${playerID} が ${diceRoll} を出しました`);

    io.to(room).emit("diceRolled", { playerID, roll: diceRoll });
    // すべてのプレイヤーがサイコロを振ったらターン終了
    if (Object.values(rooms[room].players).every(p => p.hasRolledDice)) {
        clearTimeout(rooms[room].timer);
        endTurn(room);
    }
});

// 🎯 ターン終了処理
function endTurn(room) {
    if (!rooms[room]) {
        console.error(`❌ endTurn 実行時にルーム ${room} が見つかりません`);
        return;
    }

    // console.log(`🔍 endTurn 実行: ルーム ${room} の状態:`, JSON.stringify(rooms[room], null, 2));
    console.log(`🛑 ルーム ${room} のターン ${rooms[room].turn} 終了`);
    io.to(room).emit("endTurn", { turn: rooms[room].turn });

    // 🎯 5秒後に確実に次のターンを開始
    setTimeout(() => {
        console.log(`🔄 次のターンを開始`);
        startNewTurn(room);
    }, 2000); // 🔄 5秒待ってから次のターン開始
}


// 🎯 マップ切り替え
socket.on("viewMap", async (data) => {
    if (!data.room || !data.playerID || !data.mapID) {
        console.error("❌ 無効な viewMap データ:", data);
        return;
    }

    console.log(`📡 [DEBUG] viewMap 受信: プレイヤー ${data.playerID} がマップ ${data.mapID} を閲覧`);

    let response; // 事前に宣言
    try {
        console.log("📌 送信する token:", data.token);

        // 🔹 session.php からプレイヤーデータを取得
        response = await axios.post(`https://tohru-portfolio.secret.jp/bordgame/game/session.php?room=${data.room}`, 
            new URLSearchParams({ token: data.token }).toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        console.log("📡 session.php のレスポンス取得完了");

        if (!response || !response.data || typeof response.data !== "object") {
            console.error("❌ session.php のレスポンスが JSON ではありません:", response);
            return;
        }

        if (response.data.error) {
            console.error("❌ session.php のエラー:", response.data.error);
            return;
        }

        if (!rooms[data.room]) {
            rooms[data.room] = { players: {} }; // ルームが未定義なら新しく作成
        }

        // 🔹 session.php のプレイヤーデータをサーバーに保存
        response.data.players.forEach(player => {
            if (!rooms[data.room].players[player.id]) {
                rooms[data.room].players[player.id] = {}; // 🎯 既存データを保持
            }
            rooms[data.room].players[player.id] = {
                id: player.id,
                username: player.username,
                x: player.x,
                y: player.y,
                mapID: player.mapID,
                socketId: rooms[data.room].players[player.id].socketId || null // 既存の socketId を保持
            };
        });

        // 🎯 指定マップのプレイヤーデータをフィルタリング
        const filteredPlayers = Object.values(rooms[data.room].players).filter(p => p.mapID === data.mapID);

        console.log(`📡 [DEBUG] updateViewMap 送信: ${filteredPlayers.length} 人のプレイヤーを送信`);

        // 🔹 ルーム全体に `updateViewMap` を送信
        io.to(data.room).emit("updateViewMap", { mapID: data.mapID, players: filteredPlayers });

    } catch (error) {
        console.error("❌ session.php 取得エラー:", error.message);
    }
});


socket.on("playerWarped", (data) => {
    console.log("📡 ワープ情報を受信:", data);

    if (!rooms[data.room] || !rooms[data.room].players[data.playerID]) {
        console.error(`❌ ルーム ${data.room} にプレイヤー ${data.playerID} が存在しません`);
        return;
    }
    // **サーバー側のプレイヤーデータを更新**
    rooms[data.room].players[data.playerID].mapID = data.newMapID;
    console.log(`✅ プレイヤー ${data.playerID} の新しいマップ: ${data.newMapID}`);
    // **全クライアントにワープ情報を通知**
    io.to(data.room).emit("playerWarped", {
        playerID: data.playerID,
        newMapID: data.newMapID
    });
});


// 🎯 プレイヤー移動処理
socket.on("movePlayer", async (data) => {
    console.log("📡 movePlayer 受信:", data);
    console.log(JSON.stringify(data, null, 2));
    console.log(`📡 movePlayer 受信 - rooms[${data.room}] の状態:`, JSON.stringify({
        ...rooms[data.room], // 既存のデータ
        timer: undefined     // `timer` を出力しないようにする
    }, null, 2));    
    console.log(`📡 movePlayer 受信 - rooms[${data.room}][${data.id}] の状態:`, rooms[data.room]?.[data.id]);


    if (!rooms[data.room] || !rooms[data.room].players || !rooms[data.room].players[data.id]) {
        console.warn(`⚠️ rooms[${data.room}].players にプレイヤー ${data.id} が存在しません。session.php から再取得を試みます`);
        try {
            const response = await axios.post(`https://tohru-portfolio.secret.jp/bordgame/game/session.php?room=${data.room}`, 
                new URLSearchParams({ token: data.token }).toString(), {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            if (!response.data.success) {
                console.error("❌ session.php からのデータ取得に失敗:", response.data.error);
                return;
            }

            if (!rooms[data.room]) {
                rooms[data.room] = { players: {} }; // 新しくルームを作成する場合
            }
            
            if (!rooms[data.room].players) {
                rooms[data.room].players = {}; // もし `players` が消えていたら空のオブジェクトにする
            }
            
            response.data.players.forEach(player => {
                if (!rooms[data.room].players[player.id]) {
                    rooms[data.room].players[player.id] = {}; // 既存データを保持する
                }
            
                rooms[data.room].players[player.id].id = player.id;
                rooms[data.room].players[player.id].username = player.username;
                rooms[data.room].players[player.id].x = player.x;
                rooms[data.room].players[player.id].y = player.y;
                rooms[data.room].players[player.id].mapID = player.mapID;
                rooms[data.room].players[player.id].socketId = rooms[data.room].players[player.id].socketId || null; // 既存の socketId を維持
            });
            
            console.log(`📡 movePlayer 受信 - rooms[${data.room}] の状態:`, JSON.stringify(rooms[data.room], (key, value) => {
                if (key === "timer") return undefined; // `timer` プロパティを削除
                return value;
            }, 2)); 
            console.log(`✅ サーバーの rooms[${data.room}] を最新データに更新:`, rooms[data.room]);
        } catch (error) {
            console.error("❌ session.php 取得エラー:", error.message);
            return;
        }
    }

    // ✅ `rooms` にプレイヤーが登録されているはず
    let player = rooms[data.room].players[data.id];
    if (!rooms[data.room] || !rooms[data.room].players || !rooms[data.room].players[data.id]) {
        console.warn(`⚠️ rooms[${data.room}].players にプレイヤー ${data.id} が存在しません。session.php から再取得を試みます`);    
        return;
    }
    
    if (!rooms[data.room].players) {
        console.error(`❌ movePlayer: ルーム ${data.room} の players が undefined です`);
        return;
    }
    
    if (!rooms[data.room].players[data.id]) {
        console.error(`❌ movePlayer: プレイヤー ${data.id} が rooms[${data.room}] に存在しません`);
        console.log(`📡 rooms[${data.room}] の現在の状態:`, JSON.stringify(rooms[data.room], null, 2));
        return;
    }    
    if (!player) {
        console.error(`❌ movePlayer の処理継続失敗: プレイヤー ${data.id} が rooms に存在しません`);
        return;
    }

    player.x = data.x;
    player.y = data.y;
    player.mapID = data.mapID;

    console.log(`🔄 ルーム ${data.room} - プレイヤー ${data.id} 移動: x=${data.x}, y=${data.y}, mapID=${data.mapID}`);

    // 🎯 WebSocket でクライアントに通知（mapID も含める）
    io.to(data.room).emit("playerMoved", { 
        id: data.id, 
        x: data.x, 
        y: data.y, 
        mapID: data.mapID
    });

    // 🎯 データベースに移動後の座標と mapID を保存
    axios.post("https://tohru-portfolio.secret.jp/bordgame/game/update_position.php", new URLSearchParams({
        token: data.token,
        x: data.x,
        y: data.y,
        mapID: data.mapID,
        room: data.room
    }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }).then(response => {
        if (!response.data.success) {
            console.error("❌ データベース更新失敗:", response.data.error);
        } else {
            console.log("✅ データベースにプレイヤー座標とマップIDを保存:", response.data);
        }
    }).catch(error => console.error("❌ update_position.php 取得エラー:", error));
});


// 🎯 カード取得処理
socket.on("receiveCard", async (data) => {
    if (!data.room || !data.playerID || !data.card) {
        console.error("❌ receiveCard のデータが不正:", data);
        return;
    }

    console.log(`🎴 プレイヤー ${data.playerID} が ${data.cardName} を取得 (ポイント: ${data.points})`);
    io.to(data.room).emit("cardReceived", {
        playerID: data.playerID,
        card: data.card,
        cardName: data.cardName,
        points: data.points
    });
});

// 勝利後
socket.on("declareWinner", async (data) => {
    if (!data.room || !data.winnerId || !rooms[data.room]) {
        console.error("❌ 無効な勝利通知:", data);
        return;
    }

    console.log(`🏆 ルーム ${data.room} でプレイヤー ${data.winnerId} が勝利`);

    try {
        // 🎯 ルームのプレイヤーデータを取得
        const response = await axios.get(`https://tohru-portfolio.secret.jp/bordgame/game/session.php?room=${data.room}`);
        if (!response.data.success) {
            console.error("❌ session.php からプレイヤーデータ取得失敗:", response.data.error);
            return;
        }

        const players = response.data.players;
        let ranking = [];

        // 🎯 各プレイヤーのポイントを計算
        for (let player of players) {
            let totalPoints = 0;

            // 🎯 `getPlayerCardsForRanking` を使用してカードデータを取得
            const playerCards = await getPlayerCardsForRanking(player.id, data.room, player.token);
            console.log(`📌 プレイヤー ${player.id} のカード一覧:`, playerCards);

            if (playerCards.length > 0) {
                for (let cardID of playerCards) {
                    if (allCards[cardID]) {
                        totalPoints += allCards[cardID].points;
                    }
                }
            }

            ranking.push({
                id: player.id,
                username: player.username,
                totalPoints: totalPoints
            });
        }

        // 🎯 ランキングを降順にソート
        ranking.sort((a, b) => b.totalPoints - a.totalPoints);

        // 🎯 勝者を決定（総合ポイントが最も高いプレイヤー）
        const finalWinner = ranking[0].id;

        // 🎯 ゲーム結果を全プレイヤーに送信
        io.to(data.room).emit("gameOver", {
            winnerId: finalWinner,
            ranking: ranking
        });

        console.log(`🏆 最終勝者: ${finalWinner} (${ranking[0].totalPoints}ポイント)`);
    } catch (error) {
        console.error("❌ get_inventory.php 取得エラー:", error.message);
    }
});


// 🎯 ゲーム終了処理
socket.on("endGame", (data) => {
    if (!data.room) {
        console.error("❌ `endGame` ルームIDが指定されていません");
        return;
    }

    const room = data.room;
    console.log(`🛑 ルーム ${room} のゲームを終了`);

    // 🎯 タイマーをクリアしてターン管理を停止
    if (rooms[room]?.timer) {
        clearTimeout(rooms[room].timer);
        console.log(`🛑 ルーム ${room} のタイマーをクリア`);
    }

    // 🎯 `rooms[room]` のゲーム進行フラグを無効化
    if (rooms[room]) {
        rooms[room].active = false;
    }

    // 🎯 ルーム内の全員にゲーム終了通知
    io.to(room).emit("endGame", { roomID: room });

    // 🎯 30秒後に `rooms[room]` を削除
    setTimeout(() => {
        if (rooms[room]) {
            console.log(`🗑️ ルーム ${room} のデータを削除`);
            delete rooms[room];
        }
    }, 30000); // 30秒 (30,000ミリ秒)

});


// 🎯 クライアント切断処理
const ROOM_CLEANUP_DELAY = 10000; // 10秒待つ（必要なら変更可能）
const pendingDeletions = {}; // ルーム削除の予約管理

socket.on("disconnect", () => {
    console.log(`❌ プレイヤーが切断: ${socket.id}`);

    Object.keys(rooms).forEach((roomID) => {
        if (!rooms[roomID] || !rooms[roomID].players) {
            console.warn(`⚠️ ルーム ${roomID} が存在しない、または players が未定義`);
            return;
        }

        const playerID = Object.keys(rooms[roomID].players).find(id => rooms[roomID].players[id].socketId === socket.id);

        if (playerID) {
            console.log(`🛑 プレイヤー ${playerID} が切断: ルーム ${roomID} から一時的に削除を予約`);

            // 🎯 削除の予約をセット（既存の予約があればキャンセル）
            if (pendingDeletions[roomID]) {
                clearTimeout(pendingDeletions[roomID]);
                console.log(`🛑 ルーム ${roomID} の以前の削除予約をキャンセル`);
            }

            pendingDeletions[roomID] = setTimeout(() => {
                if (!rooms[roomID].players[playerID]) { // まだ再接続していなければ削除
                    console.log(`🚨 ${ROOM_CLEANUP_DELAY / 1000}秒間再接続がなかったため、ルーム ${roomID} から完全に削除`);
                    delete rooms[roomID].players[playerID];

                    if (Object.keys(rooms[roomID].players).length === 0) {
                        console.log(`🗑️ ルーム ${roomID} を削除`);
                        delete rooms[roomID];
                    }
                } else {
                    console.log(`✅ プレイヤー ${playerID} が ${ROOM_CLEANUP_DELAY / 1000}秒以内に再接続したため、削除をキャンセル`);
                }
                delete pendingDeletions[roomID]; // タイマーを消去
            }, ROOM_CLEANUP_DELAY);
        }
    });
    io.emit("updatePlayers", rooms);
});


socket.on("checkRoomStatus", (data) => {
    const { room } = data;
    if (!room) {
        console.error("❌ checkRoomStatus: ルームIDが指定されていません");
        return;
    }

    // 現在のルームにいるクライアント一覧を取得
    io.in(room).fetchSockets().then(sockets => {
        const clients = sockets.map(s => s.id);
        console.log(`📡 [DEBUG] ルーム ${room} の参加者:`, clients);

        // 🎯 クライアントにルームの状況を返す
        socket.emit("roomStatus", {
            roomID: room,
            clients: clients
        });
    }).catch(error => {
        console.error(`❌ ルーム ${room} の状態取得エラー:`, error);
    });
});

});

// 🔹 サーバー起動
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket サーバーが ${PORT} で起動しました`);
});
