<?php
require __DIR__ . '/../src/bootstrap.php';

$user = require_auth();
$isAdmin = isset($user->role) && $user->role === 'Administrator';
if (!$isAdmin) {
    http_response_code(403);
    header('Location: devices.php');
    exit;
}
checkForcePasswordReset();

$title = 'Audit Log - AutoBk Controller';

$additionalHeadContent = '
 <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
 <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
 <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
';

include __DIR__ . '/../src/head.php';
include __DIR__ . '/../src/components/navbar.php';
?>

<main class="max-w-6xl mx-auto p-4" x-data="auditPage()" x-init="init()">
<div x-show="!loading" x-cloak>
<?php include __DIR__ . '/../src/loading.php'; ?>

    <section class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-semibold">Audit Log</h1>
    </section>

    <!-- Device ID resolver -->
    <section class="bg-white border rounded-2xl p-4 mb-4">
        <h2 class="font-medium mb-3">Resolve Device ID</h2>
        <p class="text-sm text-gray-500 mb-3">
            Look up a device by its numeric id (<code>kSelf</code>/<code>kDevice</code>) — e.g. a backup directory
            name on disk, or a raw id seen below. Works for deleted devices too.
        </p>
        <form class="flex items-end gap-3" @submit.prevent="resolveLookup">
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">Device ID</label>
                <input x-model.number="lookupId" type="number" min="1" class="border rounded-lg px-3 py-2 w-40" placeholder="42" required>
            </div>
            <button type="submit" class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black text-sm">Resolve</button>
            <div class="flex-1">
                <template x-if="lookupResult">
                    <div class="text-sm" :class="lookupResult.deleted ? 'text-amber-700' : 'text-green-700'">
                        <span class="font-medium" x-text="lookupResult.sName"></span>
                        <span x-text="'(' + lookupResult.sType + ', ' + lookupResult.sIP + ')'"></span>
                        <span x-show="lookupResult.deleted" class="ml-1 text-gray-500">
                            — deleted <span x-text="fmtDate(lookupResult.deletedAt)"></span>
                        </span>
                    </div>
                </template>
                <template x-if="lookupError">
                    <div class="text-sm text-red-600" x-text="lookupError"></div>
                </template>
            </div>
        </form>
    </section>

    <!-- Filters -->
    <section class="bg-white border rounded-2xl p-4 mb-4">
        <form class="flex items-end gap-3" @submit.prevent="load">
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">Resource Type</label>
                <select x-model="filterResourceType" class="border rounded-lg px-3 py-2">
                    <option value="">All</option>
                    <template x-for="t in resourceTypes" :key="t">
                        <option :value="t" x-text="t"></option>
                    </template>
                </select>
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">Resource ID</label>
                <input x-model="filterResourceId" class="border rounded-lg px-3 py-2 w-32" placeholder="42">
            </div>
            <button type="submit" class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black text-sm">Apply</button>
            <button type="button" class="px-4 py-2 rounded-lg border text-sm" @click="clearFilters">Clear</button>
        </form>
    </section>

    <section class="bg-white border rounded-2xl p-4">
        <div class="overflow-x-auto">
            <table id="auditTable" class="w-full text-sm">
                <thead class="text-left text-gray-500">
                    <tr>
                        <th class="py-2">Time</th>
                        <th>Action</th>
                        <th>Resource</th>
                        <th>Device</th>
                        <th>Actor</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <p class="text-sm text-red-600 mt-2" x-text="error"></p>
    </section>
</div>
</main>

<script>
function auditPage() {
    return {
        loading: true,
        error: '',
        rows: [],
        dt: null,

        resourceTypes: ['Device', 'Backup', 'Schedule', 'User', 'Session', 'Setting', 'EasOneNetVersionScrape', 'cache'],
        filterResourceType: '',
        filterResourceId: '',

        lookupId: null,
        lookupResult: null,
        lookupError: '',

        identityCache: {},

        async init() {
            await this.load();
        },

        fmtDate(dt) {
            if (!dt) return '';
            const d = new Date(dt);
            return isNaN(d) ? '' : d.toLocaleString();
        },

        escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, (c) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
            }[c]));
        },

        clearFilters() {
            this.filterResourceType = '';
            this.filterResourceId = '';
            this.load();
        },

        async resolveLookup() {
            this.lookupResult = null;
            this.lookupError = '';
            if (!this.lookupId) return;

            try {
                const identity = await this.resolveIdentity(this.lookupId);
                if (!identity) {
                    this.lookupError = `No device found for id ${this.lookupId}`;
                } else {
                    this.lookupResult = identity;
                }
            } catch (e) {
                this.lookupError = e.message || 'Lookup failed';
            }
        },

        async resolveIdentity(id) {
            if (id === null || id === undefined || id === '') return null;
            if (this.identityCache[id] !== undefined) return this.identityCache[id];

            try {
                const r = await api(`devices/${id}/identity`);
                this.identityCache[id] = r.data;
                return r.data;
            } catch (e) {
                this.identityCache[id] = null;
                return null;
            }
        },

        deviceIdForRow(row) {
            if (row.resourceType === 'Device') return row.resourceId;
            if (row.resourceType === 'Backup' || row.resourceType === 'Schedule') {
                const payload = row.after || row.before || {};
                return payload.kDevice != null ? String(payload.kDevice) : null;
            }
            return null;
        },

        async load() {
            this.error = '';
            this.loading = true;

            try {
                const params = new URLSearchParams({ page: '1', limit: '200' });
                if (this.filterResourceType) params.set('resourceType', this.filterResourceType);
                if (this.filterResourceId) params.set('resourceId', this.filterResourceId);

                const r = await api(`audit?${params.toString()}`);
                const rows = r.data || [];

                const deviceIds = [...new Set(rows.map(row => this.deviceIdForRow(row)).filter(id => id != null))];
                await Promise.all(deviceIds.map(id => this.resolveIdentity(id)));

                this.rows = rows;
                this.ensureDataTable();
                this.dt.clear();
                this.dt.rows.add(rows);
                this.dt.draw();
            } catch (e) {
                this.error = e.message || 'Failed to load audit log';
                toast.error(this.error);
            } finally {
                this.loading = false;
            }
        },

        ensureDataTable() {
            if (this.dt) return;

            if (!window.jQuery || !jQuery.fn || !jQuery.fn.DataTable) {
                this.error = 'DataTables is not loaded. Add jQuery + DataTables CSS/JS to head.php.';
                toast.error(this.error);
                return;
            }

            const self = this;

            this.dt = jQuery('#auditTable').DataTable({
                pageLength: 25,
                lengthMenu: [10, 25, 50, 100, 200],
                order: [[0, 'desc']],
                data: [],
                columns: [
                    {
                        data: 'createdAt',
                        title: 'Time',
                        render: (data) => self.fmtDate(data),
                    },
                    { data: 'action', title: 'Action' },
                    {
                        data: null,
                        title: 'Resource',
                        render: (row) => `${row.resourceType} #${row.resourceId}`,
                    },
                    {
                        data: null,
                        title: 'Device',
                        render: (row) => {
                            const id = self.deviceIdForRow(row);
                            if (id == null) return '<span class="text-gray-400">—</span>';

                            const identity = self.identityCache[id];
                            if (identity === undefined) return '<span class="text-gray-400">…</span>';
                            if (identity === null) return `<span class="text-gray-400">Unknown (#${id})</span>`;

                            const name = self.escapeHtml(identity.sName);
                            const ip = self.escapeHtml(identity.sIP);
                            const badge = identity.deleted
                                ? `<span class="text-amber-700">${name} (deleted)</span>`
                                : `<span class="text-gray-900">${name}</span>`;

                            return `${badge} <span class="text-gray-400">${ip}</span>`;
                        },
                    },
                    {
                        data: 'actorUserId',
                        title: 'Actor',
                        render: (data) => data == null ? '<span class="text-gray-400">—</span>' : `#${data}`,
                    },
                ],
            });
        },
    };
}
</script>
