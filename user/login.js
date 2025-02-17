document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 login.js ロード完了");
    // 🎯 リロード時に `sessionStorage` をクリアする処理
    if (sessionStorage.getItem("reloadFlag")) {
        console.log("🔄 ページがリロードされたため、sessionStorage をクリアします");
        sessionStorage.clear();  // 全ての `sessionStorage` データを消去
        sessionStorage.removeItem("reloadFlag"); // フラグを削除
    }

    // 🎯 `beforeunload` を使ってリロード時に `reloadFlag` を設定
    window.addEventListener("beforeunload", () => {
        sessionStorage.setItem("reloadFlag", "true"); // 次回ロード時に判定するためのフラグ
    });

    const urlParams = new URLSearchParams(window.location.search);
    const isHoststats = urlParams.get("host");
    const newGameBtn = document.getElementById("newGame");
    const joinGameBtn = document.getElementById("joinGame");
    const copyLinkBtn = document.getElementById("copyLink");
    const roomSection = document.getElementById("roomSection");
    const usernameSection = document.getElementById("usernameSection");
    const playerList = document.getElementById("playerList");
    const mapSelection = document.getElementById("mapSelection"); 
    const tittleSection = document.getElementById("tittleSection"); 
    const tutorialSelection = document.getElementById("tutorialSelection"); 
    const maps = document.querySelectorAll(".map");
    const confirmMapButton = document.getElementById("confirmMapSelection");

    if (!newGameBtn || !joinGameBtn || !copyLinkBtn) {
        console.error("❌ 必要なボタンが見つかりません");
        return;
    }

    let roomID = new URLSearchParams(window.location.search).get("room");
    let token = sessionStorage.getItem("playerToken");
    let isHost = sessionStorage.getItem("roomHost") === "true"; // ホスト判定
    let isGuest = sessionStorage.getItem("roomHost") === "false"; // ゲスト判定
    

    if (roomID) {
        console.log(`✅ ルームID取得: ${roomID}`);
        document.getElementById("roomID").textContent = roomID;
        document.getElementById("inviteLink").href = `https://tohru-portfolio.secret.jp/bordgame/user/login.html?room=${roomID}&host=false`;
        roomSection.style.display = "block";
        usernameSection.style.display = "block";

        fetch(`https://tohru-portfolio.secret.jp/bordgame/game/session.php?room=${roomID}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ token: token || "" })
        })
        .then(response => response.json())
        .then(data => {
            console.log("📡 session.php のレスポンス:", data);
            if (data.success) {
                playerList.innerHTML = "";
                data.players.forEach(player => {
                    const li = document.createElement("li");
                    li.textContent = player.username;
                    playerList.appendChild(li);
                });

                if (data.currentPlayer) {
                    sessionStorage.setItem("playerToken", data.currentPlayer.token);
                    sessionStorage.setItem("playerID", data.currentPlayer.id);
                }
            } else {
                console.error("❌ session.php のエラー:", data.error);
            }
        })
        .catch(error => console.error("❌ session.php 取得エラー:", error));
    }
    if (isHoststats === "false") {
        console.log("🚫 招待リンクからのアクセスなので、roomHost を false に上書き");
        sessionStorage.setItem("roomHost", "false");
        console.log("📡 `sessionStorage` に保存直後の roomHost:", sessionStorage.getItem("roomHost"));
    }

    // 🎯 ホストかどうかを判定
    if (sessionStorage.getItem("roomHost") === "true") {
        console.log("🏆 あなたはホストです！");
        document.getElementById("mapSelection").style.display = "block";
    } else {
        console.log("🚫 あなたはホストではありません");
        document.getElementById("mapSelection").style.display = "none";
    }
    // 🎯 NewGame（新しいゲームルームを作成）
    newGameBtn.addEventListener("click", () => {
        console.log("🎮 NewGame ボタンが押されました");

        fetch("newgame.php", { method: "POST" })
        .then(response => response.json())
        .then(data => {
            console.log("📡 newgame.php のレスポンス:", data);
            if (data.success) {
                console.log(`✅ 新しいルームID: ${data.roomID}`);
                
                sessionStorage.setItem("roomHost", "true"); 
                isHost = true;

                const inviteURL = `https://tohru-portfolio.secret.jp/bordgame/user/login.html?room=${data.roomID}&host=false`;
                navigator.clipboard.writeText(inviteURL).then(() => {
                    console.log("招待リンクがクリップボードにコピーされました: " + inviteURL);
                }).catch(err => {
                    console.error("❌ クリップボードへのコピーに失敗しました:", err);
                });

                // 🎯 ルームIDとホスト情報を保存
                roomID = data.roomID;

                // 🎯 UIの更新
                document.getElementById("roomID").textContent = roomID;
                document.getElementById("inviteLink").href = inviteURL;
                roomSection.style.display = "block";
                usernameSection.style.display = "block";
            } else {
                console.error("エラー: " + data.error);
            }
        })
        .catch(error => console.error("❌ newgame.php 取得エラー:", error));
    });

    maps.forEach(map => {
        map.addEventListener("click", () => {
            if (map.classList.contains("fixed")) {
                // 始まりの地と終着点は固定で解除不可
                return;
            }

            if (map.classList.contains("selected")) {
                map.classList.remove("selected");
                console.log(`🟢 ${map.id} の選択を解除しました`);
            } else {
                map.classList.add("selected");
                console.log(`🔵 ${map.id} が選択されました`);
            }
        });
    });

    confirmMapButton.addEventListener("click", () => {
        const selectedMaps = Array.from(document.querySelectorAll(".map.selected"))
            .map(map => map.id);
        console.log(`✅ 選択されたマップ: ${selectedMaps.join(", ")}`);
        // 🎯 サーバーに選択したマップを送信
        socket.emit("mapSelection", {
            roomID: roomID,
            selectedMaps: selectedMaps
        });
    
        // 🎯 チュートリアル選択画面を表示
        tutorialSelection.style.display = "block";
        mapSelection.style.display = "none";
    });
    
    

    // 🎯 ホストの判定処理
    function checkIfHost() {
        const storedHost = sessionStorage.getItem("roomHost");
        if (storedHost === sessionStorage.getItem("playerID")) {
            isHost = true;
            console.log("🏆 あなたはホストです！");
            mapSelection.style.display = "block"; // 🎯 ホストならマップ選択を表示
        }
    }
    checkIfHost();
    

    // 🎯 ゲームに参加
    joinGameBtn.addEventListener("click", () => {
        const username = document.getElementById("username").value.trim();
        if (!username) {
            alert("ユーザーネームを入力してください");
            return;
        }
        console.log(`✅ ${username} がゲームに参加`);

        fetch("join_game.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ roomID: roomID, username: username })
        })
        .then(response => response.json())
        .then(data => {
            console.log("📡 join_game.php のレスポンス:", data);
            if (data.success) {
                console.log(`✅ ${username} がルーム ${roomID} に登録完了`);
                sessionStorage.setItem("playerToken", data.token);
                sessionStorage.setItem("playerID", data.playerID); // 🎯 参加者のIDを保存
                if (isGuest) {
                    tutorialSelection.style.display = "block";
                }
            } else {
                
                alert(data.error);
            }
        })
        .catch(error => console.error("❌ join_game.php 取得エラー:", error));
        if (isHost) {
            tittleSection.style.display = "none";
            newGameBtn.style.display = "none";
            usernameSection.style.display = "none";
            roomSection.style.display = "none";
            mapSelection.style.display = "block";
        }
    });

    // 🎯 招待リンクをコピー
    copyLinkBtn.addEventListener("click", () => {
        if (roomID) {
            const inviteURL = `https://tohru-portfolio.secret.jp/bordgame/user/login.html?room=${roomID}&host=false`;
            navigator.clipboard.writeText(inviteURL).then(() => {
                alert("招待リンクがクリップボードにコピーされました: " + inviteURL);
            }).catch(err => {
                console.error("❌ クリップボードへのコピーに失敗しました:", err);
            });
        } else {
            alert("ルームIDがありません");
        }
    });

    // 🎯 ホストの判定処理
    function checkIfHost() {
        const storedHost = sessionStorage.getItem("roomHost");
        if (storedHost === sessionStorage.getItem("playerID")) {
            isHost = true;
            console.log("🏆 あなたはホストです！");
        }
    }

    checkIfHost();
});
