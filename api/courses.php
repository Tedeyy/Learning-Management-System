<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

include_once 'config.php';
session_start();

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List courses
    $instructor_id = $_GET['instructor_id'] ?? null;
    $search = $_GET['search'] ?? null;

    $query = "SELECT c.*, u.name as instructor_name FROM courses c JOIN users u ON c.instructor_id = u.id";
    $params = [];

    if ($instructor_id) {
        $query .= " WHERE c.instructor_id = :instructor_id";
        $params[':instructor_id'] = $instructor_id;
    } elseif ($search) {
        $query .= " WHERE c.title LIKE :search OR c.description LIKE :search";
        $params[':search'] = "%$search%";
    }

    $query .= " ORDER BY c.created_at DESC";

    try {
        $stmt = $db->prepare($query);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($courses);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["message" => "Internal error: " . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // Create course
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->title) && !empty($data->instructor_id)) {
        try {
            $query = "INSERT INTO courses (instructor_id, title, description) VALUES (:instructor_id, :title, :description)";
            $stmt = $db->prepare($query);

            $instructor_id = $data->instructor_id;
            $title = htmlspecialchars(strip_tags($data->title));
            $description = htmlspecialchars(strip_tags($data->description ?? ''));

            $stmt->bindParam(":instructor_id", $instructor_id);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Course created successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create course."]);
            }
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["message" => "Internal error: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data. Title and instructor ID required."]);
    }
}
