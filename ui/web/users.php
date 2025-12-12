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

$title = 'User Management - AutoBk Controller';

include __DIR__ . '/../src/head.php';
include __DIR__ . '/../src/components/navbar.php';
?>

<main class="max-w-6xl mx-auto p-4" x-data="usersPage()" x-init="init()">
    <!-- Header -->
    <section class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-semibold">User Management</h1>
        <button
            type="button"
            class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black text-sm"
            @click="toggleCreateForm()"
        >
            <span x-show="!showCreateForm">Add User</span>
            <span x-show="showCreateForm">Hide Form</span>
        </button>
    </section>

    <!-- Create User -->
    <section
        class="bg-white border rounded-2xl p-4 mb-4"
        x-show="showCreateForm"
        x-transition.opacity
    >
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-medium">Add User</h2>
        </div>

        <form class="grid md:grid-cols-2 gap-3" @submit.prevent="create">
            <!-- Email -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    Email <span class="text-red-600">*</span>
                </label>
                <input
                    type="email"
                    x-model="form.email"
                    class="border rounded-lg px-3 py-2"
                    placeholder="user@example.com"
                    required
                >
            </div>

            <!-- Display Name -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    Display Name
                </label>
                <input
                    x-model="form.displayName"
                    class="border rounded-lg px-3 py-2"
                    placeholder="Jane Admin"
                >
            </div>

            <!-- Role -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    Role <span class="text-red-600">*</span>
                </label>
                <select
                    x-model="form.role"
                    class="border rounded-lg px-3 py-2"
                    required
                >
                    <template x-for="r in roles" :key="r">
                        <option :value="r" x-text="r"></option>
                    </template>
                </select>
            </div>

            <!-- Active -->
            <div class="flex items-center gap-2 mt-6">
                <input
                    id="create-active"
                    type="checkbox"
                    x-model="form.isActive"
                    class="rounded border-gray-300"
                >
                <label for="create-active" class="text-sm text-gray-700">
                    Active
                </label>
            </div>

            <!-- Generate temporary password -->
            <div class="flex items-center gap-2 md:col-span-2">
                <input
                    id="create-generate-temp"
                    type="checkbox" 
                    x-model="form.generateTempPassword"
                    class="rounded border-gray-300"
                >
                <label for="create-generate-temp" class="text-sm text-gray-700">
                    Generate temporary password
                </label>
            </div>

            <!-- Send invite email -->
            <div class="flex items-center gap-2 md:col-span-2">
                <input
                    id="create-send-invite"
                    type="checkbox"
                    x-model="form.sendInviteEmail"
                    class="rounded border-gray-300"
                >
                <label for="create-send-invite" class="text-sm text-gray-700">
                    Send welcome email
                </label>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    Password <span class="text-red-600">*</span>
                </label>
                <input
                    type="password"
                    x-model="form.password"
                    class="border rounded-lg px-3 py-2"
                    placeholder="••••••••"
                    :required="!form.generateTempPassword"
                    :disabled="form.generateTempPassword"
                >
            </div>

            <!-- Confirm Password -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    Confirm Password <span class="text-red-600">*</span>
                </label>
                <input
                    type="password"
                    x-model="form.passwordConfirm"
                    class="border rounded-lg px-3 py-2"
                    placeholder="••••••••"
                    :required="!form.generateTempPassword"
                    :disabled="form.generateTempPassword"
                >
            </div>

            <!-- Password reset required -->
            <div class="flex items-center gap-2 md:col-span-2">
                <input
                    id="create-prr"
                    type="checkbox"
                    x-model="form.passwordResetRequired"
                    class="rounded border-gray-300"
                >
                <label for="create-prr" class="text-sm text-gray-700">
                    Require password reset on first login
                </label>
            </div>

            <div class="md:col-span-2 flex items-center gap-3 mt-2">
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

    <!-- Users List -->
    <section class="bg-white border rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-medium">All Users</h2>
            <div class="flex items-center gap-3 text-sm">
                <span>
                    Page <span x-text="page"></span> of <span x-text="pages"></span>
                </span>
                <label class="flex items-center gap-1">
                    <span>Per page:</span>
                    <select
                        class="border rounded px-2 py-1"
                        x-model.number="pageSize"
                        @change="changePageSize(pageSize)"
                    >
                        <option :value="10">10</option>
                        <option :value="25">25</option>
                        <option :value="50">50</option>
                    </select>
                </label>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="text-left text-gray-500">
                    <tr>
                        <th class="py-2">Email</th>
                        <th>Display Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Password Reset</th>
                        <th class="w-48">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Skeleton -->
                    <template x-if="loading">
                        <template x-for="i in 8" :key="'user-skel-' + i">
                            <tr class="border-t animate-pulse">
                                <td class="py-2 pr-2">
                                    <div class="h-4 bg-gray-200 rounded w-40"></div>
                                </td>
                                <td><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                                <td><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                                <td><div class="h-4 bg-gray-200 rounded w-20"></div></td>
                                <td><div class="h-4 bg-gray-200 rounded w-20"></div></td>
                                <td><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                                <td><div class="h-4 bg-gray-200 rounded w-40"></div></td>
                            </tr>
                        </template>
                    </template>

                    <!-- Rows -->
                    <template x-if="!loading && rows.length">
                        <template x-for="u in rows" :key="u.id">
                            <tr class="border-t">
                                <td class="py-2 pr-2" x-text="u.email"></td>
                                <td x-text="u.displayName || ''"></td>
                                <td x-text="u.role"></td>
                                <td>
                                    <span
                                        class="px-2 py-0.5 rounded-full text-xs"
                                        :class="u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'"
                                        x-text="u.isActive ? 'Active' : 'Inactive'"
                                    ></span>
                                </td>
                                <td>
                                    <span
                                        class="px-2 py-0.5 rounded-full text-xs"
                                        :class="u.passwordResetRequired ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-700'"
                                        x-text="u.passwordResetRequired ? 'Required' : 'Not required'"
                                    ></span>
                                </td>
                                <td class="whitespace-nowrap">
                                    <button
                                        class="text-blue-700 mr-3"
                                        @click="openEdit(u)"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        class="text-red-700"
                                        @click="remove(u)"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </template>

                    <!-- Empty -->
                    <template x-if="!loading && !rows.length">
                        <tr>
                            <td colspan="7" class="py-4 text-center text-gray-500">
                                No users found.
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <!-- Pagination controls -->
        <div class="flex items-center justify-between mt-3 text-sm">
            <div>
                <span x-text="total"></span> total users
            </div>
            <div class="flex items-center gap-2">
                <button
                    type="button"
                    class="px-3 py-1 border rounded-lg disabled:opacity-50"
                    @click="prevPage()"
                    :disabled="page <= 1"
                >
                    Prev
                </button>
                <button
                    type="button"
                    class="px-3 py-1 border rounded-lg disabled:opacity-50"
                    @click="nextPage()"
                    :disabled="page >= pages"
                >
                    Next
                </button>
            </div>
        </div>

        <p class="text-sm text-red-600 mt-2" x-text="error"></p>
    </section>

    <!-- Edit modal -->
    <div
        x-show="showModal"
        x-transition.opacity
        style="display:none"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
        <div class="bg-white rounded-2xl shadow w-full max-w-lg p-5">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">Edit User</h3>
                <button
                    type="button"
                    class="text-sm text-gray-500 hover:text-gray-800"
                    @click="closeModal()"
                >
                    ✕
                </button>
            </div>

            <form class="grid md:grid-cols-2 gap-3" @submit.prevent>
                <!-- Email -->
                <div class="flex flex-col gap-1 md:col-span-2">
                    <label class="text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        x-model="edit.email"
                        class="border rounded-lg px-3 py-2"
                    >
                </div>

                <!-- Display Name -->
                <div class="flex flex-col gap-1 md:col-span-2">
                    <label class="text-sm font-medium text-gray-700">
                        Display Name
                    </label>
                    <input
                        x-model="edit.displayName"
                        class="border rounded-lg px-3 py-2"
                    >
                </div>

                <!-- Role -->
                <div class="flex flex-col gap-1 md:col-span-2">
                    <label class="text-sm font-medium text-gray-700">
                        Role
                    </label>
                    <select
                        x-model="edit.role"
                        class="border rounded-lg px-3 py-2"
                    >
                        <template x-for="r in roles" :key="'edit-role-' + r">
                            <option :value="r" x-text="r"></option>
                        </template>
                    </select>
                </div>

                <!-- Active -->
                <div class="flex items-center gap-2 md:col-span-2 mt-2">
                    <input
                        id="edit-active"
                        type="checkbox"
                        x-model="edit.isActive"
                        class="rounded border-gray-300"
                    >
                    <label for="edit-active" class="text-sm text-gray-700">
                        Active
                    </label>
                </div>

                <!-- Daily Report -->
                <div class="flex items-center gap-2 md:col-span-2">
                    <input
                        id="edit-daily"
                        type="checkbox"
                        x-model="edit.isDailyReportEnabled"
                        class="rounded border-gray-300"
                    >
                    <label for="edit-daily" class="text-sm text-gray-700">
                        Enable daily report email
                    </label>
                </div>

                <!-- Password reset required -->
                <div class="flex items-center gap-2 md:col-span-2">
                    <input
                        id="edit-prr"
                        type="checkbox"
                        x-model="edit.passwordResetRequired"
                        class="rounded border-gray-300"
                    >
                    <label for="edit-prr" class="text-sm text-gray-700">
                        Require password reset on next login
                    </label>
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
function usersPage() {
    return {
        // Data
        rows: [],
        loading: true,
        error: '',

        page: 1,
        pages: 1,
        pageSize: 25,
        total: 0,

        showCreateForm: false,
        isCreating: false,
        createError: '',

        showModal: false,
        edit: {
            id: null,
            email: '',
            displayName: '',
            role: 'Basic',
            isActive: true,
            isDailyReportEnabled: false,
            passwordResetRequired: false,
        },
        forcePasswordReset: false,
        isSavingEdit: false,
        isDeletingEdit: false,
        editError: '',

        roles: ['Administrator', 'User', 'Basic'],

        form: {
            email: '',
            displayName: '',
            role: 'Basic',
            isActive: true,
            isDailyReportEnabled: false,
            password: '',
            passwordConfirm: '',
            passwordResetRequired: false,
            generateTempPassword: false,
            sendInviteEmail: false,
        },

        toggleCreateForm() {
            this.showCreateForm = !this.showCreateForm;
            if (this.showCreateForm) {
                this.createError = '';
            }
        },

        closeCreateForm() {
            this.showCreateForm = false;
            this.createError = '';
            this.resetForm();
        },

        resetForm() {
            this.form = {
                email: '',
                displayName: '',
                role: 'Basic',
                isActive: true,
                isDailyReportEnabled: false,
                password: '',
                passwordConfirm: '',
                passwordResetRequired: false,
                generateTempPassword: false,
                sendInviteEmail: false,
            };
        },

        async init() {
            await this.load();
        },

        async load() {
            this.loading = true;
            try {
                this.error = '';
                const r = await api(`users?page=${this.page}&limit=${this.pageSize}`);
                const data = r.data || [];
                this.rows = data;
                this.total = r.meta?.total || data.length || 0;
                this.pages = r.meta?.pages || (this.total ? Math.ceil(this.total / this.pageSize) : 1);
            } catch (e) {
                this.error = e.message || 'Failed to load users';
                toast.error(`Failed to load users: ${e.message}`);
            } finally {
                this.loading = false;
            }
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
            if (!s || s < 1) return;
            this.pageSize = s;
            this.page = 1;
            this.load();
        },

        async create() {
            this.isCreating = true;
            this.createError = '';

            try {
                if (!this.form.generateTempPassword) {
                    if (!this.form.password || this.form.password !== this.form.passwordConfirm) {
                        this.createError = 'Passwords do not match.';
                        this.isCreating = false;
                        return;
                    }
                }

                const payload = {
                    email: this.form.email,
                    displayName: this.form.displayName || undefined,
                    role: this.form.role,
                    isActive: this.form.isActive,
                    isDailyReportEnabled: false,
                    passwordResetRequired: this.form.passwordResetRequired,
                    generateTempPassword: this.form.generateTempPassword,
                    sendInviteEmail: this.form.sendInviteEmail,
                };

                if (!this.form.generateTempPassword) {
                    payload.password = this.form.password;
                }

                await api('users', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                toast.success('User created');
                this.resetForm();
                this.showCreateForm = false;
                await this.load();
            } catch (e) {
                this.createError = e.message || 'Failed to create user';
                toast.error(`Failed to create user: ${e.message}`);
            } finally {
                this.isCreating = false;
            }
        },

        openEdit(u) {
            this.edit = {
                id: u.id,
                email: u.email || '',
                displayName: u.displayName || '',
                role: u.role || 'Basic',
                isActive: !!u.isActive,
                isDailyReportEnabled: !!u.isDailyReportEnabled,
                passwordResetRequired: !!u.passwordResetRequired,
            };
            this.editError = '';
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.edit = {
                id: null,
                email: '',
                displayName: '',
                role: 'Basic',
                isActive: true,
                isDailyReportEnabled: false,
                passwordResetRequired: false,
            };
        },

        async saveEdit() {
            if (!this.edit) return;
            this.isSavingEdit = true;
            this.editError = '';
            try {
                const payload = {
                    email: this.edit.email,
                    displayName: this.edit.displayName || null,
                    role: this.edit.role,
                    isActive: this.edit.isActive,
                    isDailyReportEnabled: this.edit.isDailyReportEnabled,
                    passwordResetRequired: this.edit.passwordResetRequired,
                };

                await api(`users/${this.edit.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });

                toast.success('User updated');
                this.showModal = false;
                this.edit = {
                    id: null,
                    email: '',
                    displayName: '',
                    role: 'Basic',
                    isActive: true,
                    isDailyReportEnabled: false,
                    passwordResetRequired: false,
                }                
                await this.load();
            } catch (e) {
                this.editError = e.message || 'Failed to save changes';
                toast.error(`Failed to save changes: ${e.message}`);
            } finally {
                this.isSavingEdit = false;
            }
        },

        async remove(u) {
            if (!u) return;
            if (!confirm(`Delete user ${u.email || u.id}?`)) return;

            this.isDeletingEdit = true;
            this.editError = '';

            try {
                await api(`users/${u.id}`, { method: 'DELETE' });
                toast.success('User deleted');
                this.showModal = false;
                this.edit = {
                    id: null,
                    email: '',
                    displayName: '',
                    role: 'Basic',
                    isActive: true,
                    isDailyReportEnabled: false,
                    passwordResetRequired: false,
                }                
                await this.load();
            } catch (e) {
                this.editError = e.message || 'Failed to delete user';
                toast.error(`Failed to delete user: ${e.message}`);
            } finally {
                this.isDeletingEdit = false;
            }
        },
    }
}
</script>

<?php include __DIR__ . '/../src/footer.php'; ?>
