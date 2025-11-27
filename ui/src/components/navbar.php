<nav class="bg-slate-800 p-4 flex justify-between items-center">
    <!-- Left Logo -->
    <div class="flex items-center mr-4">
        <img src="./img/autobk.svg" alt="AutoBk Controller" class="h-10" />
        <div class="flex flex-col ml-2 items-center">
            <span class="text-white text-2xl">AutoBk</span>
            <span class="text-white uppercase text-xs tracking-widest">Controller</span>
        </div>
    </div>

    <!-- Navigation Links -->
    <ul class="flex items-center space-x-2">
        <li><a href="/devices.php" class="text-white hover:text-gray-300 px-4 py-2">Devices</a></li>
        <li><a href="/backups.php" class="text-white hover:text-gray-300 px-4 py-2">Backups</a></li>

        <?php if ($isAdmin) { ?>
            <li><a href="/users.php" class="text-white hover:text-gray-300 px-4 py-2">Users</a></li>
        <?php } ?>

        <li><a href="/about.php" class="text-white hover:text-gray-300 px-4 py-2">About</a></li>
    </ul>

    <div class="flex-grow"></div>

    <!-- Profile Dropdown -->
    <div class="relative flex items-center" x-data="{ open: false }">
        <button
            @click="open = !open"
            class="flex items-center text-white hover:text-gray-300 px-4 py-2 focus:outline-none"
        >
            <i class="fa-solid fa-user text-white text-xl"></i>

            <span class="ml-2">
                <?= htmlspecialchars($user->email ?? '') ?>
            </span>
        </button>

        <!-- Dropdown -->
        <div
            x-show="open"
            @click.away="open = false"
            x-transition
            class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            style="display: none;"
        >
            <ul class="py-2 text-gray-700">
                <li>
                    <a href="/profile.php"
                       class="block px-4 py-2 hover:bg-slate-200 hover:text-slate-900">
                        Profile
                    </a>
                </li>

                <li>
                    <a href="/logout.php"
                       class="block px-4 py-2 hover:bg-slate-200 hover:text-slate-900">
                        Sign Out
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>

