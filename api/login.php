<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config.php';

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $query = "SELECT id, name, email, password FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($data->password, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['name'];

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful.",
                "user" => [
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "email" => $row['email']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid credentials."]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["message" => "User not found."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>
