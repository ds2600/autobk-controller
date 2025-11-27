<?php
require __DIR__ . '/../src/bootstrap.php'; 

$user = require_auth();
$isAdmin = isset($user->role) && $user->role === 'Administrator';

$title = 'Devices - AutoBk Controller';

include __DIR__ . '/../src/head.php';
include __DIR__ . '/../src/components/navbar.php'; 


?>
  <main class="max-w-6xl mx-auto p-4" x-data="devicesPage()" x-init="init()">
<?php 
//    include __DIR__ . '/../src/loading.php';
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


    <!-- List (READ-ONLY) -->
    <section class="bg-white border rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-medium">All Devices</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
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
                    <template x-if="loading">
                        <template x-for="i in 10" :key="'skeleton-' + i">
                            <tr class="border-t animate-pulse">
                                <td class="py-2 pr-2">
                                    <div class="h-4 bg-gray-200 rounded w-32"></div>
                                </td>
                                <td>
                                    <div class="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                                <td>
                                    <div class="h-4 bg-gray-200 rounded w-28"></div>
                                </td>
                                <td>
                                    <div class="h-4 bg-gray-200 rounded w-36"></div>
                                </td>
                                <td>
                                    <div class="h-4 bg-gray-200 rounded w-32"></div>
                                </td>
                                <td>
                                    <div class="h-4 bg-gray-200 rounded w-40"></div>
                                </td>
                            </tr>
                        </template>
                    </template>
                    <template x-if="!loading && rows.length">
                        <template x-for="d in rows" :key="d.kSelf">
                            <tr class="border-t">
                                <td class="py-2 pr-2" x-text="d.sName"></td>
                                <td x-text="d.sType"></td>
                                <td x-text="d.sIP"></td>

                                <!-- Latest Backup -->
                                <td>
                                    <template x-if="d.latestBackup">
                                        <a href="javascript:void(0)" 
                                           @click="downloadLatest(d.latestBackup)" 
                                           class="text-blue-700 hover:underline"
                                           x-text="fmtDate(d.latestBackup.tComplete)"
                                        ></a>
                                    </template>
                                    <template x-if="!d.latestBackup">
                                        <span class="text-gray-500">No backups yet</span>
                                    </template>
                                </td>

                                <!-- Next Scheduled -->
                                <td>
                                    <template x-if="d.nextScheduled">
                                        <div class="flex items-center gap-2">
                                            <span x-text="fmtDate(d.nextScheduled.tTime)"></span>

                                            <!-- Overdue badge if more than 1 hour ago -->
                                            <span
                                                x-show="isOverdue(d.nextScheduled.tTime)"
                                                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-300"
                                            >
                                                Overdue
                                            </span>
                                        </div>
                                    </template>

                                    <template x-if="!d.nextScheduled">
                                        <span class="text-gray-500">No upcoming</span>
                                    </template>
                                </td>

                                <!-- Actions -->
                                <td class="whitespace-nowrap">
                                    <template x-if="d.sType !== 'OneNetLog'">
                                        <div>
                                            <button class="text-blue-700 mr-3" @click="openEdit(d)">Edit</button>
                                            <button
                                                class="text-amber-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                                @click="scheduleNow(d)"
                                                :disabled="schedulingNowId === d.kSelf"
                                            >
                                                <span x-show="schedulingNowId !== d.kSelf">Schedule Now</span>
                                                <span x-show="schedulingNowId === d.kSelf">Scheduling…</span>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="d.sType === 'OneNetLog'">
                                        <span class="text-gray-500">N/A</span>
                                    </template>
                                </td>
                            </tr>
                        </template>
                    </template>
                    <template x-if="!loading && !rows.length">
                        <tr>
                            <td colspan="6" class="py-4 text-center text-gray-500">No devices found.</td>
                        </tr>
                    </template>
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

            debouncedSearch() {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.page = 1;
                    this.clearPageCache();
                    this.load();
                }, 300);
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

            async prefetchNextPage() {
                const nextPage = this.page + 1;
                if (nextPage > this.pages) return;
                if (this.pageCache[nextPage]) return;

                try {
                    const term = encodeURIComponent(this.searchTerm.trim() || '');
                    const r = await api(
                        `devices/summary?page=${nextPage}&pageSize=${this.pageSize}&search=${term}`
                    );

                    this.pageCache[nextPage] = {
                        rows: r.data || [],
                        total: r.meta?.total || 0,
                        pages: r.meta?.pages || 1,
                    };
                } catch (e) {
                    console.debug('Prefetch failed:', e.message);
                }
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
                this.clearPageCache();
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
                this.load(); 
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

                const cached = this.pageCache[this.page];
                if (cached) {
                    setTimeout(() => {
                        this.rows = cached.rows;
                        this.total = cached.total;
                        this.pages = cached.pages;
                        this.loading = false;
                        this.prefetchNextPage();
                    }, 500);
                    return;
                }

                try {
                    this.error = '';
                    const term = encodeURIComponent(this.searchTerm.trim() || '');
                    const r = await api(`devices/summary?page=${this.page}&pageSize=${this.pageSize}&search=${term}`);  
                    const rows = r.data || [];
                    const total = r.meta?.total || 0;
                    const pages = r.meta?.pages || 1;
                    
                    this.rows = rows;
                    this.total = total;
                    this.pages = pages;

                    this.pageCache[this.page] = { rows, total, pages };

                    this.prefetchNextPage();

                } catch(e){ 
//                    this.error = e.message;
                    toast.error(`Failed to load devices: ${e.message}`);
                } finally {
                    this.loading = false;
                }
            },

            goToPage(p) {
                const target = Number(p);
                if (!target || target < 1 || target > this.pages) return;
                this.page = target;
                this.load();
            },

            nextPage() {
                if (this.page < this.pages) {
                    this.page++;
                    this.load();
                }
            },

            prevPage() {
                if (this.page > 1) {
                    this.page--;
                    this.load();
                }
            },

            changePageSize(size) {
                const s = Number(size);
                if (!s || s < 0) return;
                this.pageSize = s;
                this.page = 1;
                this.clearPageCache();
                this.load();
            },



            downloadLatest(latest){
              if (!latest?.kSelf) return;
              window.location = `/backups.php?download=${latest.kSelf}`;
            },

            // Schedule a manual “now”
            async scheduleNow(d){
                if(!d?.kSelf) return;
                if (d.sType === 'OneNetLog') return;
                this.schedulingNowId = d.kSelf;
                this.error = '';

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
                    this.clearPageCache();
                    await this.load();
                } catch (e) {
                    this.error = e.message || `Failed to schedule backup for device ${d.sName}`;
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
                    this.clearPageCache();
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
                    this.clearPageCache();
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
