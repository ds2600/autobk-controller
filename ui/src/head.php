<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title ?? 'AutoBk Controller'; ?></title>
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
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
              }
            }
          },
          plugins: [],
        }
    </script>
<script>
    window.APP_CONFIG = {
        apiBrowserBase: '<?= htmlspecialchars($_ENV['API_BROWSER_BASE'] ?? '/api', ENT_QUOTES) ?>',
    };
</script>
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="./js/app.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

</head>

<body class="bg-gray-50" x-data x-init="$store.load = { n:0, on(){this.n++}, off(){this.n=Math.max(0,this.n-1)} }">
