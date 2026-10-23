// ------------------------------------------------------------
// src/modules/agentUpdates/agentUpdates.service.ts
// ------------------------------------------------------------
import path from "path";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { env } from "../../config/env";
import { AGENT_UPDATE_SCRIPT } from "../../config/constants";
import { writeAuditLog } from "../../utils/audit";

const JOB_RETENTION_MS = 60 * 60 * 1000;
const MAX_LOG_LINES = 2000;
const CHECK_TIMEOUT_MS = 20 * 1000;
const DOWNLOAD_TIMEOUT_MS = 2 * 60 * 1000;
const APPLY_TIMEOUT_MS = 20 * 60 * 1000; // venv rebuild (pip install) is the slow step here

export type AgentUpdateJobKind = "download" | "apply" | "rollback";
export type AgentUpdateJobStatus = "running" | "succeeded" | "failed";

export interface AgentUpdateJob {
    id: string;
    kind: AgentUpdateJobKind;
    status: AgentUpdateJobStatus;
    lines: string[];
    startedAt: string;
    finishedAt?: string;
    error?: string;
    result?: any;
}

interface AuditMeta {
    actorUserId?: number;
    requestId?: string;
    ip?: string;
    userAgent?: string;
}

// In-memory only -- same trade-off as eas.service.ts: the API and agent run on the same
// box, a download/apply/rollback takes seconds to minutes, not hours, so losing job state
// on an API process restart is acceptable for an on-demand admin action.
const jobs = new Map<string, AgentUpdateJob>();
let activeJobId: string | null = null;

function appendLine(job: AgentUpdateJob, line: string) {
    if (!line) return;
    job.lines.push(line);
    if (job.lines.length > MAX_LOG_LINES) job.lines.splice(0, job.lines.length - MAX_LOG_LINES);
}

// Buffers raw stdout/stderr chunks into whole lines (chunks don't align to line boundaries).
function pipeLines(stream: NodeJS.ReadableStream, onLine: (line: string) => void) {
    let buffer = "";
    stream.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();
        let idx: number;
        while ((idx = buffer.indexOf("\n")) >= 0) {
            onLine(buffer.slice(0, idx).replace(/\r$/, ""));
            buffer = buffer.slice(idx + 1);
        }
    });
    stream.on("end", () => {
        if (buffer) onLine(buffer);
        buffer = "";
    });
}

// usr_autobk_update.py prints human-readable progress lines, then exactly one JSON line as
// its last line of output on success (its top-level except prints a plain error message as
// the last line instead, on failure) -- same "stdout is the contract" convention the EAS
// OneNet script already uses for its own error line. This finds that last non-empty line.
function parseLastJsonLine(lines: string[]): any | null {
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (!line) continue;
        try {
            return JSON.parse(line);
        } catch {
            return null;
        }
    }
    return null;
}

// Runs usr_autobk_update.py with the given args and resolves once it exits. `-u` disables
// Python's stdout block-buffering on a pipe, so progress lines stream live instead of only
// appearing once the whole process exits (the Node-side equivalent of why updates.service.ts
// runs npm/composer through a pty via `script`).
function runScript(
    args: string[],
    { timeoutMs, onLine }: { timeoutMs: number; onLine?: (line: string) => void }
): Promise<{ code: number | null; lines: string[] }> {
    return new Promise((resolve, reject) => {
        const proc = spawn(env.AGENT_PYTHON, ["-u", AGENT_UPDATE_SCRIPT, ...args], {
            cwd: path.dirname(AGENT_UPDATE_SCRIPT),
        });

        const lines: string[] = [];
        let settled = false;
        const record = (line: string) => {
            lines.push(line);
            onLine?.(line);
        };

        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            proc.kill("SIGTERM");
            reject(Object.assign(new Error("Agent update script timed out"), { code: "AGENT_UPDATE_TIMEOUT" }));
        }, timeoutMs);

        if (proc.stdout) pipeLines(proc.stdout, record);
        if (proc.stderr) pipeLines(proc.stderr, record);

        proc.on("error", (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(err);
        });

        proc.on("close", (code) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({ code, lines });
        });
    });
}

function finish(
    job: AgentUpdateJob,
    status: "succeeded" | "failed",
    details: { result?: any; error?: string },
    reqMeta: AuditMeta
) {
    job.status = status;
    job.finishedAt = new Date().toISOString();
    job.result = details.result;
    job.error = details.error;

    if (activeJobId === job.id) activeJobId = null;

    // Fires after the HTTP request that started the job has long since returned, so the
    // completion audit entry has to be written here rather than from the controller.
    writeAuditLog({
        action: status === "succeeded" ? job.kind : `${job.kind}_failed`,
        resourceType: "AgentUpdateJob",
        resourceId: job.id,
        after: status === "succeeded" ? job.result : { error: job.error },
        ...reqMeta,
    }).catch(() => { /* audit logging failures shouldn't affect job state */ });

    setTimeout(() => jobs.delete(job.id), JOB_RETENTION_MS);
}

function startJob(kind: AgentUpdateJobKind, args: string[], timeoutMs: number, reqMeta: AuditMeta): AgentUpdateJob {
    if (activeJobId) {
        const existing = jobs.get(activeJobId);
        if (existing) return existing;
        activeJobId = null;
    }

    const job: AgentUpdateJob = {
        id: randomUUID(),
        kind,
        status: "running",
        lines: [],
        startedAt: new Date().toISOString(),
    };
    jobs.set(job.id, job);
    activeJobId = job.id;

    runScript(args, { timeoutMs, onLine: (line) => appendLine(job, line) })
        .then(({ code }) => {
            if (code !== 0) {
                const lastLine = job.lines[job.lines.length - 1];
                finish(job, "failed", { error: lastLine || `Script exited with code ${code}` }, reqMeta);
                return;
            }
            const result = parseLastJsonLine(job.lines);
            if (result === null) {
                finish(job, "failed", { error: "Script succeeded but produced no parseable result" }, reqMeta);
                return;
            }
            finish(job, "succeeded", { result }, reqMeta);
        })
        .catch((err) => {
            finish(job, "failed", { error: err.message }, reqMeta);
        });

    return job;
}

export const agentUpdatesService = {
    async checkForUpdate() {
        try {
            const { code, lines } = await runScript(["--check"], { timeoutMs: CHECK_TIMEOUT_MS });
            const result = code === 0 ? parseLastJsonLine(lines) : null;
            if (result !== null) return result;
        } catch {
            // fall through to the fail-safe below
        }
        // Fail-safe: never surface a false "update available" just because the script
        // itself couldn't run (agent not installed yet, wrong AGENT_PYTHON/AGENT_DIR, a
        // GitHub outage already handled inside usr_autobk_update.py's own --check).
        return { currentVersion: null, latestVersion: null, isUpToDate: true, checkFailed: true };
    },

    startDownload(version: string, reqMeta: AuditMeta): AgentUpdateJob {
        if (!version) {
            throw Object.assign(new Error("version is required"), { status: 400, code: "AGENT_UPDATE_VERSION_REQUIRED" });
        }
        return startJob("download", ["--download", version], DOWNLOAD_TIMEOUT_MS, reqMeta);
    },

    startApply(stagingId: string, reqMeta: AuditMeta): AgentUpdateJob {
        if (!stagingId) {
            throw Object.assign(new Error("stagingId is required"), { status: 400, code: "AGENT_UPDATE_STAGING_ID_REQUIRED" });
        }
        return startJob("apply", ["--apply", stagingId], APPLY_TIMEOUT_MS, reqMeta);
    },

    startRollback(reqMeta: AuditMeta): AgentUpdateJob {
        return startJob("rollback", ["--rollback"], APPLY_TIMEOUT_MS, reqMeta);
    },

    getJob(jobId: string): AgentUpdateJob {
        const job = jobs.get(jobId);
        if (!job) {
            throw Object.assign(new Error("Job not found"), { status: 404, code: "AGENT_UPDATE_JOB_NOT_FOUND" });
        }
        return job;
    },
};
