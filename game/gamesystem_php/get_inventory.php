<?php
require_once("db.php"); // データベース接続

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $token = $_POST["token"];

    if (!$token) {
        echo json_encode(["success" => false, "error" => "トークンが必要です"]);
        exit;
    }

    // トークンをもとにプレイヤー情報を取得
    $stmt = $pdo->prepare("SELECT id FROM players WHERE token = ?");
    $stmt->execute([$token]);
    $player = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$player) {
        echo json_encode(["success" => false, "error" => "無効なトークン"]);
        exit;
    }

    $playerID = $player["id"];

    // プレイヤーの所持カードを取得
    $stmt = $pdo->prepare("SELECT card_id FROM player_cards WHERE player_id = ? AND owned = 1");
    $stmt->execute([$playerID]);
    $cards = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(["success" => true, "cards" => $cards]);
}
?>
