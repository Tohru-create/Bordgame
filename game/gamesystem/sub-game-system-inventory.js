let currentPage = 0;
const cardsPerPage = 8;
let inventoryPages = [];

/**
 * インベントリを開く
 */
document.getElementById("openinventory").addEventListener("click", async function () {
    const inventory = document.getElementById("inventory-container");

    if (inventory.style.display === "none" || inventory.style.display === "") {
        inventory.style.display = "block";

        const token = sessionStorage.getItem("playerToken");
        if (!token) {
            console.error("❌ プレイヤートークンが見つかりません");
            return;
        }

        await loadInventory(token);
    } else {
        inventory.style.display = "none";
    }
});

/**
 * インベントリのデータを取得してページ分け
 */
async function loadInventory(token) {
    const room = new URLSearchParams(window.location.search).get("room");
    if (!room) {
        console.error("❌ ルームIDが見つかりません");
        return;
    }

    const response = await fetch("https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/get_inventory.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: token, room: room }),
    });

    const data = await response.json();
    console.log("📌 [DEBUG] 取得したカードリスト:", data.cards); // **デバッグ**

    if (!data.success) {
        console.error("❌ インベントリ取得失敗:", data.error);
        return;
    }

    // **カードごとの所持枚数をカウント**
    const cardCounts = {};
    data.cards.forEach(id => {
        if (allCards[id]) {
            cardCounts[allCards[id].name] = (cardCounts[allCards[id].name] || 0) + 1;
        } else {
            console.warn(`⚠️ 未登録のカードID: ${id}`); // **デバッグ**
        }
    });

    console.log("📌 [DEBUG] カウントしたカードリスト:", cardCounts);

    // **ページ分割**
    const cardEntries = Object.entries(cardCounts);
    inventoryPages = [];
    for (let i = 0; i < cardEntries.length; i += cardsPerPage) {
        inventoryPages.push(cardEntries.slice(i, i + cardsPerPage));
    }

    currentPage = 0;
    renderInventoryPage();
}

/**
 * インベントリのページを描画
 */
function renderInventoryPage() {
    const inventoryList = document.getElementById("inventory-list");
    inventoryList.innerHTML = "";

    if (inventoryPages.length === 0 || inventoryPages[currentPage].length === 0) {
        inventoryList.innerHTML = "<li>カードを所持していません</li>";
        return;
    }

    inventoryPages[currentPage].forEach(([name, count]) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${name} x${count}`;
        inventoryList.appendChild(listItem);
    });

    document.getElementById("inventory-page-num").textContent = `${currentPage + 1} / ${inventoryPages.length}`;
    document.getElementById("inventory-prev").disabled = currentPage === 0;
    document.getElementById("inventory-next").disabled = currentPage === inventoryPages.length - 1;
}

/**
 * 次のページを表示
 */
function nextInventoryPage() {
    if (currentPage < inventoryPages.length - 1) {
        currentPage++;
        renderInventoryPage();
    }
}

/**
 * 前のページを表示
 */
function prevInventoryPage() {
    if (currentPage > 0) {
        currentPage--;
        renderInventoryPage();
    }
}

/**
 * インベントリを閉じる
 */
function closeInventory() {
    document.getElementById("inventory-container").style.display = "none";
}

// **グローバルスコープに関数を登録**
window.nextInventoryPage = nextInventoryPage;
window.prevInventoryPage = prevInventoryPage;
window.closeInventory = closeInventory;