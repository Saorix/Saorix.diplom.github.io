<?php

header('Content-Type: application/json');

// ✅ Стадия 1: Подключение к базе данных
$host = 'localhost';
$db = 'gidrotech';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass);
    // ✅ Подключение успешно
} catch (PDOException $e) {
    echo json_encode(["error" => "Ошибка подключения к базе данных: " . $e->getMessage()]);
    exit;
}

// ✅ Стадия 2: Выполнение запроса
$sql = "SELECT name, diameter, pressure FROM cylinders";

try {
    $stmt = $pdo->query($sql);
    $cylinders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ✅ Стадия 3: Проверка результата
    if (!$cylinders) {
        echo json_encode([]);
        exit;
    }

    echo json_encode($cylinders);
} catch (PDOException $e) {
    echo json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
}

$host = 'localhost';
$db = 'gidrotech';
$user = 'root';
$pass = '';

header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $stmt = $pdo->query("SELECT model, stroke, rod_diameter, cylinder_diameter, pressure FROM cylinders");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($data);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
