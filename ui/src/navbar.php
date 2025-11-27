  <header class="bg-white/80 backdrop-blur-xl border-b border-primary-100 sticky top-0 z-50 shadow-soft">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo & Title -->
        <div class="flex items-center gap-3 group">
          <div class="relative">
            <img src="./img/autobk.svg" class="h-9 w-9 object-contain rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" alt="Logo">
            <div class="absolute inset-0 rounded-lg bg-primary-500/20 blur-xl scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          </div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            Devices
          </h1>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-1">
          <a href="./devices.php" 
             class="relative px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:text-primary-700 group overflow-hidden rounded-lg">
            <span class="relative z-10">Devices</span>
            <span class="absolute inset-0 bg-primary-50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
          </a>

          <a href="./backups.php" 
             class="relative px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:text-primary-700 group overflow-hidden rounded-lg">
            <span class="relative z-10">Backups</span>
            <span class="absolute inset-0 bg-primary-50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
          </a>
          
          <a href="./reports.php" 
             class="relative px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:text-primary-700 group overflow-hidden rounded-lg">
            <span class="relative z-10">Reports</span>
            <span class="absolute inset-0 bg-primary-50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
          </a>
          
        </nav>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <!-- Logout Button -->
          <button 
            onclick="clearToken(); location.href='./login.php'" 
            class="relative overflow-hidden px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group">
            <span class="relative z-10 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Logout
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </button>

          <!-- Mobile Menu Toggle -->
          <button class="md:hidden p-2 rounded-lg hover:bg-primary-50 text-gray-600 hover:text-primary-700 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu (Hidden by default) -->
    <div class="md:hidden hidden border-t border-primary-100 bg-white/95 backdrop-blur-xl">
      <div class="px-4 py-3 space-y-1">
        <a href="./backups.php" class="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">Backups</a>
      </div>
    </div>
  </header>
