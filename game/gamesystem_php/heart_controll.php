<?php
header("Content-Type: application/json");
include('db.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // ✅ HPを取得する (GETリクエスト)
    if (!isset($_GET['id']) || !isset($_GET['roomID'])) {
        echo json_encode(["status" => "error", "message" => "Missing parameters"]);
        exit();
    }

    $userID = $_GET['id'];
    $roomID = $_GET['roomID'];

    try {
        // ID でプレイヤーの HP を取得
        $stmt = $pdo->prepare("SELECT hp FROM `$roomID` WHERE id = ?");
        $stmt->execute([$userID]);
        $hp = $stmt->fetchColumn();

        if ($hp === false) {
            echo json_encode(["status" => "error", "message" => "Player not found"]);
        } else {
            echo json_encode(["status" => "success", "hp" => $hp, "playerID" => $userID]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "SQL error", "error" => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ✅ HPを変更する (POSTリクエスト)
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id']) || !isset($data['roomID']) || !isset($data['change'])) {
        echo json_encode(["status" => "error", "message" => "Missing parameters"]);
        exit();
    }

    $userID = $data['id'];
    $roomID = $data['roomID'];
    $change = intval($data['change']);

    try {
        // 現在の HP を取得
        $stmt = $pdo->prepare("SELECT hp FROM `$roomID` WHERE id = ?");
        $stmt->execute([$userID]);
        $currentHP = $stmt->fetchColumn();

        if ($currentHP === false) {
            echo json_encode(["status" => "error", "message" => "Player not found"]);
            exit();
        }

        // HP の上限と下限を制御
        $max_hp = 10;
        $min_hp = 0;

        $newHP = $currentHP + $change;
        if ($newHP > $max_hp) {
            $newHP = $max_hp;
        }
        if ($newHP < $min_hp) {
            $newHP = $min_hp;
        }

        // データベースを更新
        $stmt = $pdo->prepare("UPDATE `$roomID` SET hp = ? WHERE id = ?");
        $stmt->execute([$newHP, $userID]);

        echo json_encode(["status" => "success", "hp" => $newHP, "message" => "HP updated"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "SQL error", "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
?>
