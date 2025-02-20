<?php
header("Content-Type: application/json"); // JSON レスポンスであることを明示
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'db.php'; // データベース接続

$response = [];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $roomID = $_POST["roomID"] ?? "";
    $username = $_POST["username"] ?? "";

    // 🎯 ルームID または ユーザー名が空ならエラー
    if (empty($roomID) || empty($username)) {
        $response = ["success" => false, "error" => "ルームIDまたはユーザーネームが不足しています"];
        echo json_encode($response);
        exit;
    }

    // 🎯 SQL インジェクション対策: ルームIDのバリデーション
    if (!preg_match('/^room_[a-zA-Z0-9_]+$/', $roomID)) {
        $response = ["success" => false, "error" => "無効なルームID"];
        echo json_encode($response);
        exit;
    }

    try {
        // 🎯 新しいユーザーを登録
        $token = bin2hex(random_bytes(16));
        $sql = "INSERT INTO `$roomID` (username, token, x, y) VALUES (:username, :token, 0, 0)";
        $stmt = $pdo->prepare($sql);

        // 🎯 bindParam は `execute()` の前に設定
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->bindParam(':token', $token, PDO::PARAM_STR);

        // 🎯 クエリを実行
        $stmt->execute();

        // 🎯 `lastInsertId()` は `execute()` の後で取得する
        $playerID = $pdo->lastInsertId();

        // 🎯 成功時のレスポンス
        $response = [
            "success" => true,
            "message" => "ユーザーがルームに登録されました",
            "roomID" => $roomID,
            "username" => $username,
            "playerID" => $playerID, // ここが正しく取得できるようになる
            "token" => $token
        ];
    } catch (PDOException $e) {
        // 🎯 データベースエラー時の処理
        $response = ["success" => false, "error" => "データベースエラー: " . $e->getMessage()];
    }
} else {
    $response = ["success" => false, "error" => "無効なリクエスト"];
}

echo json_encode($response);
?>
