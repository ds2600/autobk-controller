<?php
require_once __DIR__ . '/../src/bootstrap.php';

session_start();
require_guest();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) {
        $error = 'Invalid request';
    } else {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Invalid email';
        } elseif (!$password) {
            $error = 'Password required';
        } else {
            $payload = json_encode(['email' => $email, 'password' => $password], JSON_UNESCAPED_UNICODE);
            if ($payload === false) {
                $error = 'Server error';
            } else {
                $ch = curl_init($apiInternalBase . 'v1/auth/login');
                curl_setopt_array($ch, [
                    CURLOPT_POST => true,
                    CURLOPT_HTTPHEADER => [
                        'Content-Type: application/json',
                        'Content-Length: ' . strlen($payload)
                    ],
                    CURLOPT_POSTFIELDS => $payload,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT => 10,
                    CURLOPT_CONNECTTIMEOUT => 5,
                ]);
                $resp = curl_exec($ch);
                if ($resp === false) {
                    error_log('cURL Error: ' . curl_error($ch));
                    $error = 'Service unavailable';
                    $code = 0;
                } else {
                    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                }
                curl_close($ch);
                if ($code === 200) {
                    $json = json_decode($resp, true);
                    if ($json['success']) {
                        if (json_last_error() === JSON_ERROR_NONE && !empty($json['data']['token'])) {
                            $token = $json['data']['token'];
                            setcookie('autobk_jwt', $token, [
                                'expires' => time() + 3600,
                                'path' => '/',
                                'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                                'httponly' => true,
                                'samesite' => 'Lax',
                            ]);
                            header('Location: /devices.php');
                            exit;
                        }
                    } else {
                        $error = $json['error']['message'] ?? 'Login failed';
                    }
                }
                if ($code !== 200) {
                    $error = 'Service unavailable';
                }
            }
        }
    }
}
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In – AutoBk</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
            }
          },
          boxShadow: {
            'soft': '0 4px 20px rgba(59, 130, 246, 0.12)',
            'glow': '0 0 30px rgba(59, 130, 246, 0.25)',
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-out forwards',
            'float': 'float 6s ease-in-out infinite',
          }
        }
      }
    }
  </script>
  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-12px); }
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>

<body class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4 overflow-hidden relative">

  <!-- Subtle floating background shapes -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
    <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-400/15 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
  </div>

  <!-- Login Card -->
  <div class="relative w-full max-w-md animate-fade-in">
    <div class="bg-white/90 backdrop-blur-xl rounded-2xl shadow-soft p-8 border border-primary-100">

      <!-- Logo -->
      <div class="flex justify-center mb-8 group">
        <div class="relative">
          <img src="./img/autobk.svg"
               class="w-48 object-contain rounded-xl"
               alt="AutoBK Logo">
          <div class="absolute inset-0 rounded-xl bg-primary-500/20 blur-xl scale-0"></div>
        </div>
      </div>

      <!-- Title 
      <h1 class="text-2xl font-bold text-center bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent mb-6">
      </h1> -->

      <!-- Form -->
      <form method="post" class="space-y-5">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input name="email" type="email" required
                 class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 outline-none"
                 placeholder="you@company.com"
                 autocomplete="username">
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input name="password" type="password" required
                 class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 outline-none"
                 placeholder="••••••••"
                 autocomplete="current-password">
        </div>

        <!-- Error Alert Box -->
<?php if (!empty($error)): ?>
  <div class="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in shadow-sm">
    <i class="fa-solid fa-exclamation-circle text-red-600"></i>
    <span class="text-sm font-medium"><?= htmlspecialchars($error) ?></span>
  </div>
<?php endif; ?>
        <!-- Submit -->
        <button type="submit"
                class="w-full relative overflow-hidden px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group">
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-9 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign In
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
        </button>
      </form>

      <!-- Footer -->
      <p class="mt-6 text-center text-xs text-gray-500">
          &copy; <?= date('Y') ?> <a href="https://github.com/ds2600/autobk-ctrl" target="_new">AutoBk</a>
      </p>
    </div>
  </div>
</body>
</html>
