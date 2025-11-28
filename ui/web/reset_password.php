<?php
require __DIR__ . '/../src/bootstrap.php';

$user = require_auth();

$title = 'Reset Password - AutoBk Controller';

include __DIR__ . '/../src/head.php';
include __DIR__ . '/../src/components/navbar.php';
?>

<main class="max-w-md mx-auto p-4" x-data="resetPasswordPage()">
    <section class="mb-4">
        <h1 class="text-xl font-semibold">Reset Your Password</h1>
        <p class="text-sm text-gray-600">
            You must set a new password before continuing.
        </p>
    </section>

    <section class="bg-white border rounded-2xl p-4">
        <form class="grid gap-3" @submit.prevent="submit">
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
                    :disabled="submitting"
                >
                    <span x-show="!submitting">Update Password</span>
                    <span x-show="submitting">Updating…</span>
                </button>

                <span class="text-sm text-red-600" x-text="error"></span>
                <span class="text-sm text-green-700" x-text="success"></span>
            </div>
        </form>
    </section>
</main>

<script>
function resetPasswordPage() {
    const CHANGE_PASSWORD_ENDPOINT = 'auth/change-password';

    return {
        pwd: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        submitting: false,
        error: '',
        success: '',

        async submit() {
            this.submitting = true;
            this.error = '';
            this.success = '';

            try {
                if (!this.pwd.newPassword || this.pwd.newPassword !== this.pwd.confirmPassword) {
                    this.error = 'New passwords do not match.';
                    this.submitting = false;
                    return;
                }

                const payload = {
                    currentPassword: this.pwd.currentPassword,
                    newPassword: this.pwd.newPassword,
                    confirmPassword: this.pwd.confirmPassword, // backend can ignore if it wants
                };

                await api(CHANGE_PASSWORD_ENDPOINT, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                this.success = 'Password updated. Redirecting…';
                toast.success('Password updated');

                // Clear fields
                this.pwd.currentPassword = '';
                this.pwd.newPassword = '';
                this.pwd.confirmPassword = '';

                setTimeout(() => {
                    window.location.href = '/login.php?resetPassword=true';
                }, 1000);
            } catch (e) {
                this.error = e.message || 'Failed to update password';
                toast.error(`Failed to update password: ${e.message}`);
            } finally {
                this.submitting = false;
            }
        },
    }
}
</script>

<?php include __DIR__ . '/../src/footer.php'; ?>

