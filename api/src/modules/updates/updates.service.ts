// ------------------------------------------------------------
// src/modules/updates/updates.service.ts
// ------------------------------------------------------------
import fs from "fs";
import os from "os";
import path from "path";
import crypto, { randomUUID } from "crypto";
import { spawn } from "child_process";
import * as tar from "tar";
import { env } from "../../config/env";
import { VERSION, GITHUB_REPO } from "../../config/constants";
import { getOrSetCache } from "../../utils/redis";
import { writeAuditLog } from "../../utils/audit";
import { prisma } from "../../db/prisma";

const JOB_RETENTION_MS = 60 * 60 * 1000;
const MAX_LOG_LINES = 2000;
const PREVIOUS_RELEASE_SETTING_KEY = "updates.previousRelease";

// Derived from RELEASES_DIR rather than their own env vars -- this is one feature's internal
// layout, not something a deployment needs to tune independently (see README.md's
// "Self-Update" section for the full directory structure).
const INSTALL_ROOT = path.dirname(path.resolve(env.RELEASES_DIR));
const CURRENT_SYMLINK = path.join(INSTALL_ROOT, "current");
const SHARED_DIR = path.join(INSTALL_ROOT, "shared");
const STAGING_DIR = path.join(INSTALL_ROOT, "var", "updates", "staging");

export type JobStatus = "running" | "succeeded" | "failed";

export interface UpdateJob {
    id: string;
    kind: "apply" | "rollback";
    status: JobStatus;
    lines: string[];
    startedAt: string;
    finishedAt?: string;
    error?: string;
    result?: { version: string };
}

interface ReleaseManifest {
    version: string;
    builtAt: string;
    gitSha: string;
    components: string[];
}

interface AuditMeta {
    actorUserId?: number;
    requestId?: string;
    ip?: string;
    userAgent?: string;
}

// In-memory only, same trade-off as eas.service.ts's job map: this API and the apply job it's
// tracking run on the same box, and the one wrinkle unique to THIS job is that a successful
// apply deliberately exits the process (see finishApply's restart-ordering comment below) --
// so the terminal status must be written and observable by a client poll before that happens,
// not persisted for recovery after.
const jobs = new Map<string, UpdateJob>();
let activeJobId: string | null = null;

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_PATTERN = /\x1b\[[0-9;]*[a-zA-Z]/g;

function appendLine(job: UpdateJob, line: string) {
    if (!line) return;
    // Running under a pty (see runStep) makes npm/composer/prisma emit color codes they'd
    // otherwise suppress when piped -- strip them so the Tail Modal shows plain text.
    const clean = line.replace(ANSI_ESCAPE_PATTERN, "");
    if (!clean) return;
    job.lines.push(clean);
    if (job.lines.length > MAX_LOG_LINES) job.lines.splice(0, job.lines.length - MAX_LOG_LINES);
}

function shellQuote(arg: string): string {
    return `'${arg.replace(/'/g, `'\\''`)}'`;
}

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

function runStep(job: UpdateJob, command: string, args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        appendLine(job, `$ ${command} ${args.join(" ")} (in ${cwd})`);

        // Piped stdout (what spawn() gives a child by default) makes npm/composer/prisma
        // switch to fully-buffered output -- nothing shows up until the process exits,
        // which is why the Tail Modal only updated once a step finished instead of
        // line-by-line. `script` allocates a real pty for the child, so it behaves like it
        // would run interactively (line-buffered, flushed as it goes); -f/--flush also
        // forces script's own copy to our pipe to flush immediately rather than buffering.
        const fullCommand = [command, ...args].map(shellQuote).join(" ");
        const proc = spawn("script", ["-qfe", "-c", fullCommand, "/dev/null"], {
            cwd,
            // systemd runs this process as root with no login shell, so HOME is often
            // unset in process.env -- composer hard-fails without it ("HOME or
            // COMPOSER_HOME must be set"), and separately refuses to run as root at all
            // without this flag. Both only matter to composer, but setting them
            // unconditionally is harmless for the npm/prisma steps too.
            env: {
                ...process.env,
                HOME: process.env.HOME || os.homedir(),
                COMPOSER_ALLOW_SUPERUSER: "1",
            },
        });
        if (proc.stdout) pipeLines(proc.stdout, (line) => appendLine(job, line));
        if (proc.stderr) pipeLines(proc.stderr, (line) => appendLine(job, line));
        proc.on("error", (err) => reject(err));
        proc.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`${command} exited with code ${code}`));
                return;
            }
            resolve();
        });
    });
}

function compareSemver(a: string, b: string): number {
    const normalize = (v: string) => (v || "").replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
    const aa = normalize(a);
    const bb = normalize(b);
    for (let i = 0; i < 3; i++) {
        const diff = (aa[i] ?? 0) - (bb[i] ?? 0);
        if (diff !== 0) return diff > 0 ? 1 : -1;
    }
    return 0;
}

async function githubRequest(url: string): Promise<any> {
    const headers: Record<string, string> = {
        "User-Agent": "AutoBk-Controller",
        Accept: "application/vnd.github+json",
    };
    if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
        throw Object.assign(new Error(`GitHub API request failed (${res.status})`), {
            status: 502,
            code: "GITHUB_REQUEST_FAILED",
        });
    }
    return res.json();
}

async function fetchLatestRelease(): Promise<any> {
    return getOrSetCache(
        "updates:latest",
        env.CACHE_TTL_GITHUB_RELEASE,
        () => githubRequest(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
    );
}

function findAssetUrl(release: any, suffix: string): string | null {
    const asset = (release.assets || []).find((a: any) => a.name?.endsWith(suffix));
    return asset?.browser_download_url || null;
}

function finishJob(job: UpdateJob, status: "succeeded" | "failed", details: { result?: { version: string }; error?: string }, reqMeta: AuditMeta) {
    job.status = status;
    job.finishedAt = new Date().toISOString();
    job.result = details.result;
    job.error = details.error;

    if (activeJobId === job.id) activeJobId = null;

    writeAuditLog({
        action: status === "succeeded" ? job.kind : `${job.kind}_failed`,
        resourceType: "UpdateJob",
        resourceId: job.result?.version || job.id,
        after: status === "succeeded" ? job.result : { error: job.error },
        ...reqMeta,
    }).catch(() => { /* audit logging failures shouldn't affect job state */ });

    setTimeout(() => jobs.delete(job.id), JOB_RETENTION_MS);
}

// The job must reach a terminal status that a client's poll can observe BEFORE the process
// exits -- otherwise the new process boots with an empty in-memory job map, and the Tail
// Modal's poll loop (which retries forever on a fetch error) 404s against it forever instead
// of ever showing "Succeeded." Giving two poll intervals of headroom lets the in-flight/next
// poll land on the terminal status first. The process manager (systemd/pm2) must be
// configured to auto-restart, since this deliberately kills the process.
function scheduleRestart() {
    setTimeout(() => process.exit(0), 3000);
}

// The PHP side never restarts on its own -- PHP-FPM just keeps running and caching
// compiled bytecode (opcache) for whatever files it first read, completely independent of
// what `current` points to now. Every swap needs this, or PHP pages silently keep serving
// whatever version was live the last time PHP-FPM happened to restart, no matter how many
// releases have been applied since. Logged but non-fatal: the Node side already succeeded
// and `current` already points at the new release by the time this runs, so a failure here
// shouldn't roll any of that back -- it just means this one manual step still needs doing.
async function restartPhpFpm(job: UpdateJob): Promise<void> {
    try {
        await runStep(job, "systemctl", ["restart", env.PHP_FPM_SERVICE], "/");
    } catch (err: any) {
        appendLine(job, `WARNING: failed to restart ${env.PHP_FPM_SERVICE} (${err.message}) -- PHP pages may keep serving the old release until it's restarted manually`);
    }
}

function runApply(job: UpdateJob, stagingId: string, reqMeta: AuditMeta) {
    (async () => {
        try {
            const stagingDir = path.join(STAGING_DIR, stagingId);
            const manifestPath = path.join(stagingDir, "manifest.json");
            if (!fs.existsSync(manifestPath)) {
                throw new Error("Staged bundle is missing manifest.json -- was it already applied/cleaned up?");
            }
            const manifest: ReleaseManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
            const releaseDir = path.join(env.RELEASES_DIR, manifest.version);

            appendLine(job, `Applying v${manifest.version} (built ${manifest.builtAt}, ${manifest.gitSha})`);

            let previousRelease: string | null = null;
            if (fs.existsSync(CURRENT_SYMLINK)) {
                previousRelease = fs.readlinkSync(CURRENT_SYMLINK);
                appendLine(job, `Current release before this apply: ${previousRelease}`);
            }

            if (fs.existsSync(releaseDir)) {
                throw new Error(`Release directory ${releaseDir} already exists`);
            }
            fs.mkdirSync(path.dirname(releaseDir), { recursive: true });
            fs.renameSync(stagingDir, releaseDir);
            appendLine(job, `Moved staged bundle to ${releaseDir}`);

            // .env holds secrets and is never part of the bundle (kept out of source control
            // per this project's standing rule) -- every release symlinks the one persistent
            // copy in shared/ instead of getting its own.
            const sharedEnvPath = path.join(SHARED_DIR, ".env");
            if (fs.existsSync(sharedEnvPath)) {
                fs.symlinkSync(sharedEnvPath, path.join(releaseDir, "api", ".env"));
                appendLine(job, "Linked api/.env from shared/.env");
            } else {
                appendLine(job, `WARNING: ${sharedEnvPath} not found -- new release's api/.env will be missing`);
            }

            // TLS certs referenced by nginx (e.g. current/certs/...) are server-specific the
            // same way .env is -- never part of the bundle, so every release needs the same
            // symlink-from-shared treatment. Optional: not every deployment terminates TLS
            // with certs living inside the release tree, so skip silently if there's nothing
            // in shared/certs to link.
            const sharedCertsPath = path.join(SHARED_DIR, "certs");
            if (fs.existsSync(sharedCertsPath)) {
                fs.symlinkSync(sharedCertsPath, path.join(releaseDir, "certs"));
                appendLine(job, "Linked certs/ from shared/certs");
            }

            // If either of these two steps fails, `current` is never touched below, so the
            // running service keeps serving the old release untouched -- that's the whole
            // rollback story for a failed apply, no extra step needed.
            await runStep(job, "npm", ["ci", "--omit=dev"], path.join(releaseDir, "api"));
            await runStep(job, "composer", ["install", "--no-dev"], path.join(releaseDir, "ui"));
            await runStep(job, "npx", ["prisma", "migrate", "deploy"], path.join(releaseDir, "api"));

            const tmpLink = `${CURRENT_SYMLINK}.tmp`;
            if (fs.existsSync(tmpLink)) fs.unlinkSync(tmpLink);
            fs.symlinkSync(releaseDir, tmpLink);
            fs.renameSync(tmpLink, CURRENT_SYMLINK);
            appendLine(job, `Repointed current -> ${releaseDir}`);

            await restartPhpFpm(job);

            if (previousRelease) {
                await prisma.appSetting.upsert({
                    where: { key: PREVIOUS_RELEASE_SETTING_KEY },
                    update: { value: previousRelease, updatedBy: reqMeta.actorUserId },
                    create: { key: PREVIOUS_RELEASE_SETTING_KEY, value: previousRelease, updatedBy: reqMeta.actorUserId },
                });
            }

            appendLine(job, `Update to v${manifest.version} applied successfully. Restarting...`);
            finishJob(job, "succeeded", { result: { version: manifest.version } }, reqMeta);
            scheduleRestart();
        } catch (err: any) {
            appendLine(job, `ERROR: ${err.message}`);
            finishJob(job, "failed", { error: err.message }, reqMeta);
            // No restart on failure -- `current` was never touched, so the process that's
            // already running (old release) just keeps running as-is.
        }
    })();
}

function runRollback(job: UpdateJob, previousRelease: string, reqMeta: AuditMeta) {
    (async () => {
        try {
            if (!fs.existsSync(previousRelease)) {
                throw new Error(`Previous release directory ${previousRelease} no longer exists`);
            }
            appendLine(job, `Rolling back to ${previousRelease}`);

            const tmpLink = `${CURRENT_SYMLINK}.tmp`;
            if (fs.existsSync(tmpLink)) fs.unlinkSync(tmpLink);
            fs.symlinkSync(previousRelease, tmpLink);
            fs.renameSync(tmpLink, CURRENT_SYMLINK);
            appendLine(job, `Repointed current -> ${previousRelease}`);

            await restartPhpFpm(job);

            // No migration step here: this project's schema changes are additive-only, so
            // older code running against a newer schema is expected to be safe without a
            // migration-down step (see CLAUDE.md's Data Portability & Schema Safety rule).
            const version = path.basename(previousRelease);
            appendLine(job, `Rollback to v${version} complete. Restarting...`);
            finishJob(job, "succeeded", { result: { version } }, reqMeta);
            scheduleRestart();
        } catch (err: any) {
            appendLine(job, `ERROR: ${err.message}`);
            finishJob(job, "failed", { error: err.message }, reqMeta);
        }
    })();
}

export const updatesService = {
    async checkForUpdate() {
        try {
            const release = await fetchLatestRelease();
            const latestVersion = String(release.tag_name || "").replace(/^v/, "");
            return {
                currentVersion: VERSION,
                latestVersion,
                isUpToDate: compareSemver(VERSION, latestVersion) >= 0,
                releaseUrl: release.html_url || null,
                publishedAt: release.published_at || null,
                checkFailed: false,
            };
        } catch {
            return {
                currentVersion: VERSION,
                latestVersion: null,
                isUpToDate: true,
                releaseUrl: null,
                publishedAt: null,
                checkFailed: true,
            };
        }
    },

    // Validates and stages an uploaded release bundle; does not touch the running install.
    // The checksum is verified against the matching GitHub release's published .sha256 asset
    // (fetched live) rather than trusting a second uploaded file, so a corrupted or tampered
    // upload is rejected before anything is extracted into place.
    async uploadBundle(uploadedPath: string, originalName: string, reqMeta: AuditMeta) {
        const versionMatch = originalName.match(/^autobk-controller-v(\d+\.\d+\.\d+)\.tar\.gz$/);
        if (!versionMatch) {
            fs.unlinkSync(uploadedPath);
            throw Object.assign(new Error("Expected a file named autobk-controller-vX.Y.Z.tar.gz"), {
                status: 400,
                code: "UPDATES_BAD_FILENAME",
            });
        }
        const version = versionMatch[1];

        const hash = crypto.createHash("sha256");
        hash.update(fs.readFileSync(uploadedPath));
        const actualChecksum = hash.digest("hex");

        let release: any;
        try {
            release = await githubRequest(`https://api.github.com/repos/${GITHUB_REPO}/releases/tags/v${version}`);
        } catch {
            fs.unlinkSync(uploadedPath);
            throw Object.assign(new Error(`Could not find a v${version} release on GitHub to verify this bundle against`), {
                status: 502,
                code: "UPDATES_CHECKSUM_UNVERIFIABLE",
            });
        }

        const checksumAssetUrl = findAssetUrl(release, ".tar.gz.sha256");
        if (!checksumAssetUrl) {
            fs.unlinkSync(uploadedPath);
            throw Object.assign(new Error(`v${version} release has no .sha256 asset to verify against`), {
                status: 502,
                code: "UPDATES_CHECKSUM_UNVERIFIABLE",
            });
        }
        const checksumRes = await fetch(checksumAssetUrl);
        const expectedChecksum = (await checksumRes.text()).trim().split(/\s+/)[0];

        if (actualChecksum !== expectedChecksum) {
            fs.unlinkSync(uploadedPath);
            throw Object.assign(new Error("Checksum mismatch -- this file does not match the published release"), {
                status: 400,
                code: "UPDATES_CHECKSUM_MISMATCH",
            });
        }

        const stagingId = randomUUID();
        const stagingDir = path.join(STAGING_DIR, stagingId);
        fs.mkdirSync(stagingDir, { recursive: true });
        await tar.x({ file: uploadedPath, cwd: stagingDir });
        fs.unlinkSync(uploadedPath);

        const manifestPath = path.join(stagingDir, "manifest.json");
        if (!fs.existsSync(manifestPath)) {
            fs.rmSync(stagingDir, { recursive: true, force: true });
            throw Object.assign(new Error("Bundle has no manifest.json"), {
                status: 400,
                code: "UPDATES_BAD_BUNDLE",
            });
        }
        const manifest: ReleaseManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

        await writeAuditLog({
            action: "upload",
            resourceType: "UpdateBundle",
            resourceId: manifest.version,
            after: manifest,
            ...reqMeta,
        });

        return { stagingId, manifest };
    },

    startApply(stagingId: string, reqMeta: AuditMeta): UpdateJob {
        if (activeJobId) {
            const existing = jobs.get(activeJobId);
            if (existing) return existing;
            activeJobId = null;
        }

        const stagingDir = path.join(STAGING_DIR, stagingId);
        if (!fs.existsSync(stagingDir)) {
            throw Object.assign(new Error("Staged bundle not found -- upload it again"), {
                status: 404,
                code: "UPDATES_STAGING_NOT_FOUND",
            });
        }

        const job: UpdateJob = { id: randomUUID(), kind: "apply", status: "running", lines: [], startedAt: new Date().toISOString() };
        jobs.set(job.id, job);
        activeJobId = job.id;
        runApply(job, stagingId, reqMeta);
        return job;
    },

    async startRollback(reqMeta: AuditMeta): Promise<UpdateJob> {
        if (activeJobId) {
            const existing = jobs.get(activeJobId);
            if (existing) return existing;
            activeJobId = null;
        }

        const setting = await prisma.appSetting.findUnique({ where: { key: PREVIOUS_RELEASE_SETTING_KEY } });
        if (!setting?.value) {
            throw Object.assign(new Error("No previous release on record to roll back to"), {
                status: 404,
                code: "UPDATES_NO_PREVIOUS_RELEASE",
            });
        }

        const job: UpdateJob = { id: randomUUID(), kind: "rollback", status: "running", lines: [], startedAt: new Date().toISOString() };
        jobs.set(job.id, job);
        activeJobId = job.id;
        runRollback(job, setting.value, reqMeta);
        return job;
    },

    getJob(jobId: string): UpdateJob {
        const job = jobs.get(jobId);
        if (!job) {
            throw Object.assign(new Error("Job not found"), { status: 404, code: "UPDATES_JOB_NOT_FOUND" });
        }
        return job;
    },
};
