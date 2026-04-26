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

try {
    if ($method === 'GET') {
        if ($type === 'courses') {
            $instructor_id = $_GET['instructor_id'] ?? null;
            $search = $_GET['search'] ?? null;
            $student_id = $_GET['student_id'] ?? null;
            
            $query = "SELECT c.id, c.title, c.description, c.created_at, CONCAT(u.first_name, ' ', u.last_name) as instructor_name";
            $params = [];
            
            if ($student_id) { 
                $query .= ", (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND student_id = :sid_col) as is_enrolled"; 
                $params[':sid_col'] = $student_id;
            }
            
            $query .= " FROM courses c JOIN users u ON c.instructor_id = u.id";
            $where = [];
            
            if ($instructor_id) { 
                $where[] = "c.instructor_id = :instructor_id"; 
                $params[':instructor_id'] = $instructor_id; 
            }
            
            if ($search) { 
                $where[] = "(c.title LIKE :search OR c.description LIKE :search)"; 
                $params[':search'] = "%$search%"; 
            }
            
            if ($student_id && !$instructor_id) {
                $where[] = "c.id NOT IN (SELECT course_id FROM enrollments WHERE student_id = :sid_where)";
                $params[':sid_where'] = $student_id;
            }
            
            if (count($where) > 0) {
                $query .= " WHERE " . implode(" AND ", $where);
            }
            
            $query .= " ORDER BY c.created_at DESC";
            $stmt = $db->prepare($query);
            foreach ($params as $key => $val) { $stmt->bindValue($key, $val); }
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($type === 'categories') {
            $course_id = $_GET['course_id'] ?? null;
            $student_id = $_GET['student_id'] ?? null;
            
            $query = "SELECT ac.*, 
                        (SELECT COUNT(*) FROM activities WHERE category_id = ac.id) + 
                        (SELECT COUNT(*) FROM learning_materials WHERE category_id = ac.id) as total_items";
            
            $params = [':course_id' => $course_id];
            if ($student_id) {
                $query .= ", (SELECT COUNT(*) FROM submissions s JOIN activities a ON s.activity_id = a.id WHERE a.category_id = ac.id AND s.student_id = :sid1) +
                            (SELECT COUNT(*) FROM material_views mv JOIN learning_materials lm ON mv.material_id = lm.id WHERE lm.category_id = ac.id AND mv.student_id = :sid2) as completed_items";
                $params[':sid1'] = $student_id;
                $params[':sid2'] = $student_id;
            }
            
            $query .= " FROM activity_categories ac WHERE course_id = :course_id ORDER BY created_at ASC";
            
            $stmt = $db->prepare($query);
            foreach ($params as $key => $val) { $stmt->bindValue($key, $val); }
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($type === 'activities') {
            $category_id = $_GET['category_id'] ?? null;
            $student_id = $_GET['student_id'] ?? null;
            
            $query = "SELECT a.*";
            if ($student_id) { $query .= ", (SELECT COUNT(*) FROM submissions WHERE activity_id = a.id AND student_id = :student_id) as is_done"; }
            $query .= " FROM activities a WHERE category_id = :category_id ORDER BY created_at ASC";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":category_id", $category_id);
            if ($student_id) { $stmt->bindParam(":student_id", $student_id); }
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($type === 'materials') {
            $category_id = $_GET['category_id'] ?? null;
            $course_id = $_GET['course_id'] ?? null;
            $student_id = $_GET['student_id'] ?? null;
            
            $query = "SELECT lm.*";
            if ($student_id) { $query .= ", (SELECT COUNT(*) FROM material_views WHERE material_id = lm.id AND student_id = :student_id) as is_viewed"; }
            $query .= " FROM learning_materials lm WHERE " . ($category_id ? "category_id = :category_id" : "course_id = :course_id") . " ORDER BY created_at ASC";
            
            $stmt = $db->prepare($query);
            if ($category_id) { $stmt->bindParam(":category_id", $category_id); }
            else { $stmt->bindParam(":course_id", $course_id); }
            if ($student_id) { $stmt->bindParam(":student_id", $student_id); }
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($type === 'enrollments') {
            $student_id = $_GET['student_id'] ?? null;
            $query = "SELECT e.course_id, e.enrolled_at, c.title, c.description, CONCAT(u.first_name, ' ', u.last_name) as instructor_name 
                      FROM enrollments e 
                      JOIN courses c ON e.course_id = c.id 
                      JOIN users u ON c.instructor_id = u.id 
                      WHERE e.student_id = :student_id 
                      ORDER BY e.enrolled_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":student_id", $student_id);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($type === 'course_enrollees') {
            $course_id = $_GET['course_id'] ?? null;
            $query = "SELECT u.id, u.first_name, u.last_name, u.email, e.enrolled_at 
                      FROM enrollments e 
                      JOIN users u ON e.student_id = u.id 
                      WHERE e.course_id = :course_id 
                      ORDER BY e.enrolled_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":course_id", $course_id);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($type === 'user_info') {
            $user_id = $_GET['id'] ?? null;
            $query = "SELECT id, first_name, last_name, middle_name, email, role, birthdate, gender, address, contact_number, created_at FROM users WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $user_id);
            $stmt->execute();
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } elseif ($type === 'student_progress') {
            $student_id = $_GET['student_id'] ?? null;
            $course_id = $_GET['course_id'] ?? null;
            
            $query = "SELECT ac.id, ac.name,
                        (SELECT COUNT(*) FROM activities WHERE category_id = ac.id) as total_acts,
                        (SELECT COUNT(*) FROM learning_materials WHERE category_id = ac.id) as total_mats,
                        (SELECT COUNT(*) FROM submissions s JOIN activities a ON s.activity_id = a.id WHERE a.category_id = ac.id AND s.student_id = :sid1) as done_acts,
                        (SELECT COUNT(*) FROM material_views mv JOIN learning_materials lm ON mv.material_id = lm.id WHERE lm.category_id = ac.id AND mv.student_id = :sid2) as viewed_mats
                      FROM activity_categories ac 
                      WHERE ac.course_id = :cid 
                      ORDER BY ac.created_at ASC";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":sid1", $student_id);
            $stmt->bindValue(":sid2", $student_id);
            $stmt->bindValue(":cid", $course_id);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($type === 'comments') {
            $activity_id = $_GET['activity_id'] ?? null;
            $material_id = $_GET['material_id'] ?? null;
            
            $query = "SELECT cm.*, CONCAT(u.first_name, ' ', u.last_name) as user_name, u.role as user_role 
                      FROM comments cm 
                      JOIN users u ON cm.user_id = u.id 
                      WHERE " . ($activity_id ? "cm.activity_id = :aid" : "cm.material_id = :mid") . " 
                      ORDER BY cm.created_at ASC";
            $stmt = $db->prepare($query);
            if ($activity_id) {
                $stmt->bindValue(":aid", $activity_id, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(":mid", $material_id, $material_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            }
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
            $query = "INSERT INTO activities (category_id, course_id, title, description, activity_type, content_url, sequence_number, created_at) 
                      VALUES (:category_id, :course_id, :title, :description, :type, :url, :seq, :now)";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":category_id", $data->category_id);
            $stmt->bindValue(":course_id", $data->course_id);
            $stmt->bindValue(":title", htmlspecialchars(strip_tags($data->title)));
            $stmt->bindValue(":description", htmlspecialchars(strip_tags($data->description ?? '')));
            $stmt->bindValue(":type", $data->activity_type ?? 'google_form');
            $stmt->bindValue(":url", $data->content_url ?? '');
            $stmt->bindValue(":seq", !empty($data->sequence_number) ? $data->sequence_number : 0);
            $stmt->bindValue(":now", $now);
            if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Activity created"]); }
        } elseif ($type === 'materials') {
            $query = "INSERT INTO learning_materials (course_id, category_id, title, description, url, material_type, created_at) 
                      VALUES (:course_id, :category_id, :title, :description, :url, :type, :now)";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":course_id", $data->course_id);
            $stmt->bindValue(":category_id", $data->category_id ?? null);
            $stmt->bindValue(":title", htmlspecialchars(strip_tags($data->title)));
            $stmt->bindValue(":description", htmlspecialchars(strip_tags($data->description ?? '')));
            $stmt->bindValue(":url", htmlspecialchars(strip_tags($data->url)));
            $stmt->bindValue(":type", $data->material_type ?? 'link');
            $stmt->bindValue(":now", $now);
            if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Material added"]); }
        } elseif ($type === 'enrollments') {
            $query = "INSERT INTO enrollments (course_id, student_id) VALUES (:course_id, :student_id)";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":course_id", $data->course_id);
            $stmt->bindValue(":student_id", $data->student_id);
            if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Enrolled successfully"]); }
        } elseif ($type === 'submissions') {
            $query = "INSERT INTO submissions (activity_id, student_id) VALUES (:activity_id, :student_id)";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":activity_id", $data->activity_id);
            $stmt->bindValue(":student_id", $data->student_id);
            if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Activity completed"]); }
        } elseif ($type === 'material_views') {
            $query = "INSERT INTO material_views (material_id, student_id) VALUES (:material_id, :student_id)";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":material_id", $data->material_id);
            $stmt->bindValue(":student_id", $data->student_id);
            if ($stmt->execute()) { http_response_code(201); echo json_encode(["message" => "Material viewed"]); }
        } elseif ($type === 'comments') {
            try {
                $query = "INSERT INTO comments (activity_id, material_id, user_id, parent_id, content, created_at) VALUES (:aid, :mid, :uid, :pid, :content, :now)";
                $stmt = $db->prepare($query);
                
                // Ensure activity_id and material_id are null if not present
                $aid = isset($data->activity_id) ? $data->activity_id : null;
                $mid = isset($data->material_id) ? $data->material_id : null;
                $pid = isset($data->parent_id) ? $data->parent_id : null;
                
                $stmt->bindValue(":aid", $aid, $aid === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
                $stmt->bindValue(":mid", $mid, $mid === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
                $stmt->bindValue(":pid", $pid, $pid === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
                $stmt->bindValue(":uid", $data->user_id, PDO::PARAM_INT);
                $stmt->bindValue(":content", htmlspecialchars(strip_tags($data->content)));
                $stmt->bindValue(":now", $now);
                
                if ($stmt->execute()) { 
                    http_response_code(201); 
                    echo json_encode(["message" => "Comment posted"]); 
                } else {
                    throw new Exception("Execute failed: " . implode(" ", $stmt->errorInfo()));
                }
            } catch (PDOException $ex) {
                throw new Exception("Database Error: " . $ex->getMessage());
            }
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));
        if ($type === 'categories') {
            $query = "UPDATE activity_categories SET name = :name WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":id", $data->id);
            $stmt->bindValue(":name", htmlspecialchars(strip_tags($data->name)));
            if ($stmt->execute()) { echo json_encode(["message" => "Category updated"]); }
        } elseif ($type === 'materials') {
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
            $query = "UPDATE activities SET title = :title, description = :description, content_url = :url, activity_type = :type, sequence_number = :seq, updated_at = :now WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":id", $data->id);
            $stmt->bindValue(":title", htmlspecialchars(strip_tags($data->title)));
            $stmt->bindValue(":description", htmlspecialchars(strip_tags($data->description ?? '')));
            $stmt->bindValue(":url", $data->content_url ?? '');
            $stmt->bindValue(":type", $data->activity_type ?? 'google_form');
            $stmt->bindValue(":seq", !empty($data->sequence_number) ? $data->sequence_number : 0);
            $stmt->bindValue(":now", $now);
            if ($stmt->execute()) { echo json_encode(["message" => "Activity updated"]); }
        }
    } elseif ($method === 'DELETE') {
        if ($type === 'courses') {
            $course_id = $_GET['id'] ?? null;
            if (!$course_id) { http_response_code(400); echo json_encode(["message" => "Course ID is required."]); exit(); }
            $query = "DELETE FROM courses WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":id", $course_id);
            if ($stmt->execute()) { echo json_encode(["message" => "Course deleted successfully."]); }
        } elseif ($type === 'enrollments') {
            $course_id = $_GET['course_id'] ?? null;
            $student_id = $_GET['student_id'] ?? null;
            
            $q1 = "DELETE FROM submissions WHERE student_id = :sid AND activity_id IN (SELECT id FROM activities WHERE course_id = :cid)";
            $s1 = $db->prepare($q1);
            $s1->bindValue(":sid", $student_id);
            $s1->bindValue(":cid", $course_id);
            $s1->execute();
            
            $q2 = "DELETE FROM material_views WHERE student_id = :sid AND material_id IN (SELECT id FROM learning_materials WHERE course_id = :cid)";
            $s2 = $db->prepare($q2);
            $s2->bindValue(":sid", $student_id);
            $s2->bindValue(":cid", $course_id);
            $s2->execute();
            
            $query = "DELETE FROM enrollments WHERE course_id = :cid AND student_id = :sid";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":cid", $course_id);
            $stmt->bindValue(":sid", $student_id);
            if ($stmt->execute()) { echo json_encode(["message" => "Student unenrolled and progress cleared"]); }
        } elseif ($type === 'categories') {
            $id = $_GET['id'] ?? null;
            $query = "DELETE FROM activity_categories WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":id", $id);
            if ($stmt->execute()) { echo json_encode(["message" => "Category deleted"]); }
        } elseif ($type === 'activities') {
            $id = $_GET['id'] ?? null;
            $query = "DELETE FROM activities WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":id", $id);
            if ($stmt->execute()) { echo json_encode(["message" => "Activity deleted"]); }
        } elseif ($type === 'materials') {
            $id = $_GET['id'] ?? null;
            $query = "DELETE FROM learning_materials WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":id", $id);
            if ($stmt->execute()) { echo json_encode(["message" => "Material deleted"]); }
        } elseif ($type === 'comments') {
            $id = $_GET['id'] ?? null;
            $user_id = $_GET['user_id'] ?? null;
            $query = "DELETE FROM comments WHERE id = :id AND user_id = :uid";
            $stmt = $db->prepare($query);
            $stmt->bindValue(":id", $id);
            $stmt->bindValue(":uid", $user_id);
            if ($stmt->execute()) { echo json_encode(["message" => "Comment deleted"]); }
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["message" => "API Error: " . $e->getMessage()]);
}
