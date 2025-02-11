document.getElementById("openinventory").addEventListener("click", async function () {
    const inventory = document.getElementById("inventory");
    if (inventory.style.display === "none") {
        inventory.style.display = "block";

        // インベントリの内容を取得・表示
        const token = sessionStorage.getItem("playerToken");
        if (!token) {
            console.error("❌ プレイヤートークンが見つかりません");
            return;
        }

        const cardNames = await getPlayerCardNames(token);
        const inventoryList = document.getElementById("inventory-list");
        inventoryList.innerHTML = ""; // 既存のリストをクリア

        if (cardNames.length === 0) {
            inventoryList.innerHTML = "<li>カードを所持していません</li>";
        } else {
            cardNames.forEach(cardName => {
                const listItem = document.createElement("li");
                listItem.textContent = cardName;
                inventoryList.appendChild(listItem);
            });
        }
    } else {
        inventory.style.display = "none";
    }
});
