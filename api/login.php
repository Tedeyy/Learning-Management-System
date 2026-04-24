<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config.php';
session_start();

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$input = file_get_contents("php://input");
$data = json_decode($input);

if ($data && !empty($data->email) && !empty($data->password)) {
    try {
        $query = "SELECT id, first_name, last_name, email, password, role FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($data->password, $row['password'])) {
                $_SESSION['user_id'] = $row['id'];
                $_SESSION['user_name'] = $row['first_name'] . ' ' . $row['last_name'];
                $_SESSION['user_role'] = $row['role'];

                http_response_code(200);
                echo json_encode([
                    "message" => "Login successful.",
                    "user" => [
                        "id" => $row['id'],
                        "name" => $row['first_name'] . ' ' . $row['last_name'],
                        "role" => $row['role']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Invalid email or password."]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["message" => "User not found."]);
        }
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["message" => "Internal error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
