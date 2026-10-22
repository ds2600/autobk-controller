// ------------------------------------------------------------
// src/modules/eas/eas.service.ts
// ------------------------------------------------------------
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { env } from "../../config/env";
import { EAS_ONENET_SCRIPT, EAS_OUTPUT_DIR } from "../../config/constants";
import { writeAuditLog } from "../../utils/audit";

const ONENET_REPORT_PATTERN = /^onenet_version_scrape_.*\.csv$/i;
const JOB_RETENTION_MS = 60 * 60 * 1000;
const MAX_LOG_LINES = 2000;

interface EasReportFile {
    name: string;
    fullPath: string;
    generatedAt: string;
}

export type EasJobStatus = "running" | "succeeded" | "failed";

export interface EasJob {
    id: string;
    status: EasJobStatus;
    lines: string[];
    startedAt: string;
    finishedAt?: string;
    error?: string;
    result?: EasReportFile;
}

interface AuditMeta {
    actorUserId?: number;
    requestId?: string;
    ip?: string;
    userAgent?: string;
}

// In-memory only: the API and agent run on the same box and a scrape takes minutes, not
// hours, so losing job state on a process restart is an acceptable trade for not needing
// a persistence layer for a single on-demand admin action.
const jobs = new Map<string, EasJob>();
let activeJobId: string | null = null;

function findLatestOneNetReport(): EasReportFile | null {
    if (!EAS_OUTPUT_DIR || !fs.existsSync(EAS_OUTPUT_DIR)) return null;

    const reports = fs.readdirSync(EAS_OUTPUT_DIR)
        .filter((name) => ONENET_REPORT_PATTERN.test(name))
        .map((name) => {
            const fullPath = path.join(EAS_OUTPUT_DIR, name);
            return { name, fullPath, mtimeMs: fs.statSync(fullPath).mtimeMs };
        })
        .sort((a, b) => b.mtimeMs - a.mtimeMs);

    if (reports.length === 0) return null;
    const latest = reports[0];
    return { name: latest.name, fullPath: latest.fullPath, generatedAt: new Date(latest.mtimeMs).toISOString() };
}

function appendLine(job: EasJob, line: string) {
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

function runOneNetProcess(job: EasJob, reqMeta: AuditMeta) {
    const proc = spawn(env.AGENT_PYTHON, [EAS_ONENET_SCRIPT], {
        cwd: path.dirname(EAS_ONENET_SCRIPT),
    });

    let settled = false;

    const timer = setTimeout(() => {
        settled = true;
        proc.kill("SIGTERM");
        finish(job, "failed", { error: "OneNet version scrape timed out" }, reqMeta);
    }, env.EAS_RUN_TIMEOUT_MS);

    if (proc.stdout) pipeLines(proc.stdout, (line) => appendLine(job, line));
    if (proc.stderr) pipeLines(proc.stderr, (line) => appendLine(job, line));

    proc.on("error", (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        finish(job, "failed", { error: err.message }, reqMeta);
    });

    proc.on("close", (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        if (code !== 0) {
            finish(job, "failed", { error: `Script exited with code ${code}` }, reqMeta);
            return;
        }

        const latest = findLatestOneNetReport();
        if (!latest) {
            finish(job, "failed", { error: "Scrape finished but no report file was found" }, reqMeta);
            return;
        }
        finish(job, "succeeded", { result: latest }, reqMeta);
    });
}

function finish(
    job: EasJob,
    status: "succeeded" | "failed",
    details: { result?: EasReportFile; error?: string },
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
        action: status === "succeeded" ? "run" : "run_failed",
        resourceType: "EasOneNetVersionScrape",
        resourceId: job.result?.name || job.id,
        after: status === "succeeded" ? job.result : { error: job.error },
        ...reqMeta,
    }).catch(() => { /* audit logging failures shouldn't affect job state */ });

    setTimeout(() => jobs.delete(job.id), JOB_RETENTION_MS);
}

export const easService = {
    startOneNetVersionScrape(reqMeta: AuditMeta): EasJob {
        if (activeJobId) {
            const existing = jobs.get(activeJobId);
            if (existing) return existing;
            activeJobId = null;
        }

        if (!EAS_OUTPUT_DIR) {
            throw Object.assign(new Error("Agent's autobk.ini has no [EAS] Directory configured"), {
                status: 500,
                code: "EAS_NOT_CONFIGURED",
            });
        }

        const job: EasJob = {
            id: randomUUID(),
            status: "running",
            lines: [],
            startedAt: new Date().toISOString(),
        };
        jobs.set(job.id, job);
        activeJobId = job.id;

        runOneNetProcess(job, reqMeta);

        return job;
    },

    getJob(jobId: string): EasJob {
        const job = jobs.get(jobId);
        if (!job) {
            throw Object.assign(new Error("Job not found"), { status: 404, code: "EAS_JOB_NOT_FOUND" });
        }
        return job;
    },

    async getLatestOneNetReport() {
        const latest = findLatestOneNetReport();
        if (!latest) {
            throw Object.assign(new Error("No OneNet version report has been generated yet"), {
                status: 404,
                code: "ONENET_REPORT_MISSING",
            });
        }
        return latest;
    },
};
