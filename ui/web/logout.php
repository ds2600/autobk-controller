<?php
require __DIR__ . '/../src/bootstrap.php';

setcookie('autobk_jwt', '', time() - 3600, '/', '', false, true);

if (session_status() === PHP_SESSION_ACTIVE) {
    session_unset();
    session_destroy();
}

header('Location: /login.php');
exit;

