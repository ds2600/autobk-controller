// web/js/job-modal.js
//
// Reusable "Tail Modal": shows a live-tailing progress modal for a long-running job.
// Pattern: starting the job returns a job id immediately (the caller's request does not
// block), then this polls a log endpoint for new lines since an offset and appends them.
//
// Usage:
//   JobModal.open({
//     title: 'OneNet Version Scrape',
//     startPath: 'eas/onenet-version/run',       // POSTed via the global api() helper
//     startOpts: { method: 'POST' },
//     logPath: (jobId, offset) => `eas/onenet-version/jobs/${jobId}/log?offset=${offset}`,
//     pollMs: 1500,                               // optional, default 1500
//     onStart: (jobId) => {},                     // optional
//     onDone: (job) => {},                        // job: { status, result, error }
//     onError: (err) => {},                       // failed to even start
//   });
window.JobModal = (() => {
    let root = null;
    let pollTimer = null;

    function ensureRoot() {
        if (root) return root;
        root = document.createElement('div');
        root.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40';
        root.style.display = 'none';
        root.innerHTML = `
            <div class="bg-white rounded-2xl shadow w-full max-w-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold job-modal-title"></h3>
                    <span class="text-xs font-medium px-2 py-1 rounded-full job-modal-status"></span>
                </div>
                <pre class="job-modal-log bg-slate-900 text-slate-100 text-xs rounded-lg p-3 h-80 overflow-y-auto whitespace-pre-wrap"></pre>
                <p class="mt-3 text-sm text-red-600 job-modal-error"></p>
                <div class="mt-4 flex justify-end">
                    <button type="button" class="job-modal-close px-4 py-2 rounded-lg border text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(root);
        root.querySelector('.job-modal-close').addEventListener('click', () => close());
        return root;
    }

    function setStatus(text, className) {
        const el = ensureRoot().querySelector('.job-modal-status');
        el.textContent = text;
        el.className = `text-xs font-medium px-2 py-1 rounded-full job-modal-status ${className}`;
    }

    function appendLines(lines) {
        if (!lines.length) return;
        const log = ensureRoot().querySelector('.job-modal-log');
        log.textContent += (log.textContent ? '\n' : '') + lines.join('\n');
        log.scrollTop = log.scrollHeight;
    }

    function close() {
        if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }
        if (root) root.style.display = 'none';
    }

    async function poll(jobId, logPath, pollMs, onDone) {
        let offset = 0;
        const tick = async () => {
            let body;
            try {
                body = (await api(logPath(jobId, offset))).data;
            } catch (e) {
                appendLines([`[poll error: ${e.message || e}]`]);
                pollTimer = setTimeout(tick, pollMs);
                return;
            }

            appendLines(body.lines || []);
            offset = body.nextOffset ?? offset;

            if (body.status === 'running') {
                pollTimer = setTimeout(tick, pollMs);
                return;
            }

            pollTimer = null;
            const closeBtn = ensureRoot().querySelector('.job-modal-close');
            closeBtn.disabled = false;

            if (body.status === 'succeeded') {
                setStatus('Succeeded', 'bg-green-100 text-green-700');
            } else {
                setStatus('Failed', 'bg-red-100 text-red-700');
                ensureRoot().querySelector('.job-modal-error').textContent = body.error || '';
            }

            if (onDone) onDone(body);
        };
        tick();
    }

    return {
        open({ title, startPath, startOpts = {}, logPath, pollMs = 1500, onStart, onDone, onError }) {
            const el = ensureRoot();
            el.querySelector('.job-modal-title').textContent = title;
            el.querySelector('.job-modal-log').textContent = '';
            el.querySelector('.job-modal-error').textContent = '';
            const closeBtn = el.querySelector('.job-modal-close');
            closeBtn.disabled = true;
            setStatus('Starting…', 'bg-slate-100 text-slate-700');
            el.style.display = 'flex';

            api(startPath, startOpts)
                .then((res) => {
                    const jobId = res.data?.jobId;
                    setStatus('Running…', 'bg-blue-100 text-blue-700');
                    if (onStart) onStart(jobId);
                    poll(jobId, logPath, pollMs, onDone);
                })
                .catch((e) => {
                    closeBtn.disabled = false;
                    setStatus('Failed', 'bg-red-100 text-red-700');
                    el.querySelector('.job-modal-error').textContent = e.message || 'Failed to start job';
                    if (onError) onError(e);
                });
        },
        close,
    };
})();
