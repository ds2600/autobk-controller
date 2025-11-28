<?php
require __DIR__ . '/../src/bootstrap.php';

$user = require_auth();
$isAdmin = isset($user->role) && $user->role === 'Administrator';
checkForcePasswordReset();

$title = 'My Profile - AutoBk Controller';

include __DIR__ . '/../src/head.php';
include __DIR__ . '/../src/components/navbar.php';
?>

<main class="max-w-3xl mx-auto p-4" x-data="profilePage()" x-init="init()">
    <section class="mb-4">
        <h1 class="text-xl font-semibold">My Profile</h1>
        <p class="text-sm text-gray-600">
            Manage your account details and notification settings.
        </p>
    </section>
    <!-- Loading state -->
    <section
        class="bg-white border rounded-2xl p-4 mb-4 animate-pulse"
        x-show="loading"
    >
        <div class="mb-4">
            <div class="h-5 bg-gray-200 rounded w-40 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-64"></div>
        </div>

        <div class="space-y-3">
            <div>
                <div class="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div class="h-9 bg-gray-200 rounded w-full"></div>
            </div>
            <div class="flex items-center gap-2 mt-2">
                <div class="h-4 bg-gray-200 rounded w-5"></div>
                <div class="h-3 bg-gray-200 rounded w-48"></div>
            </div>
        </div>
    </section>

    <!-- Account settings -->
    <section class="bg-white border rounded-2xl p-4 mb-4" x-show="!loading">
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-medium">Account Settings</h2>
        </div>

        <form class="grid gap-3" @submit.prevent="saveProfile">
            <!-- Email -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    Email <span class="text-red-600">*</span>
                </label>
                <input
                    type="email"
                    x-model="form.email"
                    class="border rounded-lg px-3 py-2"
                    placeholder="you@example.com"
                    required
                >
            </div>

            <!-- Daily report -->
            <div class="flex items-center gap-2 mt-1">
                <input
                    id="daily-report"
                    type="checkbox"
                    x-model="form.isDailyReportEnabled"
                    class="rounded border-gray-300"
                >
                <label for="daily-report" class="text-sm text-gray-700">
                    Enable daily report email
                </label>
            </div>

            <div class="flex items-center gap-3 mt-3">
                <button
                    type="submit"
                    class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
                    :disabled="savingProfile"
                >
                    <span x-show="!savingProfile">Save Changes</span>
                    <span x-show="savingProfile">Saving…</span>
                </button>

                <span class="text-sm text-red-600" x-text="profileError"></span>
                <span class="text-sm text-green-700" x-text="profileSuccess"></span>
            </div>
        </form>
    </section>

    <!-- Change password -->
    <section class="bg-white border rounded-2xl p-4" x-show="!loading">
        <div class="flex items-center justify-between mb-3">
            <h2 class="font-medium">Change Password</h2>
        </div>

        <form class="grid gap-3" @submit.prevent="changePassword">
            <!-- Current password -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    Current Password <span class="text-red-600">*</span>
                </label>
                <input
                    type="password"
                    x-model="pwd.currentPassword"
                    class="border rounded-lg px-3 py-2"
                    placeholder="••••••••"
                    required
                >
            </div>

            <!-- New password -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    New Password <span class="text-red-600">*</span>
                </label>
                <input
                    type="password"
                    x-model="pwd.newPassword"
                    class="border rounded-lg px-3 py-2"
                    placeholder="••••••••"
                    required
                >
            </div>

            <!-- Confirm new password -->
            <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                    Confirm New Password <span class="text-red-600">*</span>
                </label>
                <input
                    type="password"
                    x-model="pwd.confirmPassword"
                    class="border rounded-lg px-3 py-2"
                    placeholder="••••••••"
                    required
                >
            </div>

            <div class="flex items-center gap-3 mt-3">
                <button
                    type="submit"
                    class="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
                    :disabled="changingPassword"
                >
                    <span x-show="!changingPassword">Update Password</span>
                    <span x-show="changingPassword">Updating…</span>
                </button>

                <span class="text-sm text-red-600" x-text="passwordError"></span>
                <span class="text-sm text-green-700" x-text="passwordSuccess"></span>
            </div>
        </form>
    </section>
</main>

<script>
function profilePage() {
    const PROFILE_ENDPOINT = 'users/me';
    const CHANGE_PASSWORD_ENDPOINT = 'auth/change-password';

    return {
        form: {
            email: '',
            isDailyReportEnabled: false,
        },
        pwd: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },

        loading: true,
        savingProfile: false,
        changingPassword: false,

        profileError: '',
        profileSuccess: '',
        passwordError: '',
        passwordSuccess: '',

        async init() {
            await this.loadProfile();
        },

        async loadProfile() {
            this.loading = true;
            this.profileError = '';
            try {
                const r = await api(PROFILE_ENDPOINT);
                const u = r.data || r;

                this.form.email = u.email || '';
                this.form.isDailyReportEnabled = !!u.isDailyReportEnabled;
            } catch (e) {
                this.profileError = e.message || 'Failed to load profile';
                toast.error(`Failed to load profile: ${e.message}`);
            } finally {
                this.loading = false;
            }
        },

        async saveProfile() {
            this.savingProfile = true;
            this.profileError = '';
            this.profileSuccess = '';
            try {
                const payload = {
                    email: this.form.email,
                    isDailyReportEnabled: this.form.isDailyReportEnabled,
                };

                await api(PROFILE_ENDPOINT, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });

                this.profileSuccess = 'Profile updated';
                toast.success('Profile updated');
            } catch (e) {
                this.profileError = e.message || 'Failed to update profile';
                toast.error(`Failed to update profile: ${e.message}`);
            } finally {
                this.savingProfile = false;
            }
        },

        async changePassword() {
            this.changingPassword = true;
            this.passwordError = '';
            this.passwordSuccess = '';

            try {
                if (!this.pwd.newPassword || this.pwd.newPassword !== this.pwd.confirmPassword) {
                    this.passwordError = 'New passwords do not match.';
                    this.changingPassword = false;
                    return;
                }

                const payload = {
                    currentPassword: this.pwd.currentPassword,
                    newPassword: this.pwd.newPassword,
                    confirmPassword: this.pwd.confirmPassword,
                };

                await api(CHANGE_PASSWORD_ENDPOINT, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                this.passwordSuccess = 'Password updated';
                toast.success('Password updated');

                this.pwd.currentPassword = '';
                this.pwd.newPassword = '';
                this.pwd.confirmPassword = '';
            } catch (e) {
                this.passwordError = e.message || 'Failed to update password';
                toast.error(`Failed to update password: ${e.message}`);
            } finally {
                this.changingPassword = false;
            }
        },
    }
}
</script>

<?php include __DIR__ . '/../src/footer.php'; ?>

