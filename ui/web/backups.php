<?php
require __DIR__ . '/../src/bootstrap.php'; 

$user = require_auth();
$isAdmin = isset($user->role) && $user->role === 'Administrator';

if (isset($_GET['download']) && is_numeric($_GET['download'])) {
    $backupId = (int)$_GET['download'];
    
    $url = rtrim($apiBase, '/') . "/v1/backups/{$backupId}/";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER         => false,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . ($_COOKIE['autobk_jwt'] ?? ''),
            'Accept: application/json',
        ],
    ]);
    $json = curl_exec($ch);

    if ($json === false) {
        http_response_code(502);
        echo "Error fetching backup: " . curl_error($ch);
        exit;
    }

    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $payload = json_decode($json, true);

    if ($status !== 200 || empty($payload['success']) || empty($payload['data']['filepath'])) {
        http_response_code(404);
        echo "Backup not found or error occurred.";
        exit;
    }

    $filepath = $payload['data']['filepath'];
    $downloadName = $payload['data']['sFile'] ?? basename($filepath);
    
    if (!is_file($filepath) || !is_readable($filepath)) {
        http_response_code(404);
        echo "Backup file not found.";
        exit;
    }

    $mime = function_exists('mime_content_type') ? mime_content_type($filepath) : 'application/octet-stream';

    header('Content-Description: File Transfer');
    header('Content-Type: ' . $mime);
    header('Content-Disposition: attachment; filename="' . basename($downloadName) . '"');
    header('Content-Length: ' . filesize($filepath));
    header('Cache-Control: no-cache');

    readfile($filepath);

    exit;
}

$title = "Backups - AutoBk Controller";

include __DIR__ . '/../src/head.php';
include __DIR__ . '/../src/components/navbar.php'; 

?>
<main class="max-w-6xl mx-auto p-4" x-data="backupsPage()" x-init="init()">
  <section class="mb-4">
    <h1 class="text-xl font-semibold">Backups</h1>
    <p class="text-sm text-gray-600">
      Search for a device, then view and manage its backups.
    </p>
  </section>

  <!-- Device Search -->
  <section class="bg-white border rounded-2xl p-4 mb-4">
    <h2 class="font-medium mb-3">Find a Device</h2>

    <div class="flex flex-col gap-2 md:flex-row md:items-center">
      <div class="flex-1">
        <label class="text-sm font-medium text-gray-700 mb-1 block">
          Search by name or IP
        </label>
        <input
          type="text"
          x-model="deviceSearch"
          @input="debouncedDeviceSearch"
          placeholder="Start typing a device name or IP..."
          class="w-full border rounded-lg px-3 py-2"
        >
      </div>
    </div>

    <!-- Device search results -->
    <div class="mt-3">
      <template x-if="deviceSearchLoading">
        <div class="text-sm text-gray-500">Searching devices…</div>
      </template>

      <template x-if="!deviceSearchLoading && deviceSearchResults.length">
        <ul class="mt-2 border rounded-lg divide-y max-h-56 overflow-y-auto">
          <template x-for="d in deviceSearchResults" :key="d.kSelf">
            <li
              class="px-3 py-2 hover:bg-slate-100 cursor-pointer flex justify-between items-center"
              @click="selectDevice(d)"
            >
              <div>
                <div class="font-medium" x-text="d.sName"></div>
                <div class="text-xs text-gray-500">
                  <span x-text="d.sType"></span> ·
                  <span x-text="d.sIP"></span>
                </div>
              </div>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded bg-slate-800 text-white hover:bg-black"
              >
                Select
              </button>
            </li>
          </template>
        </ul>
      </template>

      <template x-if="!deviceSearchLoading && !deviceSearchResults.length && deviceSearch.trim().length > 0">
        <p class="mt-2 text-sm text-gray-500">
          No devices found for "<span x-text="deviceSearch"></span>".
        </p>
      </template>

      <p class="mt-2 text-sm text-red-600" x-text="deviceSearchError"></p>
    </div>
  </section>

  <!-- Selected Device + Backups List -->
  <section class="bg-white border rounded-2xl p-4">
    <div class="flex items-center justify-between mb-3">
      <div>
        <h2 class="font-medium">Device Backups</h2>
        <template x-if="selectedDevice">
          <p class="text-sm text-gray-600">
            Showing backups for
            <span class="font-semibold" x-text="selectedDevice.sName"></span>
            (<span x-text="selectedDevice.sIP"></span>)
          </p>
        </template>
        <template x-if="!selectedDevice">
          <p class="text-sm text-gray-500">
            Select a device above to view its backups.
          </p>
        </template>
      </div>
    </div>

    <template x-if="selectedDevice">
      <div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-gray-500">
              <tr>
                <th class="py-2">Completed</th>
                <th>Expires</th>
                <th>File</th>
                <th>Comment</th>
                <th class="w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading skeleton -->
              <template x-if="backupsLoading">
                <template x-for="i in 6" :key="'backup-skel-' + i">
                  <tr class="border-t animate-pulse">
                    <td class="py-2 pr-2"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td><div class="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td><div class="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td><div class="h-4 bg-gray-200 rounded w-48"></div></td>
                    <td><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                  </tr>
                </template>
              </template>

              <!-- Actual rows -->
              <template x-if="!backupsLoading && backups.length">
                <template x-for="b in backups" :key="b.kSelf">
                  <tr class="border-t">
                    <td class="py-2 pr-2" x-text="fmtDate(b.tComplete)"></td>
                    <td x-text="b.tExpires ? fmtDate(b.tExpires) : '—'"></td>
                    <td x-text="b.sFile"></td>
                    <td x-text="b.sComment || ''"></td>
                    <td class="whitespace-nowrap">
                      <button
                        class="text-blue-700 mr-3"
                        @click="downloadBackup(b)"
                      >
                        Download
                      </button>
                      <button
                        class="text-red-700"
                        @click="deleteBackup(b)"
                        :disabled="!!deleting[b.kSelf]"
                      >
                        <span x-show="!deleting[b.kSelf]">Delete</span>
                        <span x-show="deleting[b.kSelf]">Deleting…</span>
                      </button>
                    </td>
                  </tr>
                </template>
              </template>

              <!-- No backups state -->
              <template x-if="!backupsLoading && !backups.length">
                <tr>
                  <td colspan="5" class="py-4 text-center text-gray-500">
                    No backups found for this device.
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-red-600 mt-2" x-text="backupsError"></p>
      </div>
    </template>
  </section>
</main>

<script>
function backupsPage() {
  return {
    deviceSearch: '',
    deviceSearchResults: [],
    deviceSearchLoading: false,
    deviceSearchError: '',

    selectedDevice: null,

    backups: [],
    backupsLoading: false,
    backupsError: '',
    deleting: {},

    searchTimeout: null,

    async init() {
        const params = new URLSearchParams(window.location.search);
        const deviceId = params.get('device');

        if (deviceId) {
            await this.loadDeviceDirect(Number(deviceId));
        }
    },

    async loadDeviceDirect(id) {
        try {
            const r = await api(`devices/${id}`);
            const d = r.data;

            if (!d) return;

            this.deviceSearch = d.sName;
            this.deviceSearchResults = [];
            this.selectedDevice = d;

            this.loadBackups();
        } catch (e) {
            toast.error(`Device not found: ${e.message}`);
        }
    },


    debouncedDeviceSearch() {
      clearTimeout(this.searchTimeout);
      const term = this.deviceSearch.trim();

      if (!term) {
        this.deviceSearchResults = [];
        this.deviceSearchError = '';
        return;
      }

      this.searchTimeout = setTimeout(() => {
        this.searchDevices(term);
      }, 300);
    },

    async searchDevices(term) {
      this.deviceSearchLoading = true;
      this.deviceSearchError = '';
      try {
        const encoded = encodeURIComponent(term);
        const r = await api(`devices/summary?page=1&pageSize=20&search=${encoded}`);
        this.deviceSearchResults = r.data || [];
      } catch (e) {
        this.deviceSearchError = e.message || 'Failed to search devices';
        toast.error(`Failed to search devices: ${e.message}`);
      } finally {
        this.deviceSearchLoading = false;
      }
    },

    selectDevice(d) {
      this.selectedDevice = d;
      this.backups = [];
      this.backupsError = '';
      this.loadBackups();
    },

    fmtDate(dt) {
      const d = new Date(dt);
      return isNaN(d) ? '' : d.toLocaleString();
    },

    async loadBackups() {
      if (!this.selectedDevice) return;
      this.backupsLoading = true;
      this.backupsError = '';
      try {
        const r = await api(`backups?deviceId=${this.selectedDevice.kSelf}`);
        this.backups = r.data || [];
      } catch (e) {
        this.backupsError = e.message || 'Failed to load backups';
        toast.error(`Failed to load backups: ${e.message}`);
      } finally {
        this.backupsLoading = false;
      }
    },

    downloadBackup(b) {
      if (!b || !b.kSelf) return;
      window.location = `/backups.php?download=${b.kSelf}`;
    },


    async deleteBackup(b) {
      if (!b || !b.kSelf) return;
      if (!confirm(`Delete backup ${b.sFile || b.kSelf}? `)) return;

      this.deleting[b.kSelf] = true;

      try {
        await api(`backups/${b.kSelf}`, { method: 'DELETE' });
        toast.success('Backup deleted');
        await this.loadBackups();
      } catch (e) {
        this.backupsError = e.message || 'Failed to delete backup';
        toast.error(`Failed to delete backup: ${e.message}`);
      } finally {
        this.deleting[b.kSelf] = false;
      }
    },
  };
}
</script>

<?php include __DIR__ . '/../src/footer.php'; ?>
