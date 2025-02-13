const allCards = {
    "009": { name: "勇者の剣", points: 50 },
    "010": { name: "魔法の盾", points: 50 },
    "011": { name: "隠れ家の地図", points: 50 },
    "012": { name: "竜の卵", points: 50 },
    "013": { name: "賢者の石", points: 50 },
    "014": { name: "魔女の呪文書", points: 50 },
    "015": { name: "戦士の兜", points: 50 },
    "016": { name: "裏切り者の短剣", points: 50 },
    "017": { name: "精霊の加護", points: 50 },
    "018": { name: "冒険者のメダル", points: 50 },
    "019": { name: "謎の巻物", points: 50 },
    "020": { name: "忍者の煙玉", points: 50 },
    "021": { name: "狩人の弓", points: 50 },
    "022": { name: "海賊の宝箱", points: 50 },
    "023": { name: "騎士の馬", points: 50 },
    "024": { name: "鍛冶屋のハンマー", points: 50 },
    "025": { name: "占い師の水晶球", points: 50 },
    "026": { name: "妖精の花びら", points: 50 },
    "027": { name: "炎の指輪", points: 50 },
    "028": { name: "天使の羽根", points: 50 },
    "029": { name: "暗殺者の手裏剣", points: 50 },
    "030": { name: "魔法使いの杖", points: 50 },
    "031": { name: "忘れられた古文書", points: 50 },
    "032": { name: "勇気のトーチ", points: 50 },
    "033": { name: "魔力のオーブ", points: 50 },
    "034": { name: "砂漠の砂時計", points: 50 },
    "035": { name: "雪山の氷片", points: 50 },
    "036": { name: "精鋭の盾", points: 50 },
    "037": { name: "戦略のチェス盤", points: 50 },
    "038": { name: "盗賊の鍵", points: 50 },
    "039": { name: "冥界の錠前", points: 50 },
    "040": { name: "魔法のパンプキン", points: 50 },
    "041": { name: "風の巻き糸", points: 50 },
    "042": { name: "雷の槍", points: 50 },
    "043": { name: "光の松明", points: 50 },
    "044": { name: "黒猫の瞳", points: 50 },
    "045": { name: "竜の鱗", points: 50 },
    "046": { name: "虚空の宝石", points: 50 },
    "047": { name: "秘密の呪符", points: 50 },
    "048": { name: "禁断の果実", points: 50 },
    "049": { name: "狩猟の弓矢", points: 50 },
    "050": { name: "錬金術のポーション", points: 50 },
    "051": { name: "光の指輪", points: 50 },
    "052": { name: "聖なる経典", points: 50 },
    "053": { name: "銀の弾丸", points: 50 },
    "054": { name: "魔女の帽子", points: 50 },
    "055": { name: "精霊の涙", points: 50 },
    "056": { name: "月光のダガー", points: 50 },
    "057": { name: "深淵の瞳", points: 50 },
    "058": { name: "運命のカード", points: 50 },
    "059": { name: "風の精霊", points: 50 },
    "060": { name: "魅惑のポーション", points: 50 },
    "061": { name: "幻影の仮面", points: 100 },
    "062": { name: "嵐の予言書", points: 100 },
    "063": { name: "夢見る船", points: 100 },
    "064": { name: "希望の灯火", points: 100 },
    "065": { name: "吟遊詩人の竪琴", points: 100 },
    "066": { name: "霧の中の船", points: 100 },
    "067": { name: "黄金の砂時計", points: 100 },
    "068": { name: "迷宮の鍵", points: 100 },
    "069": { name: "魔法のランタン", points: 100 },
    "070": { name: "魂の水晶", points: 100 },
    "071": { name: "闇の羽根", points: 100 },
    "072": { name: "空のハープ", points: 100 },
    "073": { name: "終焉のサークレット", points: 100 },
    "074": { name: "鎖の腕輪", points: 100 },
    "075": { name: "宿命のルーン", points: 100 },
    "076": { name: "幻影の刻印", points: 150 },
    "077": { name: "魔王の刻印", points: 150 },
    "078": { name: "天使の涙", points: 150 },
    "079": { name: "呪われし秘宝", points: 150 },
    "080": { name: "聖騎士の誓約", points: 150 },
    "081": { name: "永遠の契約", points: 150 },
    "082": { name: "深淵の囁き", points: 150 },
    "083": { name: "烈火の紋章", points: 150 },
    "084": { name: "氷獄の印", points: 150 },
    "085": { name: "雷神の祝福", points: 150 },
    "086": { name: "竜の刻印", points: 150 },
    "087": { name: "戦神の加護", points: 150 },
    "088": { name: "死者の詠唱", points: 150 },
    "089": { name: "禁断の果実", points: 150 },
    "090": { name: "天命の書", points: 150 },
    "091": { name: "虚無の眼差し", points: 150 },
    "092": { name: "堕天使の契約", points: 150 },
    "093": { name: "魔導の宝珠", points: 150 },
    "094": { name: "幻惑の霧", points: 150 },
    "095": { name: "希望の灯火", points: 150 },
    "096": { name: "英雄の証", points: 150 },
    "097": { name: "地獄の審判", points: 150 },
    "098": { name: "破滅の預言", points: 150 },
    "099": { name: "聖女の祈り", points: 150 },
    "100": { name: "冥界の門", points: 150 },
    "101": { name: "禁忌の呪文書", points: 200 },
    "102": { name: "賢者の杖", points: 200 },
    "103": { name: "天空の宝珠", points: 200 },
    "104": { name: "深淵の魔石", points: 200 },
    "105": { name: "聖者の聖杯", points: 200 },
    "106": { name: "神秘のオーブ", points: 200 },
    "107": { name: "太陽の剣", points: 200 },
    "108": { name: "暗黒の冠", points: 200 },
    "109": { name: "月影のローブ", points: 200 },
    "110": { name: "光輝の盾", points: 200 },
    "111": { name: "時の砂時計", points: 200 },
    "112": { name: "幻惑の鏡", points: 200 },
    "113": { name: "終末の巻物", points: 200 },
    "114": { name: "神龍の鱗", points: 200 },
    "115": { name: "英雄の証", points: 200 },
    "116": { name: "魔導士の結晶", points: 200 },
    "117": { name: "不死鳥の羽根", points: 200 },
    "118": { name: "冥界の指輪", points: 200 },
    "119": { name: "禁断の果実", points: 200 },
    "120": { name: "伝説のメダリオン", points: 200 },
    "121": { name: "神々の剣", points: 200 },
    "122": { name: "魔神の鎌", points: 200 },
    "123": { name: "無限の鍵", points: 200 },
    "124": { name: "王の王冠", points: 200 },
    "125": { name: "運命のダイス", points: 200 },
    "126": { name: "深淵の囁き", points: 300 },
    "127": { name: "天翔ける翼", points: 300 },
    "128": { name: "堕落の烙印", points: 300 },
    "129": { name: "聖なる旋律", points: 300 },
    "130": { name: "夜明けの誓い", points: 300 },
    "131": { name: "黒炎の呪縛", points: 300 },
    "132": { name: "悠久の記憶", points: 300 },
    "133": { name: "白銀の刃", points: 300 },
    "134": { name: "呪われし偶像", points: 300 },
    "135": { name: "戦慄の咆哮", points: 300 },
    "136": { name: "狂気の月", points: 300 },
    "137": { name: "天罰の槌", points: 300 },
    "138": { name: "封印されし鍵", points: 300 },
    "139": { name: "漆黒の契約", points: 300 },
    "140": { name: "暁光の盾", points: 300 },
    "141": { name: "影の従者", points: 300 },
    "142": { name: "不滅の誓約", points: 300 },
    "143": { name: "魔女の予言", points: 300 },
    "144": { name: "血塗られた王冠", points: 300 },
    "145": { name: "雷鳴の軍勢", points: 300 },
    "146": { name: "孤高の騎士", points: 300 },
    "147": { name: "死神の微笑", points: 300 },
    "148": { name: "運命の輪", points: 300 },
    "149": { name: "太陽神の加護", points: 300 },
    "150": { name: "終焉の刻", points: 300 }
};

/**
 * データベースからプレイヤーの持っているカードを取得
 * @param {string} token - プレイヤーの認証トークン
 * @returns {Promise<Array>} - 持っているカードIDのリスト
 */
const getInventoryAPI = "https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/get_inventory.php";
async function getPlayerCards(token) {
    try {
        const response = await fetch(getInventoryAPI, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ token: token, room: roomID }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const errorText = await response.text();
            console.error("❌ サーバーからのレスポンスが JSON ではありません:", errorText);
            return [];
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.cards)) {
            console.error("❌ カードデータ取得失敗:", data.error || "不明なエラー");
            return [];
        }

        return data.cards;
    } catch (error) {
        console.error("❌ カードデータ取得エラー:", error.message);
        return [];
    }
}


/**
 * プレイヤーのカード情報を取得し、名前とポイントをセットで返す
 * @param {string} token - プレイヤートークン
 * @returns {Promise<Array>} - [{ name: "カード名", points: 50 }]
 */
async function getPlayerCardDetails(token) {
    const cardIDs = await getPlayerCards(token);

    return cardIDs.map(id => {
        if (allCards[id]) {
            return { name: allCards[id].name, points: allCards[id].points };
        } else {
            return { name: `不明なカード (${id})`, points: 0 };
        }
    });
}
/**
 * ランキング計算専用: プレイヤーの持つカードリストを取得
 * インベントリ表示用の `getPlayerCards()` とは分けて使用
 * @param {string} playerID - プレイヤーのID
 * @param {string} roomID - ルームID
 * @returns {Promise<Array>} - 持っているカードIDのリスト
 */
async function getPlayerCardsForRanking(playerID, roomID) {
    try {
        const response = await axios.post("https://tohru-portfolio.secret.jp/bordgame/game/gamesystem_php/get_inventory.php", 
            new URLSearchParams({ player_id: playerID, room: roomID }).toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        if (!response.data.success || !Array.isArray(response.data.cards)) {
            console.error(`❌ プレイヤー ${playerID} のカードデータ取得失敗:`, response.data.error || "不明なエラー");
            return [];
        }

        return response.data.cards;
    } catch (error) {
        console.error(`❌ プレイヤー ${playerID} のカードデータ取得エラー:`, error.message);
        return [];
    }
}
