<?php
// composer require firebase/php-jwt

session_start();
require_once __DIR__ . '/utils/constants.php';
require __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Dotenv\Dotenv;
$root = dirname(__DIR__,2);
$dotenv = Dotenv::createImmutable($root . '/api');
$dotenv->safeLoad();

$apiInternalBase = $_ENV['API_INTERNAL_BASE'] ?? getenv('API_INTERNAL_BASE') ?? '';

function require_auth() {
    $cookie = $_COOKIE['autobk_jwt'] ?? null;
    if (!$cookie) { 
        header('Location: /login.php'); 
        exit; 
    }

    $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? '';

    if ($secret === '') {
        error_log('JWT_SECRET is not set in environment variables.');
        header('Location: /login.php'); exit;
    }

    try {
        $decoded = JWT::decode($cookie, new Key($secret, 'HS256'));
        return $decoded;
    } catch (Throwable $e) {
        setcookie('autobk_jwt', '', [
          'expires'  => time() - 3600,
          'path'     => '/',
          'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
          'httponly' => true,
          'samesite' => 'Lax',
        ]);
        header('Location: /login.php');
        exit;
    }
}

function checkForcePasswordReset() {
    $user = $_SESSION['user'] ?? null;
    if ($user && !empty($user['passwordResetRequired']) && $user['passwordResetRequired'] === true) {
        header('Location: /reset_password.php');
        exit;
    }
}

function require_guest() {
    $cookie = $_COOKIE['autobk_jwt'] ?? null;
    if ($cookie) { 
        header('Location: /devices.php'); 
        exit; 
    }
}

function require_admin() {
    $user = require_auth();
    if (empty($user->isAdmin) || $user->isAdmin !== true) {
        header('HTTP/1.1 403 Forbidden');
        echo "403 Forbidden: You do not have permission to access this page.";
        exit;
    }
}

