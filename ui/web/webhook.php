<?php
// webhook.php

header('Content-Type: text/plain');

echo "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "Query String: " . ($_SERVER['QUERY_STRING'] ?? '') . "\n\n";

echo "=== HEADERS ===\n";
foreach (getallheaders() as $name => $value) {
    echo "$name: $value\n";
}
echo "\n";

echo "=== GET ===\n";
print_r($_GET);
echo "\n";

echo "=== RAW POST BODY ===\n";
echo file_get_contents('php://input');
echo "\n\n";

echo "=== PARSED POST (_POST) ===\n";
print_r($_POST);
echo "\n";

echo "=== FILES ===\n";
print_r($_FILES);

?>
