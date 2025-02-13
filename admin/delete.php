<?php
header("Content-Type: application/json");
include('db.php');

error_reporting(E_ALL); // すべてのエラーを表示
ini_set('display_errors', 1); // エラーをブラウザに表示


$response = ["success" => false]; // 初期レスポンス

// `$pdo` が存在しない場合はエラーを返す
if (!isset($pdo)) {
    $response["error"] = "データベース接続が確立されていません";
    echo json_encode($response);
    exit();
}

// POSTデータの取得
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $roomId = $_POST["roomId"] ?? "";

    if (!empty($roomId)) {
        // SQLインジェクション防止のため、テーブル名の形式を制限
        if (!preg_match('/^room_[a-z0-9]+$/', $roomId)) {
            $response["error"] = "無効なテーブル名: " . $roomId;
            echo json_encode($response);
            exit();
        }

        try {
            // PDO で `DROP TABLE` を実行
            $query = "DROP TABLE IF EXISTS `$roomId`";
            $pdo->exec($query);
            $response["success"] = true;
        } catch (PDOException $e) {
            $response["error"] = "DBエラー: " . $e->getMessage();
        }
    } else {
        $response["error"] = "roomId が指定されていません";
    }
}

// JSONで結果を返す
echo json_encode($response);
?>
