<?php
require __DIR__ . '/../src/bootstrap.php';
require __DIR__ . '/../src/utils/github.php';

$github = get_latest_release('ds2600/autobk-controller');
$githubJson = $github ? json_encode([
    'version' => $github['version'],
    'url'     => $github['url'],
]) : null;

$title = 'About AutoBk Controller';

$user = require_auth();
$isAdmin = isset($user->role) && $user->role === 'Administrator';
checkForcePasswordReset();

include __DIR__ . '/../src/head.php';


?>
<script id="github-release-data" type="application/json"><?= $githubJson ?></script>
<?php
include __DIR__ . '/../src/components/navbar.php'; 
?>
  <main class="max-w-6xl mx-auto p-4" x-data="aboutPage()" x-init="init()">
<?php 
    include __DIR__ . '/../src/loading.php';
?>
<!-- AutoBk Controller-->    
    <section 
      class="bg-white border rounded-2xl p-6 shadow-sm"
    >
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-semibold text-lg text-slate-800">
            About AutoBk Controller
          </h2>
          <p class="text-sm text-slate-500">
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
            x-text="appVersion ? `${appVersion}` : 'Version: —'"
          ></span>

              <template x-if="latestVersion">
                <a
                    :href="latestUrl"
                    target="_blank"
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
                    :class="{
                      'bg-green-50 text-green-700 border border-green-200': isUpToDate,
                      'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100': !isUpToDate
                    }"
                    x-text="isUpToDate ? 'Up-to-date' : `Update → v${latestVersion}`"
                >          
                </a>
            </template>
        </div>
      </div>

      <!-- Error message -->
      <div 
        x-show="error" 
        x-cloak
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        x-text="error"
      ></div>

      <!-- Main content -->
      <div x-show="!loading" x-cloak class="grid gap-6 md:grid-cols-2">
        <!-- Memory Donut -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-700">
              Memory usage
            </h3>
            <span class="text-xs text-slate-500" x-text="formatBytes(totalMemory)"></span>
          </div>

          <div class="flex flex-col items-center justify-center flex-1">
            <div class="relative w-40 h-40 mb-3">
              <!-- Donut background -->
              <div 
                class="w-full h-full rounded-full"
                :style="`background: conic-gradient(#3b82f6 ${memoryUsagePercent()}%, #e5e7eb 0);`"
              ></div>
              <!-- Inner circle -->
              <div class="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center">
                <p class="text-2xl font-semibold text-slate-800" 
                   x-text="`${memoryUsagePercent().toFixed(0)}%`"></p>
                <p class="text-xs text-slate-500">Used</p>
              </div>
            </div>

            <div class="flex gap-4 text-xs text-slate-600">
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                <span x-text="`Used: ${formatBytes(usedMemory())}`"></span>
              </div>
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
                <span x-text="`Free: ${formatBytes(freeMemory)}`"></span>
              </div>
            </div>
          </div>
        </div>
        <!-- Storage Donut -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-700">
              Storage usage
            </h3>
            <span class="text-xs text-slate-500" x-text="formatBytes(totalStorage)"></span>
          </div>

          <div class="flex flex-col items-center justify-center flex-1">
            <div class="relative w-40 h-40 mb-3">
              <!-- Donut background -->
              <div 
                class="w-full h-full rounded-full"
                :style="`background: conic-gradient(#6366f1 ${storageUsagePercent()}%, #e5e7eb 0);`"
              ></div>
              <!-- Inner circle -->
              <div class="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center">
                <p class="text-2xl font-semibold text-slate-800" 
                   x-text="`${storageUsagePercent().toFixed(0)}%`"></p>
                <p class="text-xs text-slate-500">Used</p>
              </div>
            </div>

            <div class="flex gap-4 text-xs text-slate-600">
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
                <span x-text="`Used: ${formatBytes(usedStorage())}`"></span>
              </div>
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
                <span x-text="`Free: ${formatBytes(freeStorage)}`"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Info Table -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">
            System details
          </h3>
          <dl class="text-sm divide-y divide-slate-200">
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Hostname</dt>
              <dd class="font-medium text-slate-800" x-text="hostname || '—'"></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Platform</dt>
              <dd class="font-medium text-slate-800" x-text="platform || '—'"></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Environment</dt>
              <dd class="font-medium text-slate-800" x-text="environment || '—'"></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">System Uptime</dt>
              <dd class="font-medium text-slate-800" x-text="humanUptime(uptime)"></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">App Uptime</dt>
              <dd class="font-medium text-slate-800" x-text="humanUptime(appUptime)"></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Total memory</dt>
              <dd class="font-medium text-slate-800" x-text="formatBytes(totalMemory)"></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Free memory</dt>
              <dd class="font-medium text-slate-800" x-text="formatBytes(freeMemory)"></dd>
            </div>
          </dl>
        </div>
        <!-- Version Info -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">
            Version info
          </h3>
          <dl class="text-sm divide-y divide-slate-200">
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">API schema</dt>
              <dd class="font-medium text-slate-800" x-text="apiVersion || '-'"></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Node.js version</dt>
              <dd class="font-medium text-slate-800" x-text="nodeVersion || '-'"></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Database version</dt>
              <dd class="font-medium text-slate-800" x-text="dbVersion || '-'"></dd>
            </div>           
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Web UI</dt>
              <dd class="font-medium text-slate-800">v.<?php echo htmlspecialchars(WEB_VERSION); ?></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">Web server</dt>
              <dd class="font-medium text-slate-800"><?php echo htmlspecialchars($_SERVER['SERVER_SOFTWARE']); ?></dd>
            </div>
            <div class="py-2 flex justify-between">
              <dt class="text-slate-500">PHP Version</dt>
              <dd class="font-medium text-slate-800"><?php echo phpversion(); ?></dd>
            </div>

          </dl>
        </div>
        <!-- End Version Info -->
      </div>
    </section>
    <section class="mt-6 text-center">
        <p class="text-xs text-slate-500 mt-4 mx-auto align-center">
            For issues, feature requests, or contributions, please go to the <a href="https://github.com/ds2600/autobk-controller" target="_blank" class="text-blue-600 underline hover:text-blue-900">AutoBk Controller repository</a>.<br>
        </p>
    </section>
<!-- End AutoBk Controller -->
  </main>
    <script>
    function aboutPage() {
      return {
        appVersion: '',
        apiVersion: '',
        nodeVersion: '',
        dbVersion: '',
        appUptime: 0,
        uptime: 0,
        hostname: '',
        platform: '',
        environment: '',
        totalMemory: 0,
        freeMemory: 0,
        totalStorage: 0,
        freeStorage: 0,
        loading: true,
        error: '',
        latestVersion: null,
        latestUrl: '',
        isUpToDate: true,

        async init() {
          await this.load();
          //this.checkForUpdate();
        },

        async load() {
          this.loading = true;
          this.error = '';
          try {
            const r = await api(`info`);
            const d = r.data || {};

            this.appVersion = 'AutoBk Controller v' + (d.appVersion || '');
            this.apiVersion = d.apiVersion || '';
            this.nodeVersion = d.nodeVersion || '';
            this.dbVersion = d.dbVersion || '';
            this.appUptime = d.appUptime || 0;
            this.uptime = d.uptime || 0;
            this.hostname = d.hostname || '';
            this.platform = (d.platform || '') + '_' + (d.arch || '');
            this.environment = d.environment || '';
            this.totalMemory = d.totalMemory || 0;
            this.freeMemory = d.freeMemory || 0;
            this.totalStorage = d.totalStorage || 0;
            this.freeStorage = d.freeStorage || 0;
          } catch (e) {
            console.error(e);
            this.error = e?.message || 'Failed to load system info.';
          } finally {
            this.loading = false;
          }
        },

        async checkForUpdate() {
            try {
                const phpData = document.getElementById('github-release-data');
                if (!phpData) return;

                const { version, url } = JSON.parse(phpData.textContent);
                this.latestVersion = version;
                this.latestUrl = url;

                const cmp = this.compareSemver(this.appVersion, this.latestVersion);
                this.isUpToDate = cmp >= 0;
            } catch (e) {
                console.warn('Release check failed.', e);
            }
        },

        compareSemver(a, b) {
            const normalize = v => (v || '').replace(/^v/, '').split('.').map(Number);
            const aa = normalize(a);
            const bb = normalize(b);
            for (let i = 0; i < 3; i++) {
                const diff = (aa[i] ?? 0) - (bb[i] ?? 0);
                if (diff !== 0) return diff > 0 ? 1 : -1;
            }
            return 0;
        },

        usedMemory() {
            if (!this.totalMemory) return 0;
            const used = this.totalMemory - (this.freeMemory || 0);
            return used < 0 ? 0 : used;
        },

        memoryUsagePercent() {
            if (!this.totalMemory) return 0;
            const pct = (this.usedMemory() / this.totalMemory) * 100;
            return Math.max(0, Math.min(100, pct)); // clamp 0-100
        },

        usedStorage() {
            if (!this.totalStorage) return 0;
            const used = this.totalStorage - (this.freeStorage || 0);
            return used < 0 ? 0 : used;
        },

        storageUsagePercent() {
            if (!this.totalStorage) return 0;
            const pct = (this.usedStorage() / this.totalStorage) * 100;
            return Math.max(0, Math.min(100, pct)); // clamp 0-100
        },

        formatBytes(bytes) {
            const num = Number(bytes);
            if (!num || num <= 0) return '0 B';

            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(num) / Math.log(1024));
            const value = num / Math.pow(1024, i);

            return `${value.toFixed(1)} ${sizes[i]}`;
        },


        formatBytes(bytes) {
          const num = Number(bytes);
          if (!num || num <= 0) return '0 B';

          const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
          const i = Math.floor(Math.log(num) / Math.log(1024));
          const value = num / Math.pow(1024, i);

          return `${value.toFixed(1)} ${sizes[i]}`;
        },

        humanUptime(t) {
          const s = Math.floor(t || 0);
          if (!s) return '—';

          let remaining = s;
          const days = Math.floor(remaining / 86400);
          remaining %= 86400;
          const hours = Math.floor(remaining / 3600);
          remaining %= 3600;
          const minutes = Math.floor(remaining / 60);

          const parts = [];
          if (days) parts.push(`${days}d`);
          if (hours || days) parts.push(`${hours}h`);
          parts.push(`${minutes}m`);

          return parts.join(' ');
        },
      };
    }
    </script>
    </body>
</html>
