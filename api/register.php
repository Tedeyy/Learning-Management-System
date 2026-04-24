<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config.php';

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":email", $data->email);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["message" => "Email already exists."]);
        exit();
    }

    $query = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";
    $stmt = $db->prepare($query);

    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $password = password_hash($data->password, PASSWORD_BCRYPT);

    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "User was created."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to create user."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>
