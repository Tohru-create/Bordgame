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

    if (!$playerToken || !$roomID || !$cardID) {
        echo json_encode(["success" => false, "error" => "プレイヤーToken、ルームIDまたはカードIDが不足"]);
        exit;
    }

    $cardColumn = "Card_ID_" . $cardID;
    $roomTable = (strpos($roomID, "room_") === 0) ? $roomID : "room_" . $roomID;

    try {
        // 🎯 カードの現在の枚数を取得
        $checkStmt = $pdo->prepare("SELECT `$cardColumn` FROM `$roomTable` WHERE token = ?");
        $checkStmt->execute([$playerToken]);
        $currentCount = $checkStmt->fetchColumn();

        if ($currentCount === false) {
            echo json_encode(["success" => false, "error" => "プレイヤーデータが存在しません"]);
            exit;
        }

        // 🎯 カードの枚数を1増やす
        $newCount = $currentCount + 1;
        $stmt = $pdo->prepare("UPDATE `$roomTable` SET `$cardColumn` = ? WHERE token = ?");
        $stmt->execute([$newCount, $playerToken]);
        $affectedRows = $stmt->rowCount();

        if ($affectedRows > 0) {
            echo json_encode(["success" => true, "newCount" => $newCount]);
        } else {
            echo json_encode(["success" => false, "error" => "データが更新されませんでした。プレイヤーのTokenが正しくない可能性があります。"]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => "SQLエラー: " . $e->getMessage()]);
    }
}
?>
