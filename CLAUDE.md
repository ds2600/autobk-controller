# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AutoBk Controller: a web UI + API for managing a fleet of AutoBk backup agents (devices). Three independently-run pieces:

- `api/` — Express/TypeScript REST API, Prisma/MariaDB-backed, talks to agents via their `autobk.ini` and (for EAS) their venv python3.
- `ui/` — Server-rendered PHP frontend (plain PHP pages in `ui/web/`, shared components in `ui/src/components/`, Composer-managed deps). No JS SPA framework — pages call the API directly (via cURL server-side, e.g. `backups.php`, or client-side fetch) and render server-side.
- An external **AutoBk agent** (separate repo, lives at the path in `AGENT_DIR`) — the API reads/writes its `autobk.ini` and invokes its scripts (e.g. EAS report scripts) directly on the host filesystem. The API and the agent are expected to run on the same box.

## Commands

All from `api/`:

```bash
npm run dev                        # tsx src/server.ts, dev server
npm run build && npm start         # compile to dist/, run compiled
npx prisma migrate deploy          # apply migrations
npx prisma generate                # regen Prisma client after schema.prisma changes
npm run db:seed -- --create-admin-user   # seed admin from ADMIN_EMAIL/ADMIN_PASSWORD
npm run db:seed -- --devices=X           # seed X test devices
npm run db:seed -- --seed-test-data      # seed test device data
npm run job:send-last24-report     # run the daily report job manually (compiled)
npm run job:test-last24-report     # same job via ts-node, for dev
```

There is no lint config and no test suite in this repo (`api/package.json` has no `lint`/`test` script) — don't assume `npm test` or `npm run lint` exist.

`ui/` has no build step: Composer installs PHP deps (`composer install`), and pages are served directly (PHP-FPM/Apache/Nginx). There's no `npm run` anything on the UI side.

## Architecture

### API module layout

Each feature under `api/src/modules/<name>/` follows the same four-file split — look at `devices/` or the new `eas/` module as the template:

- `<name>.router.ts` — route definitions, wires `authRequired`/`adminOnly` middleware per-route
- `<name>.controller.ts` — Express handlers: pull `reqMeta` off `req`, call the service, wrap the result in `buildSuccess`/`buildError`, catch and map thrown errors to HTTP status via `error.status`/`error.code`
- `<name>.service.ts` — business logic, Prisma calls, throws `Object.assign(new Error(...), { status, code })` for controller-mappable errors
- `<name>.schemas.ts` / `<name>.types.ts` — zod validation schemas and types (not every module needs these, e.g. `eas` doesn't)

New routers get registered in `api/src/app.ts` under `/${apiVersion}/<name>`.

### Response envelope

Every API response — success or error — is wrapped via `api/src/utils/envelope.ts` (`buildSuccess`/`buildError`): `{ success, data, error, meta: { requestId, timestamp } }`. This is a hard standard for this project, not optional per-endpoint — new endpoints must use it.

### Auth

JWT-based (`api/src/middleware/auth.ts`), token read from either `Authorization: Bearer` or the `autobk_jwt` cookie (cookie auth is how the PHP UI's server-side cURL calls authenticate — see `backups.php`). `authRequired` populates `req.user`; `adminOnly` checks `req.user.role === ROLES.ADMIN`. Roles are `Administrator` / `User` / `Basic` (`api/src/config/constants.ts`).

### Config loading has two layers

1. `api/src/config/env.ts` — zod-validated `process.env`, fails fast on missing/invalid vars.
2. `api/src/config/constants.ts` — on top of env vars, this **also synchronously reads and parses the agent's `autobk.ini`** (at `AGENT_DIR/autobk.ini`) at module-import time, deriving things like `BACKUP_HZ` and `EAS_OUTPUT_DIR` (from the agent's own `[EAS] Directory=` setting). If that file is missing or malformed, the whole API fails to start — this isn't scoped to just the features that use it.

### Caching

Redis is optional (`REDIS_ENABLE`); `getRedis()` returns `null` when disabled and all cache helpers (`api/src/utils/redis.ts`: `getOrSetCache`, `invalidateCache`) no-op safely in that case — don't assume Redis is present. Cache keys are versioned prefixes (e.g. `devices:summary:v1:`); mutations that affect a cached list must call `invalidateCache(prefix)` themselves — it's not automatic.

### Long-running operations: the Tail Modal pattern

The `eas` module runs agent-side Python scripts on demand (`child_process.spawn`, using `AGENT_PYTHON` as the interpreter) and reads their CSV output back from `EAS_OUTPUT_DIR`. It does **not** block the triggering HTTP request — `eas.service.ts` tracks an in-memory `Map<string, EasJob>` keyed by job id, `POST .../run` returns `202 { jobId, status }` immediately, and `GET .../jobs/:jobId/log?offset=` streams back `{ status, lines, nextOffset, result, error }` as the job progresses. `ui/web/js/job-modal.js` (`window.JobModal.open({ startPath, logPath, ... })`) is a generic, reusable client for this exact contract — any new long-running action (see `updates` module's apply/rollback jobs, and `agentUpdates`' download/apply/rollback jobs) should follow the same shape rather than reinventing it. Job state is in-memory only (lost on a process restart), which is an acceptable trade for an on-demand admin action whose triggering request has long since returned by the time it matters — `updates`' apply/rollback jobs are the one case where that restart actually happens *because of* the job itself, so they mark the job's terminal status before exiting the process (see `updates.service.ts`'s `scheduleRestart` comment) rather than relying on in-memory state surviving. `agentUpdates` is the same job shape applied to a *different* process: it drives `usr_autobk_update.py` in the sibling autobk-agent checkout (via `AGENT_PYTHON`/`AGENT_UPDATE_SCRIPT`, same invocation pattern as `eas`), and parses that script's last stdout line as JSON for `result` — the API process itself never restarts for this module, only the agent's systemd service does (see autobk-agent's `srvc_autobk.py` restart-sentinel check).

### Audit logging

Mutating actions call `writeAuditLog` (`api/src/utils/audit.ts`) with `{ action, resourceType, resourceId, before?, after?, actorUserId, requestId, ip, userAgent }`. `AuditLog` is pruned by the `pruneAudit` job.

### Database

Prisma models (`api/prisma/schema.prisma`): `Device`, `Backup`, `Schedule`, `User`, `PasswordReset`, `AuditLog`, `AppSetting`. MariaDB/MySQL in production (see `README.md` for the `CREATE DATABASE ... utf8mb4` setup).

### UI pages

Plain PHP under `ui/web/*.php`, each starting with `require __DIR__ . '/../src/bootstrap.php'` then `require_auth()` / role checks. Pages either call the API server-side via cURL with the `autobk_jwt` cookie forwarded as a Bearer token (file downloads/proxying, e.g. `backups.php`), or call it client-side. Shared chrome lives in `ui/src/components/` (e.g. `navbar.php`, `devices/device_navbar.php`).

### Versioning

`VERSION` (API) and `ui/VERSION` (UI) are bumped together per the global semantic-versioning rule — check both are in sync when reviewing a version bump.

Bumping the version does **not** by itself trigger a release — `.github/workflows/release.yml` only runs on an actual pushed tag (`push: tags: v*.*.*`). Whenever a version bump lands on `main` (whether done directly, or merged from a branch), always give the user the exact tag/push commands needed to trigger the release build, e.g.:
```bash
git checkout main && git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```
Don't assume the user will know to do this or remember the syntax — state it explicitly every time, right after the version bump is in place on `main`.
