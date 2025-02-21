const winButton = document.getElementById("winButton");
if (winButton) {
    winButton.addEventListener("click", () => {
        if (!roomID || !playerToken || !currentPlayer) {
            console.error("❌ ルームIDまたはプレイヤーデータが取得できません");
            return;
        }

        console.log(`🏆 勝利ボタンが押されました: Player ${currentPlayer.id}`);
        socket.emit("declareWinner", {
            winnerId: currentPlayer.id,
            room: roomID
        });
        socket.emit("endGame", { room: roomID });
    });
}

// 🎯 サーバーからランキングデータを受信
socket.on("gameOver", (data) => {
    console.log(`📡 ゲーム終了: Winner=${data.winnerId}`);
    const rankingTable = document.getElementById("rankingTable");
    rankingTable.innerHTML = "";

    data.ranking.forEach((player, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.username}</td>
            <td>${player.totalPoints}</td>
        `;
        rankingTable.appendChild(row);
    });

    // 🎯 ランキング画面を表示
    document.getElementById("rankingScreen").style.display = "block";
    // 🎯 各プレイヤーに勝敗を表示
    if (currentPlayer.id === data.winnerId) {
        document.getElementById("winScreen").style.display = "block";
    } else {
        document.getElementById("loseScreen").style.display = "block";
    }
});

// 🎯 ランキングを閉じる関数
function closeRanking() {
    document.getElementById("rankingScreen").style.display = "none";
    // window.location.reload();
}
