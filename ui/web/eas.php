<?php
require __DIR__ . '/../src/bootstrap.php';

$user = require_auth();
$isAdmin = isset($user->role) && $user->role === 'Administrator';
checkForcePasswordReset();

if (!eas_enabled()) {
    header('Location: /devices.php');
    exit;
}

if (isset($_GET['download']) && $_GET['download'] === 'onenet-version') {
    $url = rtrim($apiInternalBase, '/') . "/v1/eas/onenet-version/download";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER         => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . ($_COOKIE['autobk_jwt'] ?? ''),
        ],
    ]);
    $response = curl_exec($ch);

    if ($response === false) {
        http_response_code(502);
        echo "Error fetching report: " . curl_error($ch);
        exit;
    }

    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);

    if ($status !== 200) {
        http_response_code($status ?: 502);
        echo "No OneNet version report is available yet.";
        exit;
    }

    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);

    $downloadName = 'onenet_version_scrape.csv';
    if (preg_match('/Content-Disposition:\s*attachment;\s*filename="?([^"\r\n]+)"?/i', $headers, $m)) {
        $downloadName = basename($m[1]);
    }

    header('Content-Description: File Transfer');
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Length: ' . strlen($body));
    header('Cache-Control: no-cache');

    echo $body;
    exit;
}

$title = "EAS - AutoBk Controller";

include __DIR__ . '/../src/head.php';
include __DIR__ . '/../src/components/navbar.php';

?>
<main class="max-w-6xl mx-auto p-4" x-data="easPage()" x-init="init()">
  <section class="mb-4">
    <h1 class="text-xl font-semibold">EAS</h1>
  </section>

  <div class="grid gap-6 md:grid-cols-2">
    <!-- OneNet Software Versions -->
    <section class="bg-white border rounded-2xl p-4">
      <h2 class="font-medium mb-2">OneNet Software Versions</h2>
      <p class="text-sm text-gray-600 mb-4">
        Pulls software and OS version from every OneNet device into a CSV.
      </p>

      <div class="flex items-center gap-3">
        <?php if ($isAdmin): ?>
        <button
          type="button"
          @click="runOneNetScrape()"
          :disabled="running"
          class="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span x-show="!running">Run Scrape</span>
          <span x-show="running">Running…</span>
        </button>
        <?php endif; ?>

        <button
          type="button"
          @click="downloadLatest()"
          :disabled="!latestReport"
          class="px-4 py-2 rounded-lg border text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download Latest CSV
        </button>
      </div>

      <p class="mt-3 text-xs text-gray-500" x-show="latestReport">
        Last report: <span x-text="latestReport?.name"></span>
        (<span x-text="fmtDate(latestReport?.generatedAt)"></span>)
      </p>
      <p class="mt-3 text-xs text-gray-500" x-show="!latestReport && !checkingLatest">
        No report has been generated yet.
      </p>

      <p class="mt-2 text-sm text-red-600" x-text="error"></p>
    </section>
  </div>
</main>

<script>
function easPage() {
  return {
    running: false,
    checkingLatest: true,
    latestReport: null,
    error: '',

    async init() {
      await this.loadLatest();
    },

    async loadLatest() {
      this.checkingLatest = true;
      try {
        const r = await api('eas/onenet-version/latest');
        this.latestReport = r.data;
      } catch (e) {
        this.latestReport = null;
      } finally {
        this.checkingLatest = false;
      }
    },

    runOneNetScrape() {
      this.error = '';
      this.running = true;
      JobModal.open({
        title: 'OneNet Version Scrape',
        startPath: 'eas/onenet-version/run',
        startOpts: { method: 'POST' },
        logPath: (jobId, offset) => `eas/onenet-version/jobs/${jobId}/log?offset=${offset}`,
        onDone: (job) => {
          this.running = false;
          if (job.status === 'succeeded') {
            this.latestReport = job.result;
            toast.success('OneNet version scrape complete.');
          } else {
            this.error = job.error || 'Scrape failed';
            toast.error(`OneNet version scrape failed: ${job.error || 'unknown error'}`);
          }
        },
        onError: (e) => {
          this.running = false;
          this.error = e.message || 'Scrape failed';
          toast.error(`OneNet version scrape failed: ${e.message}`);
        },
      });
    },

    downloadLatest() {
      if (!this.latestReport) return;
      window.location = './eas.php?download=onenet-version';
    },

    fmtDate(dt) {
      if (!dt) return '';
      const d = new Date(dt);
      return isNaN(d) ? '' : d.toLocaleString();
    },
  };
}
</script>

<?php include __DIR__ . '/../src/footer.php'; ?>
