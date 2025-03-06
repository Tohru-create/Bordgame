<?php
require_once '../db.php';

header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '../logs/php_error.log');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 🎯 JSONデータを受け取る
    $data = json_decode(file_get_contents("php://input"), true);
    $playerToken = $data["token"] ?? null;
    $roomID = $data["roomID"] ?? null;
    $cardID = $data["cardID"] ?? null;

    if (!$playerToken || !$roomID || !$cardID) {
        echo json_encode(["success" => false, "error" => "プレイヤーToken、ルームIDまたはカードIDが不足"]);
        exit;
    }
    $cardColumn = sprintf("Card_ID_%03d", intval($cardID));
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

        // 🎯 更新された行があるか確認
        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "newCount" => $newCount]);
        } else {
            echo json_encode(["success" => false, "error" => "データが更新されませんでした。プレイヤーのTokenが正しくない可能性があります。"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "SQLエラー: " . $e->getMessage()]);
    }
}
?>
