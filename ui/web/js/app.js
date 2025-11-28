// web/js/app.js

document.addEventListener('alpine:init', () => {
    Alpine.store('load', {
        active: false,
        count: 0,
        on() {
            this.count++;
            this.active = true;
        },
        off() {
            this.count = Math.max(0, this.count - 1);
            if (this.count === 0) this.active = false;
        },
    });

    Alpine.store('toasts', {
        list: [],
        counter: 0,

        show(message, type = 'info', timeout = 15000) {
            const id = ++this.counter;
            this.list.push({ id, message, type, visible: true });

            if (timeout) {
                setTimeout(() => {
                    this.hide(id);
                }, timeout);
            }
        },

        hide(id) {
            const toast = this.list.find(t => t.id === id);
            if (toast) {
                toast.visible = false;
                setTimeout(() => {
                    this.list = this.list.filter(t => t.id !== id);
                }, 300);
            }
        },
    });

    window.toast = {
        success(msg, timeout) {
            Alpine.store('toasts').show(msg, 'success', timeout);
        },
        error(msg, timeout) {
            Alpine.store('toasts').show(msg, 'error', timeout);
        },
        info(msg, timeout) {
            Alpine.store('toasts').show(msg, 'info', timeout);
        },
        warning(msg, timeout) {
            Alpine.store('toasts').show(msg, 'warning', timeout);
        },
    };
});

const API_BROWSER_BASE = window.APP_CONFIG?.apiBrowserBase || '/api';

async function api(path, opts = {}) {
    if (window.Alpine?.store) Alpine.store('load')?.on();
    try {
        const res = await fetch(API_BROWSER_BASE + 'v1/' + path, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
            ...opts,
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error?.message || res.statusText || 'Request failed');
        return body;
    } finally {
        if (window.Alpine?.store) Alpine.store('load')?.off();
    }
}

function requireAuth() {
  return api('/auth/me', { method: 'GET' })
    .catch(() => { location.href = './login.php'; });
}

