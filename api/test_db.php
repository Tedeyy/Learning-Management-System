<?php
header("Content-Type: text/plain");
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "--- EduReady Pure PHP Test ---\n";
echo "PHP Version: " . phpversion() . "\n";

$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'eduready_db';

echo "Testing connection to $host with user $user...\n";

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "SUCCESS: Connection established!\n";
    
    $stmt = $pdo->query("SELECT DATABASE()");
    $current_db = $stmt->fetchColumn();
    echo "SUCCESS: Current database is '$current_db'\n";

} catch (\PDOException $e) {
    echo "FAILED: Database error: " . $e->getMessage() . "\n";
    echo "Check if MySQL is running in XAMPP and if 'eduready_db' exists.\n";
} catch (\Exception $e) {
    echo "FAILED: General error: " . $e->getMessage() . "\n";
}
