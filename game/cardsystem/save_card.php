<?php
require_once '../db.php';

header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '../logs/php_error.log');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $playerToken = $_POST["playerToken"] ?? null;
    $roomID = $_POST["roomID"] ?? null;
    $cardID = $_POST["cardID"] ?? null;

    error_log("📡 [save_card.php] 受信データ: Token={$playerToken}, Room={$roomID}, Card={$cardID}");

    if (!$playerToken || !$roomID || !$cardID) {
        error_log("❌ [save_card.php] 必須データが不足 (roomID={$roomID}, cardID={$cardID})");
        echo json_encode(["success" => false, "error" => "プレイヤーToken、ルームIDまたはカードIDが不足"]);
        exit;
    }

    if (strpos($roomID, "room_") === 0) {
        $roomTable = $roomID;
    } else {
        $roomTable = "room_" . $roomID;
    }

    error_log("📡 [save_card.php] 使用するテーブル: {$roomTable}");

    try {
        $stmt = $pdo->prepare("UPDATE `$roomTable` SET `$cardID` = TRUE WHERE token = ?");
        $stmt->execute([$playerToken]);
        $affectedRows = $stmt->rowCount();

        if ($affectedRows > 0) {
            error_log("✅ [save_card.php] カード {$cardID} をプレイヤー（Token: {$playerToken}）に付与成功");
            echo json_encode(["success" => true]);
        } else {
            error_log("❌ [save_card.php] SQL 実行成功だが、更新された行がない。Token={$playerToken} が間違っている可能性あり");
            echo json_encode(["success" => false, "error" => "データが更新されませんでした。プレイヤーのTokenが正しくない可能性があります。"]);
        }
    } catch (Exception $e) {
        error_log("❌ [save_card.php] 例外発生: " . $e->getMessage());
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>
