<?php
header("Content-Type: application/json");
include('db.php');

// **POST 以外のリクエストをブロック**
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "error" => "無効なリクエスト"]);
    exit;
}

// **パラメータ取得**
$room = $_POST["room"] ?? null;
$token = $_POST["token"] ?? null;

if (!$room || !$token) {
    echo json_encode(["success" => false, "error" => "room と token が必要です"]);
    exit;
}

// **SQLインジェクション防止（room が `room_XXXXX` の形式であるかチェック）**
if (!preg_match('/^room_[a-zA-Z0-9]+$/', $room)) {
    echo json_encode(["success" => false, "error" => "無効なルームID"]);
    exit;
}

try {
    // **指定されたルームテーブルからプレイヤーのデータを取得**
    $stmt = $pdo->prepare("SELECT * FROM `$room` WHERE token = ?");
    $stmt->execute([$token]);
    $player = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$player) {
        echo json_encode(["success" => false, "error" => "プレイヤーデータが見つかりません"]);
        exit;
    }

    // **カードIDのカラムをすべて取得**
    $ownedCards = [];
    foreach ($player as $column => $value) {
        if (strpos($column, "Card_ID_") === 0 && $value > 0) {
            $ownedCards[] = str_replace("Card_ID_", "", $column); // "Card_ID_001" → "001"
        }
    }

    // **JSON レスポンス**
    echo json_encode(["success" => true, "cards" => $ownedCards]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "データベースエラー: " . $e->getMessage()]);
}
?>
