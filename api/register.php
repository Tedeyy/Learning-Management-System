<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$input = file_get_contents("php://input");
$data = json_decode($input);

if (
    $data && 
    !empty($data->first_name) && 
    !empty($data->last_name) && 
    !empty($data->email) && 
    !empty($data->password) && 
    !empty($data->role)
) {
    try {
        $check_query = "SELECT id FROM users WHERE email = :email";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Email already exists."]);
            exit();
        }

        $query = "INSERT INTO users (
                    first_name, last_name, middle_name, birthdate, 
                    gender, address, contact_number, email, password, role
                ) VALUES (
                    :first_name, :last_name, :middle_name, :birthdate, 
                    :gender, :address, :contact_number, :email, :password, :role
                )";
        
        $stmt = $db->prepare($query);

        $first_name = htmlspecialchars(strip_tags($data->first_name));
        $last_name = htmlspecialchars(strip_tags($data->last_name));
        $middle_name = !empty($data->middle_name) ? htmlspecialchars(strip_tags($data->middle_name)) : null;
        $birthdate = $data->birthdate ?? null;
        $gender = $data->gender ?? null;
        $address = $data->address ?? null;
        $contact_number = $data->contact_number ?? null;
        $email = htmlspecialchars(strip_tags($data->email));
        $password = password_hash($data->password, PASSWORD_BCRYPT);
        $role = $data->role;

        $stmt->bindParam(":first_name", $first_name);
        $stmt->bindParam(":last_name", $last_name);
        $stmt->bindParam(":middle_name", $middle_name);
        $stmt->bindParam(":birthdate", $birthdate);
        $stmt->bindParam(":gender", $gender);
        $stmt->bindParam(":address", $address);
        $stmt->bindParam(":contact_number", $contact_number);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $password);
        $stmt->bindParam(":role", $role);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Account created successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create account."]);
        }
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["message" => "Internal error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
