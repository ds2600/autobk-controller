<?php
require __DIR__ . '/../src/bootstrap.php';

$title = 'About AutoBk Controller';

$user = require_auth();
$isAdmin = isset($user->role) && $user->role === 'Administrator';
checkForcePasswordReset();

include __DIR__ . '/../src/head.php';
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
<?php if ($isAdmin): ?>
      <!-- Self-Update -->
      <div class="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-700">Self-Update</h3>
          <button type="button" @click="rollback()" :disabled="jobRunning" title="Roll back to the previous release"
            class="px-3 py-1.5 rounded-lg border text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Rollback
          </button>
        </div>

        <input type="file" accept=".tar.gz" x-ref="bundleFile" @change="onBundleSelected($event)" class="text-sm">

        <div x-show="manifest" x-cloak class="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <p>Staged: <span class="font-medium" x-text="`v${manifest?.version}`"></span>
             &middot; built <span x-text="manifest?.builtAt"></span>
             &middot; <span class="font-mono text-xs" x-text="manifest?.gitSha"></span></p>
          <button type="button" @click="applyUpdate()" :disabled="jobRunning"
            class="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            Apply Update
          </button>
        </div>

        <p x-show="uploadError" x-cloak class="mt-3 text-sm text-red-600" x-text="uploadError"></p>

        <p class="mt-3 text-xs text-slate-500">
          Download the <code>.tar.gz</code> from the
          <a :href="latestUrl || 'https://github.com/ds2600/autobk-controller/releases'" target="_blank" class="text-blue-600 underline">release page</a>,
          then upload it above.
        </p>
      </div>

      <!-- AutoBk Agent -->
      <div class="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-slate-700">AutoBk Agent</h3>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              x-text="agentVersion ? `v${agentVersion}` : 'Version: —'"
            ></span>
            <template x-if="agentLatestVersion">
              <a
                :href="agentLatestUrl || 'https://github.com/ds2600/autobk-agent/releases'"
                target="_blank"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
                :class="{
                  'bg-green-50 text-green-700 border border-green-200': agentIsUpToDate,
                  'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100': !agentIsUpToDate
                }"
                x-text="agentIsUpToDate ? 'Up-to-date' : `Update → v${agentLatestVersion}`"
              ></a>
            </template>
          </div>
          <button type="button" @click="rollbackAgent()" :disabled="agentJobRunning" title="Roll back the agent to its previous release"
            class="px-3 py-1.5 rounded-lg border text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Rollback
          </button>
        </div>

        <p x-show="agentCheckFailed" x-cloak class="text-xs text-amber-600 mb-2">
          Couldn't reach the agent or GitHub to check for updates — see the API log for details.
        </p>

        <div class="flex items-center gap-2">
          <button type="button" @click="downloadAgentUpdate()"
            :disabled="agentJobRunning || agentIsUpToDate || !agentLatestVersion"
            class="px-3 py-1.5 rounded-lg border text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Download <span x-text="agentLatestVersion ? `v${agentLatestVersion}` : ''"></span>
          </button>

          <template x-if="agentManifest">
            <button type="button" @click="applyAgentUpdate()" :disabled="agentJobRunning"
              class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              Apply <span x-text="`v${agentManifest?.version}`"></span>
            </button>
          </template>
        </div>

        <div x-show="agentManifest" x-cloak class="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <p>Staged: <span class="font-medium" x-text="`v${agentManifest?.version}`"></span>
             &middot; built <span x-text="agentManifest?.builtAt"></span>
             &middot; <span class="font-mono text-xs" x-text="agentManifest?.gitSha"></span></p>
        </div>

        <p x-show="agentError" x-cloak class="mt-3 text-sm text-red-600" x-text="agentError"></p>

        <p class="mt-3 text-xs text-slate-500">
          Checked against the agent's own
          <a href="https://github.com/ds2600/autobk-agent/releases" target="_blank" class="text-blue-600 underline">release page</a>.
          Download fetches and checksum-verifies the release directly on the agent's host — no manual upload needed.
          Only works once the agent has adopted the <code>releases/current</code> layout (see autobk-agent's <code>UPGRADE.md</code>).
        </p>
      </div>
      <!-- End AutoBk Agent -->
<?php endif; ?>
    </section>
    <section class="mt-6 text-center">
        <p class="text-xs text-slate-500 mt-4 mx-auto align-center">
            For issues, feature requests, or contributions, please go to our repository on <a href="https://github.com/ds2600/autobk-controller/issues" target="_blank" class="text-blue-600 underline hover:text-blue-900">Github</a>.<br>
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
        manifest: null,
        stagingId: null,
        jobRunning: false,
        uploadError: '',

        agentVersion: '',
        agentLatestVersion: null,
        agentLatestUrl: '',
        agentIsUpToDate: true,
        agentCheckFailed: false,
        agentManifest: null,
        agentStagingId: null,
        agentJobRunning: false,
        agentError: '',

        async init() {
          await this.load();
          this.checkForUpdate();
          this.checkAgentUpdate();
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
                const r = await api('updates/check');
                const d = r.data || {};
                this.latestVersion = d.latestVersion;
                this.latestUrl = d.releaseUrl;
                this.isUpToDate = d.isUpToDate;
            } catch (e) {
                console.warn('Release check failed.', e);
            }
        },

        async onBundleSelected(evt) {
            const file = evt.target.files?.[0];
            if (!file) return;

            this.uploadError = '';
            this.manifest = null;
            this.stagingId = null;

            const form = new FormData();
            form.append('bundle', file);

            try {
                const res = await fetch(API_BROWSER_BASE + 'v1/updates/upload', {
                    method: 'POST',
                    credentials: 'include',
                    body: form,
                });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(body?.error?.message || res.statusText || 'Upload failed');

                this.stagingId = body.data.stagingId;
                this.manifest = body.data.manifest;
            } catch (e) {
                this.uploadError = e?.message || 'Upload failed.';
            } finally {
                this.$refs.bundleFile.value = '';
            }
        },

        applyUpdate() {
            if (!this.stagingId || this.jobRunning) return;
            this.jobRunning = true;
            JobModal.open({
                title: `Apply v${this.manifest?.version}`,
                startPath: 'updates/apply',
                startOpts: { method: 'POST', body: JSON.stringify({ stagingId: this.stagingId }) },
                logPath: (jobId, offset) => `updates/jobs/${jobId}/log?offset=${offset}`,
                onDone: (job) => {
                    this.jobRunning = false;
                    this.manifest = null;
                    this.stagingId = null;
                    // The API process restarts itself on success -- there's nothing left
                    // for the user to do but see the new version, so just show it to them.
                    if (job.status === 'succeeded') this.reloadAfterRestart();
                },
                onError: () => { this.jobRunning = false; },
            });
        },

        rollback() {
            if (this.jobRunning) return;
            this.jobRunning = true;
            JobModal.open({
                title: 'Rollback to previous release',
                startPath: 'updates/rollback',
                startOpts: { method: 'POST' },
                logPath: (jobId, offset) => `updates/jobs/${jobId}/log?offset=${offset}`,
                onDone: (job) => {
                    this.jobRunning = false;
                    if (job.status === 'succeeded') this.reloadAfterRestart();
                },
                onError: () => { this.jobRunning = false; },
            });
        },

        reloadAfterRestart() {
            toast.success('Done. Reloading in a few seconds...');
            setTimeout(() => location.reload(), 4000);
        },

        async checkAgentUpdate() {
            try {
                const r = await api('agent-updates/check');
                const d = r.data || {};
                this.agentVersion = d.currentVersion;
                this.agentLatestVersion = d.latestVersion;
                this.agentLatestUrl = d.releaseUrl;
                this.agentIsUpToDate = d.isUpToDate;
                this.agentCheckFailed = !!d.checkFailed;
            } catch (e) {
                console.warn('Agent release check failed.', e);
                this.agentCheckFailed = true;
            }
        },

        downloadAgentUpdate() {
            if (!this.agentLatestVersion || this.agentJobRunning) return;
            this.agentJobRunning = true;
            this.agentError = '';
            JobModal.open({
                title: `Download agent v${this.agentLatestVersion}`,
                startPath: 'agent-updates/download',
                startOpts: { method: 'POST', body: JSON.stringify({ version: this.agentLatestVersion }) },
                logPath: (jobId, offset) => `agent-updates/jobs/${jobId}/log?offset=${offset}`,
                onDone: (job) => {
                    this.agentJobRunning = false;
                    if (job.status === 'succeeded') {
                        this.agentStagingId = job.result?.stagingId;
                        this.agentManifest = job.result?.manifest;
                    } else {
                        this.agentError = job.error || 'Download failed.';
                    }
                },
                onError: (e) => { this.agentJobRunning = false; this.agentError = e.message || 'Download failed.'; },
            });
        },

        applyAgentUpdate() {
            if (!this.agentStagingId || this.agentJobRunning) return;
            this.agentJobRunning = true;
            JobModal.open({
                title: `Apply agent v${this.agentManifest?.version}`,
                startPath: 'agent-updates/apply',
                startOpts: { method: 'POST', body: JSON.stringify({ stagingId: this.agentStagingId }) },
                logPath: (jobId, offset) => `agent-updates/jobs/${jobId}/log?offset=${offset}`,
                onDone: (job) => {
                    this.agentJobRunning = false;
                    if (job.status === 'succeeded') {
                        this.agentManifest = null;
                        this.agentStagingId = null;
                        toast.success('Agent updated.');
                        this.checkAgentUpdate();
                    } else {
                        this.agentError = job.error || 'Apply failed.';
                    }
                },
                onError: (e) => { this.agentJobRunning = false; this.agentError = e.message || 'Apply failed.'; },
            });
        },

        rollbackAgent() {
            if (this.agentJobRunning) return;
            this.agentJobRunning = true;
            JobModal.open({
                title: 'Rollback agent to previous release',
                startPath: 'agent-updates/rollback',
                startOpts: { method: 'POST' },
                logPath: (jobId, offset) => `agent-updates/jobs/${jobId}/log?offset=${offset}`,
                onDone: (job) => {
                    this.agentJobRunning = false;
                    if (job.status === 'succeeded') {
                        toast.success('Agent rolled back.');
                        this.checkAgentUpdate();
                    } else {
                        this.agentError = job.error || 'Rollback failed.';
                    }
                },
                onError: (e) => { this.agentJobRunning = false; this.agentError = e.message || 'Rollback failed.'; },
            });
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
