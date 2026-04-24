<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed. Check your configuration."]);
    exit();
}

$input = file_get_contents("php://input");
$data = json_decode($input);

if ($data && !empty($data->name) && !empty($data->email) && !empty($data->password)) {
    try {
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
            echo json_encode(["message" => "Account created successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create account. Service unavailable."]);
        }
    } catch (Throwable $e) {
        error_log("Registration Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "Internal server error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Please fill all fields."]);
}
