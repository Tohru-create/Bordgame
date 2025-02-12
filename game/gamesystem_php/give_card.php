<?php
include_once("db.php");

header("Content-Type: application/json");

// **POST 以外のリクエストをブロック**
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "error" => "無効なリクエスト"]);
    exit;
}

// **パラメータ取得**
$room = $_POST["room"] ?? null;
$targetUserID = $_POST["user_id"] ?? null;
$cardID = $_POST["card_id"] ?? null;
$password = $_POST["password"] ?? null;

// **パスワード認証**
$adminPassword = "worldendless";
if ($password !== $adminPassword) {
    echo json_encode(["success" => false, "error" => "認証失敗: 正しいパスワードを入力してください"]);
    exit;
}

// **バリデーション**
if (!$room || !$targetUserID || !$cardID) {
    echo json_encode(["success" => false, "error" => "room, user_id, card_id が必要です"]);
    exit;
}

// **テーブル名の安全性チェック**
if (!preg_match('/^room_[a-zA-Z0-9]+$/', $room)) {
    echo json_encode(["success" => false, "error" => "無効なルームID"]);
    exit;
}

// **カードIDの形式をチェック**
if (!preg_match('/^\d{3}$/', $cardID)) {
    echo json_encode(["success" => false, "error" => "無効なカードID"]);
    exit;
}

// **カードカラム名を生成**
$cardColumn = "Card_ID_" . $cardID;

try {
    // **プレイヤーが存在するか確認**
    $stmt = $pdo->prepare("SELECT * FROM `$room` WHERE id = ?");
    $stmt->execute([$targetUserID]);
    $player = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$player) {
        echo json_encode(["success" => false, "error" => "対象プレイヤーが見つかりません"]);
        exit;
    }

    // **カードの所持数を取得**
    $currentCount = $player[$cardColumn] ?? 0;

    // **カードを付与（現在の所持数 +1）**
    $stmt = $pdo->prepare("UPDATE `$room` SET `$cardColumn` = ? WHERE id = ?");
    $stmt->execute([$currentCount + 1, $targetUserID]);

    echo json_encode(["success" => true, "message" => "カードを付与しました: $cardID"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "データベースエラー: " . $e->getMessage()]);
}
?>
