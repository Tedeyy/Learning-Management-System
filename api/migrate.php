<?php
include_once 'config.php';

$database = new Database();
$db = $database->connect();

echo "<h2>EduReady Database Migration</h2>";

try {
    // 1. Add category_id to learning_materials
    $check = $db->query("SHOW COLUMNS FROM learning_materials LIKE 'category_id'");
    if ($check->rowCount() == 0) {
        $db->exec("ALTER TABLE learning_materials ADD COLUMN category_id INT AFTER course_id");
        $db->exec("ALTER TABLE learning_materials ADD FOREIGN KEY (category_id) REFERENCES activity_categories(id) ON DELETE SET NULL");
        echo "<p style='color: green;'>✅ Added 'category_id' to learning_materials.</p>";
    }

    // 2. Rescue 'homeless' materials (Assign to first available module)
    $db->exec("UPDATE learning_materials lm 
               SET category_id = (SELECT id FROM activity_categories WHERE course_id = lm.course_id LIMIT 1)
               WHERE category_id IS NULL");
    echo "<p style='color: green;'>✅ Successfully linked existing materials to their course modules.</p>";

    // 3. Fix Submissions table structure
    $checkSub = $db->query("SHOW COLUMNS FROM submissions LIKE 'completed_at'");
    if ($checkSub->rowCount() == 0) {
        $db->exec("DROP TABLE IF EXISTS submissions");
        $db->exec("CREATE TABLE submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            activity_id INT NOT NULL,
            student_id INT NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(activity_id, student_id)
        )");
        echo "<p style='color: green;'>✅ Re-created 'submissions' table with new structure.</p>";
    }

    // 4. Add parent_id to comments
    $checkComments = $db->query("SHOW COLUMNS FROM comments LIKE 'parent_id'");
    if ($checkComments->rowCount() == 0) {
        $db->exec("ALTER TABLE comments ADD COLUMN parent_id INT DEFAULT NULL AFTER user_id");
        $db->exec("ALTER TABLE comments ADD FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE");
        echo "<p style='color: green;'>✅ Added 'parent_id' to comments table for threading.</p>";
    }

    echo "<h3>Migration Complete! Your materials are now visible in the modules.</h3>";
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Migration Failed: " . $e->getMessage() . "</p>";
}
?>
