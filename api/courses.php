<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

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
$type = $_GET['type'] ?? 'courses';
$now = date('Y-m-d H:i:s');

if ($method === 'GET') {
    if ($type === 'courses') {
        $instructor_id = $_GET['instructor_id'] ?? null;
        $search = $_GET['search'] ?? null;
        $query = "SELECT c.id, c.title, c.description, c.created_at, u.first_name, u.last_name as instructor_name 
                  FROM courses c JOIN users u ON c.instructor_id = u.id";
        $params = [];
        if ($instructor_id) { $query .= " WHERE c.instructor_id = :instructor_id"; $params[':instructor_id'] = $instructor_id; }
        elseif ($search) { $query .= " WHERE c.title LIKE :search OR c.description LIKE :search"; $params[':search'] = "%$search%"; }
        $query .= " ORDER BY c.created_at DESC";
        try {
            $stmt = $db->prepare($query);
            foreach ($params as $key => $val) { $stmt->bindValue($key, $val); }
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Throwable $e) { http_response_code(500); echo json_encode(["message" => $e->getMessage()]); }
    } elseif ($type === 'categories') {
        $course_id = $_GET['course_id'] ?? null;
        $query = "SELECT * FROM activity_categories WHERE course_id = :course_id ORDER BY created_at ASC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":course_id", $course_id);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($type === 'activities') {
        $category_id = $_GET['category_id'] ?? null;
        // ORDER BY oldest to newest
        $query = "SELECT * FROM activities WHERE category_id = :category_id ORDER BY created_at ASC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":category_id", $category_id);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($type === 'materials') {
        $course_id = $_GET['course_id'] ?? null;
        // ORDER BY oldest to newest
        $query = "SELECT * FROM learning_materials WHERE course_id = :course_id ORDER BY created_at ASC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":course_id", $course_id);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if ($type === 'courses') {
        $query = "INSERT INTO courses (instructor_id, title, description, created_at) VALUES (:instructor_id, :title, :description, :now)";
        $stmt = $db->prepare($query);
        $stmt->bindValue(":instructor_id", $data->instructor_id);
        $stmt->bindValue(":title", htmlspecialchars(strip_tags($data->title)));
        $stmt->bindValue(":description", htmlspecialchars(strip_tags($data->description ?? '')));
        $stmt->bindValue(":now", $now);
        if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Course created"]); }
    } elseif ($type === 'categories') {
        $query = "INSERT INTO activity_categories (course_id, name, created_at) VALUES (:course_id, :name, :now)";
        $stmt = $db->prepare($query);
        $stmt->bindValue(":course_id", $data->course_id);
        $stmt->bindValue(":name", htmlspecialchars(strip_tags($data->name)));
        $stmt->bindValue(":now", $now);
        if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Category created"]); }
    } elseif ($type === 'activities') {
        $query = "INSERT INTO activities (category_id, course_id, title, description, activity_type, sequence_number, created_at) 
                  VALUES (:category_id, :course_id, :title, :description, :type, :seq, :now)";
        $stmt = $db->prepare($query);
        $stmt->bindValue(":category_id", $data->category_id);
        $stmt->bindValue(":course_id", $data->course_id);
        $stmt->bindValue(":title", htmlspecialchars(strip_tags($data->title)));
        $stmt->bindValue(":description", htmlspecialchars(strip_tags($data->description ?? '')));
        $stmt->bindValue(":type", $data->activity_type ?? 'reading');
        $stmt->bindValue(":seq", !empty($data->sequence_number) ? $data->sequence_number : null);
        $stmt->bindValue(":now", $now);
        if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Activity created"]); }
    } elseif ($type === 'materials') {
        $query = "INSERT INTO learning_materials (course_id, title, description, url, material_type, created_at) 
                  VALUES (:course_id, :title, :description, :url, :type, :now)";
        $stmt = $db->prepare($query);
        $stmt->bindValue(":course_id", $data->course_id);
        $stmt->bindValue(":title", htmlspecialchars(strip_tags($data->title)));
        $stmt->bindValue(":description", htmlspecialchars(strip_tags($data->description ?? '')));
        $stmt->bindValue(":url", htmlspecialchars(strip_tags($data->url)));
        $stmt->bindValue(":type", $data->material_type ?? 'link');
        $stmt->bindValue(":now", $now);
        if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Material added"]); }
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if ($type === 'materials') {
        $query = "UPDATE learning_materials SET title = :title, description = :description, url = :url, material_type = :type, updated_at = :now WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindValue(":id", $data->id);
        $stmt->bindValue(":title", htmlspecialchars(strip_tags($data->title)));
        $stmt->bindValue(":description", htmlspecialchars(strip_tags($data->description ?? '')));
        $stmt->bindValue(":url", htmlspecialchars(strip_tags($data->url)));
        $stmt->bindValue(":type", $data->material_type ?? 'link');
        $stmt->bindValue(":now", $now);
        if ($stmt->execute()) { echo json_encode(["message" => "Material updated"]); }
    } elseif ($type === 'activities') {
        $query = "UPDATE activities SET title = :title, description = :description, activity_type = :type, sequence_number = :seq, updated_at = :now WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindValue(":id", $data->id);
        $stmt->bindValue(":title", htmlspecialchars(strip_tags($data->title)));
        $stmt->bindValue(":description", htmlspecialchars(strip_tags($data->description ?? '')));
        $stmt->bindValue(":type", $data->activity_type ?? 'reading');
        $stmt->bindValue(":seq", !empty($data->sequence_number) ? $data->sequence_number : null);
        $stmt->bindValue(":now", $now);
        if ($stmt->execute()) { echo json_encode(["message" => "Activity updated"]); }
    }
}
