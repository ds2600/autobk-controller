<?php
require __DIR__ . '/../src/bootstrap.php'; 

$user = require_auth();
$isAdmin = isset($user->role) && $user->role === 'Administrator';
checkForcePasswordReset();

$title = 'Devices - AutoBk Controller';

$additionalHeadContent = '
 <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
 <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
 <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
';

include __DIR__ . '/../src/head.php';
include __DIR__ . '/../src/components/navbar.php'; 
?>
  <main class="max-w-6xl mx-auto p-4" x-data="devicesPage()" x-init="init()">
  <div x-show="!loading" x-cloak>
<?php 
    include __DIR__ . '/../src/loading.php';
    include __DIR__ . '/../src/components/devices/device_navbar.php';
?>
    <!-- Create device -->
    <section 
        class="bg-white border rounded-2xl p-4 mb-4"
        x-show="showCreateForm" 
        x-transition.opacity
    >
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-medium">Add Device</h2>
        </div>

      <form class="grid md:grid-cols-6 gap-3" @submit.prevent="create">
        <div class="md:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Name <span class="text-red-600">*</span></label>
            <input x-model="form.sName" placeholder="BFD1-SRC-INCA1" class="border rounded-lg px-3 py-2" required>
        </div>

        <div class="md:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Device Type <span class="text-red-600">*</span></label>
            <select x-model="form.sType" class="border rounded-lg px-3 py-2" required :disabled="deviceTypeLoading">
              <option value="" disabled selected>Select type</option>
              <template x-for="type in deviceTypes" :key="type">
                <option :value="type" x-text="type"></option>
              </template>
            </select>
        </div>
        
        <div class="md:col-span-2 flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Management IP <span class="text-red-600">*</span></label>
            <input x-model="form.sIP" placeholder="10.0.0.10" class="border rounded-lg px-3 py-2" required>
        </div>
       
        <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Backup Day</label>
            <select x-model.number="form.iAutoDay" class="border rounded-lg px-3 py-2">
              <template x-for="day in DOW" :key="day.v">
                <option :value="day.v" x-text="day.label"></option>
              </template>
            </select>
        </div> 

        <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Backup Hour</label>

            <select x-model.number="form.iAutoHour" class="border rounded-lg px-3 py-2">
              <template x-for="hour in HOURS" :key="hour.v">
                <option :value="hour.v" x-text="hour.label"></option>
              </template>
            </select>
        </div>
        
        <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Backup Frequency (Weeks)</label>
            <input x-model.number="form.iAutoWeeks" type="number" min="1" placeholder="e.g., 1" class="border rounded-lg px-3 py-2">
        </div>

        <div class="md:col-span-6 flex items-center gap-3 mt-2">
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isCreating"
          >
            <span x-show="!isCreating">Create</span>
            <span x-show="isCreating">Creating…</span>
          </button>

          <button 
            type="button"
            class="text-sm text-gray-600 hover:text-gray-900"
            @click="closeCreateForm()"
          >
            Cancel
          </button>

          <span class="text-sm text-red-600 ml-3" x-text="createError"></span>
        </div>
      </form>
    </section>

    <section class="bg-white border rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-medium">All Devices</h2>
        </div>

        <div class="overflow-x-auto">
            <table id="devicesTable" class="w-full text-sm">
                <thead class="text-left text-gray-500">
                    <tr>
                    <th class="py-2">Name</th>
                    <th>Type</th>
                    <th>IP</th>
                    <th>Latest Backup</th>
                    <th>Next Scheduled</th>
                    <th class="w-48">Actions</th>
                    </tr>
                </thead>
                <tbody id="devrows">
                </tbody>
            </table>
        </div>
        <p class="text-sm text-red-600 mt-2" x-text="error"></p>
    </section>


    <!-- Edit Modal -->
    <div
      x-show="showModal"
      x-transition.opacity
      style="display:none"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div class="bg-white rounded-2xl shadow w-full max-w-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Edit Device</h3>
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-800"
            @click="closeModal()"
          >
            ✕
          </button>
        </div>

        <form class="grid md:grid-cols-2 gap-3">
          <!-- Name -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-sm font-medium text-gray-700">
              Name <span class="text-red-600">*</span>
            </label>
            <input
              x-model="edit.sName"
              class="border rounded-lg px-3 py-2"
              placeholder="BFD1-SRC-INCA1"
              required
            >
          </div>

          <!-- Device Type -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-sm font-medium text-gray-700">
              Device Type <span class="text-red-600">*</span>
            </label>
            <select
              x-model="edit.sType"
              class="border rounded-lg px-3 py-2"
              required
              :disabled="deviceTypeLoading"
            >
              <option value="">Select type</option>
              <template x-for="type in deviceTypes" :key="'edit-' + type">
                <option :value="type" x-text="type"></option>
              </template>
            </select>
          </div>

          <!-- Management IP -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-sm font-medium text-gray-700">
              Management IP <span class="text-red-600">*</span>
            </label>
            <input
              x-model="edit.sIP"
              class="border rounded-lg px-3 py-2"
              placeholder="10.0.0.10"
              required
            >
          </div>

          <!-- Backup Day -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">
              Backup Day
            </label>
            <select
              x-model.number="edit.iAutoDay"
              class="border rounded-lg px-3 py-2"
            >
              <template x-for="day in DOW" :key="'edit-day-' + day.v">
                <option :value="day.v" x-text="day.label"></option>
              </template>
            </select>
          </div>

          <!-- Backup Hour -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">
              Backup Hour
            </label>
            <select
              x-model.number="edit.iAutoHour"
              class="border rounded-lg px-3 py-2"
            >
              <template x-for="hour in HOURS" :key="'edit-hour-' + hour.v">
                <option :value="hour.v" x-text="hour.label"></option>
              </template>
            </select>
          </div>

          <!-- Backup Frequency (Weeks) -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-sm font-medium text-gray-700">
              Backup Frequency (Weeks)
            </label>
            <input
              x-model.number="edit.iAutoWeeks"
              type="number"
              min="1"
              class="border rounded-lg px-3 py-2"
              placeholder="e.g., 1"
            >
          </div>
        </form>

        <div class="flex justify-between items-center mt-5">
          <button
            type="button"
            class="text-red-600 hover:text-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="remove(edit)"
            :disabled="isSavingEdit || isDeletingEdit"
          >
            <span x-show="!isDeletingEdit">Delete</span>
            <span x-show="isDeletingEdit">Deleting…</span>
          </button>
          <div class="flex flex-col items-end gap-2">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="text-sm text-gray-600 hover:text-gray-900"
                @click="closeModal()"
                :disabled="isSavingEdit || isDeletingEdit"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
                @click="saveEdit()"
                :disabled="isSavingEdit || isDeletingEdit"
              >
                <span x-show="!isSavingEdit">Save</span>
                <span x-show="isSavingEdit">Saving…</span>
              </button>
            </div>
            <p class="text-sm text-red-600" x-text="editError"></p>
          </div>
        </div>

      </div>
    </div>

    <!-- Schedule Now Modal -->
    <div
      x-show="showScheduleModal"
      x-transition.opacity
      style="display:none"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div class="bg-white rounded-2xl shadow w-full max-w-md p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Schedule a Backup Now</h3>
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-800"
            @click="closeScheduleModal()"
          >
            ✕
          </button>
        </div>

        <div class="text-sm text-gray-700 space-y-3">
          <p>
            This adds a one-time backup request for
            <strong x-text="scheduleTarget?.sName"></strong>. It does not run instantly.
          </p>
          <p x-show="backupHz > 0">
            AutoBk checks for new requests every
            <strong x-text="scheduleIntervalLabel()"></strong>. Once it sees this one, it runs the backup and clears the request.
          </p>
          <p x-show="!(backupHz > 0)">
            AutoBk checks for new requests on its regular cycle. Once it sees this one, it runs the backup and clears the request.
          </p>
          <p>This doesn't change this device's regular recurring schedule.</p>
        </div>

        <div class="flex justify-end items-center gap-3 mt-5">
          <button
            type="button"
            class="text-sm text-gray-600 hover:text-gray-900"
            @click="closeScheduleModal()"
            :disabled="schedulingNowId === scheduleTarget?.kSelf"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
            @click="confirmScheduleNow()"
            :disabled="schedulingNowId === scheduleTarget?.kSelf"
          >
            <span x-show="schedulingNowId !== scheduleTarget?.kSelf">Schedule Backup</span>
            <span x-show="schedulingNowId === scheduleTarget?.kSelf">Scheduling…</span>
          </button>
        </div>
        <p class="text-sm text-red-600 mt-2" x-text="scheduleError"></p>
      </div>
    </div>
  </div><!--Loading div end-->
  </main>

    <script>
    function devicesPage(){
        const DOW = [
            { v:0, label: 'None' },
            { v:1, label: 'Monday' },
            { v:2, label: 'Tuesday' },
            { v:3, label: 'Wednesday' },
            { v:4, label: 'Thursday' },
            { v:5, label: 'Friday' },
            { v:6, label: 'Saturday' },
            { v:7, label: 'Sunday' },
        ];

        const HOURS = Array.from({length:24}, (_,h)=>({
            v:h, label: new Date(0,0,0,h,0).toLocaleTimeString([], { hour: 'numeric', minute:'2-digit' })
        }));

        const WEEKS = [1,2,3,4,5].map(n=>({ v:n, label: `Every ${n} weeks${n>1?'s':''}`}));

        return {
            deviceTypes: [],
            deviceTypeLoading: true,
            rows: [],
            error: '',
            loading: true,

            page: 1, pages: 1, pageSize: 25, total: 0,
            pageCache: {},

            dt: null,

            showModal: false,
            edit: {
                kSelf: null,
                sName: '',
                sType: '',
                sIP: '',
                iAutoDay: 0,
                iAutoHour: 0,
                iAutoWeeks: 1
            },
            DOW, HOURS, WEEKS,
            showCreateForm: false,
            isCreating: false,
            createError: '',
            isSavingEdit: false,
            isDeletingEdit: false,
            editError: '',
            searchTerm: '',
            searchTimeout: null,
            form: {
                sName: '',
                sType: '',
                sIP: '',
                iAutoDay: 0,
                iAutoHour: 0,
                iAutoWeeks: 1
            },
            schedulingNowId: null,
            showScheduleModal: false,
            scheduleTarget: null,
            scheduleError: '',
            backupHz: null,

            async fetchBackupInterval() {
                try {
                    const r = await api('info');
                    const hz = Number(r?.data?.backupHz);
                    this.backupHz = hz > 0 ? hz : null;
                } catch (e) {
                    this.backupHz = null;
                }
            },

            scheduleIntervalLabel() {
                if (!this.backupHz || this.backupHz <= 0) return '';
                const minutes = Math.round(this.backupHz / 60);
                if (minutes < 1) {
                    return `${this.backupHz} second${this.backupHz === 1 ? '' : 's'}`;
                }
                return `${minutes} minute${minutes === 1 ? '' : 's'}`;
            },

            debouncedSearch() {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    if (this.dt) {
                        this.dt.search((this.searchTerm || '').trim()).draw();
                    }
                }, 150);
            },

            toggleCreateForm() {
              this.showCreateForm = !this.showCreateForm;
              if (this.showCreateForm) {
                this.createError = '';
              }
            },

            openCreateForm() {
              this.showCreateForm = true;
              this.createError = '';
            },

            closeCreateForm() {
              this.showCreateForm = false;
              this.createError = '';
              this.resetForm();
            },

            resetForm() {
              this.form = {
                sName: '',
                sType: '',
                sIP: '',
                iAutoDay: 0,
                iAutoHour: 0,
                iAutoWeeks: 1,
              };
            },

            isOverdue(dt) {
                if (!dt) return false;
                const scheduled = new Date(dt);
                if (isNaN(scheduled)) return false;
                const now = new Date();
                const diffMs = now - scheduled;
                const oneHourMs = 60 * 60 * 1000;

                return diffMs > oneHourMs;
            },

            clearPageCache() {
                this.pageCache = {};
            },


            async create() {
              this.isCreating = true;
              this.createError = '';
              try {

                if (this.form.iAutoDay !== 0) {
                    if (this.form.iAutoHour === '' || this.form.iAutoHour === null || isNaN(this.form.iAutoHour)) {
                        this.createError = 'Please select a time of day when a backup day is set.';
                        this.isCreating = false;
                        return;
                    }
                    if (!this.form.iAutoWeeks || this.form.iAutoWeeks < 1) {
                        this.createError = 'Please enter a valid backup frequency in weeks.';
                        this.isCreating = false;
                        return;
                    }
                }

                await api('devices', {
                  method: 'POST',
                  body: JSON.stringify({
                    sName: this.form.sName,
                    sType: this.form.sType,
                    sIP: this.form.sIP,
                    iAutoDay: this.form.iAutoDay,
                    iAutoHour: this.form.iAutoHour,
                    iAutoWeeks: this.form.iAutoWeeks,
                  }),
                });

                toast.success('Device created');
                this.resetForm();
                this.showCreateForm = false;

                // reload DataTable data
                await this.load(); 
              } catch (e) {
                this.createError = e.message || 'Failed to create device';
                toast.error(`Failed to create device: ${e.message}`);
              } finally {
                this.isCreating = false;
              }
            },

            async init(){
                await this.loadDeviceTypes();
                await this.load();
                this.fetchBackupInterval();
            },

            async loadDeviceTypes() {
                try {
                    const r = await api('devices/types');
                    const types = r.data || [];

                    this.deviceTypes = types.filter(t => ![
                        "OneNetLog",
                    ].includes(t));
                    this.deviceTypeLoading = false;
                } catch (e) {
                    toast.error(`Failed to load device types: ${e.message}`);
                }
            },

            fmtDate(dt){
              const d = new Date(dt);
              return isNaN(d) ? '' : d.toLocaleString();
            },

            async load(){
                this.error = '';
                this.loading = true;

                try {
                    const term = encodeURIComponent('');
                    const r = await api(`devices/summary?page=1&pageSize=5000&search=${term}`);  
                    const rows = r.data || [];

                    this.rows = rows;

                    this.ensureDataTable();

                    this.dt.clear();
                    this.dt.rows.add(rows);
                    this.dt.draw();

                } catch(e){ 
                    toast.error(`Failed to load devices: ${e.message}`);
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

                this.dt = jQuery('#devicesTable').DataTable({
                    pageLength: this.pageSize || 25,
                    lengthMenu: [10, 25, 50, 100, 250, 1000],
                    order: [[0, 'asc']],
                    data: [],
                    columns: [
                        { data: 'sName', title: 'Name' },
                        { data: 'sType', title: 'Type' },
                        { data: 'sIP', title: 'IP' },

                        {
                            data: 'latestBackup',
                            title: 'Latest Backup',
                            orderable: true,
                            render: function(data, type, row) {
                                if (!data) {
                                    return '<span class="text-gray-500">No backups yet</span>';
                                }

                                const dt = data.tComplete;
                                const d = new Date(dt);
                                const label = isNaN(d) ? '' : d.toLocaleString();

                                if (type === 'sort' || type === 'type') {
                                    const ts = isNaN(d) ? 0 : d.getTime();
                                    return ts;
                                }

                                return `<a href="javascript:void(0)" class="text-blue-700 hover:underline js-dl-latest" data-kself="${data.kSelf}">${label}</a>`;
                            }
                        },

                        {
                            data: 'nextScheduled',
                            title: 'Next Scheduled',
                            orderable: true,
                            render: function(data, type, row) {
                                if (!data) {
                                    return '<span class="text-gray-500">No upcoming</span>';
                                }

                                const dt = data.tTime;
                                const d = new Date(dt);
                                const label = isNaN(d) ? '' : d.toLocaleString();

                                // For sorting
                                if (type === 'sort' || type === 'type') {
                                    const ts = isNaN(d) ? 0 : d.getTime();
                                    return ts;
                                }

                                let overdueHtml = '';
                                if (dt) {
                                    const now = new Date();
                                    const diffMs = now - d;
                                    if (!isNaN(d) && diffMs > (60 * 60 * 1000)) {
                                        overdueHtml =
                                            `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-300 ml-2">Overdue</span>`;
                                    }
                                }

                                return `<div class="flex items-center gap-2"><span>${label}</span>${overdueHtml}</div>`;
                            }
                        },

                        // Actions
                        {
                            data: null,
                            title: 'Actions',
                            orderable: false,
                            searchable: false,
                            className: 'whitespace-nowrap',
                            render: function(data, type, row) {
                                if (row.sType === 'OneNetLog') {
                                    return '<span class="text-gray-500">N/A</span>';
                                }

                                return `
                                  <div>
                                    <button class="text-blue-700 mr-3 js-edit" type="button" data-kself="${row.kSelf}">Edit</button>
                                    <button class="text-amber-700 js-sched" type="button" data-kself="${row.kSelf}">
                                      Schedule Now
                                    </button>
                                  </div>
                                `;
                            }
                        }
                    ],
                    autoWidth: false,
                    drawCallback: function() {
                        if (self.schedulingNowId) {
                            jQuery('#devicesTable .js-sched').each(function() {
                                const k = Number(jQuery(this).data('kself'));
                                if (k === Number(self.schedulingNowId)) {
                                    jQuery(this).prop('disabled', true)
                                                .addClass('disabled:opacity-60 disabled:cursor-not-allowed')
                                                .text('Scheduling…');
                                }
                            });
                        }
                    }
                });

                const table = jQuery('#devicesTable');

                table.on('click', '.js-dl-latest', function() {
                    const k = jQuery(this).data('kself');
                    if (k) {
                        window.location = `/backups.php?download=${k}`;
                    }
                });

                table.on('click', '.js-edit', function() {
                    const k = Number(jQuery(this).data('kself'));
                    const row = self.rows.find(r => Number(r.kSelf) === k);
                    if (row) self.openEdit(row);
                });

                table.on('click', '.js-sched', function() {
                    const k = Number(jQuery(this).data('kself'));
                    const row = self.rows.find(r => Number(r.kSelf) === k);
                    if (!row) return;

                    self.openScheduleConfirm(row);
                });
            },

            downloadLatest(latest){
              if (!latest?.kSelf) return;
              window.location = `/backups.php?download=${latest.kSelf}`;
            },

            openScheduleConfirm(d) {
                if (!d?.kSelf || d.sType === 'OneNetLog') return;
                this.scheduleTarget = d;
                this.scheduleError = '';
                this.showScheduleModal = true;
            },

            closeScheduleModal() {
                this.showScheduleModal = false;
                this.scheduleTarget = null;
                this.scheduleError = '';
            },

            async confirmScheduleNow() {
                if (!this.scheduleTarget) return;
                await this.scheduleNow(this.scheduleTarget);
            },

            async scheduleNow(d){
                if(!d?.kSelf) return;
                if (d.sType === 'OneNetLog') return;
                this.schedulingNowId = d.kSelf;
                this.error = '';
                this.scheduleError = '';

                try {
                    await api(`schedules`, {
                        method:'POST',
                        body: JSON.stringify({
                            kDevice: d.kSelf,
                            tTime: new Date().toISOString(),
                            sState: 'Manual'
                        })
                    });
                    toast.success(`Backup scheduled for device ${d.sName}`);
                    this.showScheduleModal = false;
                    this.scheduleTarget = null;

                    // refresh DT
                    await this.load();
                } catch (e) {
                    this.error = e.message || `Failed to schedule backup for device ${d.sName}`;
                    this.scheduleError = e.message || `Failed to schedule backup for device ${d.sName}`;
                    toast.error(`Failed to schedule backup for device ${d.sName}: ${e.message}`);
                } finally {
                    this.schedulingNowId = null;
                }
            },

            // Modal controls
            openEdit(d){ 
                if (!d || d.sType === 'OneNetLog') return;
                this.edit = { ...d }; 
                this.showModal = true; 
            },
            closeModal(){ 
                this.showModal = false; 
                this.edit = {
                    kSelf: null,
                    sName: '',
                    sType: '',
                    sIP: '',
                    iAutoDay: 0,
                    iAutoHour: 0,
                    iAutoWeeks: 1
                };
            },

            async saveEdit(){
                if (!this.edit) return; 
                if (this.edit.sType === 'OneNetLog') return;
                this.isSavingEdit = true;
                this.editError = '';
                try {
                    const d = this.edit;
                    await api(`devices/${d.kSelf}`, {
                        method:'PATCH',
                        body: JSON.stringify({
                            sName:d.sName, sType:d.sType, sIP:d.sIP,
                            iAutoDay:d.iAutoDay, iAutoHour:d.iAutoHour, iAutoWeeks:d.iAutoWeeks
                        })
                    });
                    toast.success('Device updated');
                    this.showModal = false;
                    this.edit = {
                        kSelf: null,
                        sName: '',
                        sType: '',
                        sIP: '',
                        iAutoDay: 0,
                        iAutoHour: 0,
                        iAutoWeeks: 1
                    };

                    // refresh DT
                    await this.load();
                } catch(e){ 
                    this.editError = e.message || 'Failed to save changes';
                    toast.error(`Failed to save changes: ${e.message}`);
                } finally {
                    this.isSavingEdit = false;
                }
            },

            async remove(d){
                if (!d) return;
                if (d.sType === 'OneNetLog') return;
                if(!confirm(`Delete device ${d.sName}? This will cascade related schedules/backups.`)) return;
                this.isDeletingEdit = true;
                this.editError = '';
                try {
                    await api(`devices/${d.kSelf}`, { method:'DELETE' });
                    toast.success('Device deleted');
                    this.showModal = false;
                    this.edit = {
                        kSelf: null,
                        sName: '',
                        sType: '',
                        sIP: '',
                        iAutoDay: 0,
                        iAutoHour: 0,
                        iAutoWeeks: 1
                    };

                    // refresh DT
                    await this.load();
                } catch(e) { 
                    this.editError = e.message || 'Failed to delete device';
                    toast.error(`Failed to delete device: ${e.message}`);
                } finally {
                    this.isDeletingEdit = false;
                }
            }
      }
    }
    </script>
<?php include __DIR__ . '/../src/footer.php'; ?>
