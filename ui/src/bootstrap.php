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

const MIN_PHP_VERSION = '8.5.12';

function php_version_ok(): bool {
    return version_compare(PHP_VERSION, MIN_PHP_VERSION, '>=');
}

// Renders a standalone page (no navbar/head.php -- the menu and every other function are
// what this is disabling) and halts. Called from require_auth() and login.php, which
// between them gate every authenticated page and the login action itself.
function render_php_version_gate(): void {
    http_response_code(503);
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Update Required - AutoBk Controller</title>
</head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:28rem;background:#fef2f2;border:2px solid #dc2626;border-radius:16px;padding:2rem;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.1);">
    <h1 style="color:#991b1b;font-size:1.25rem;margin:0 0 0.75rem;">Server Update Required</h1>
    <p style="color:#7f1d1d;margin:0;">
      AutoBk Controller requires PHP <?= htmlspecialchars(MIN_PHP_VERSION) ?> or newer.
      This server is running PHP <?= htmlspecialchars(PHP_VERSION) ?>.
    </p>
  </div>
</body>
</html>
    <?php
    exit;
}

function require_auth() {
    if (!php_version_ok()) {
        render_php_version_gate();
    }

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

function eas_enabled(): bool {
    $agentDir = $_ENV['AGENT_DIR'] ?? getenv('AGENT_DIR') ?? '';
    if ($agentDir === '') return false;

    $iniPath = rtrim($agentDir, '/') . '/autobk.ini';
    if (!is_file($iniPath)) return false;

    $ini = @parse_ini_file($iniPath, true);
    return !empty($ini['EAS']['Directory']);
}

function require_admin() {
    $user = require_auth();
    if (empty($user->isAdmin) || $user->isAdmin !== true) {
        header('HTTP/1.1 403 Forbidden');
        echo "403 Forbidden: You do not have permission to access this page.";
        exit;
    }
}

